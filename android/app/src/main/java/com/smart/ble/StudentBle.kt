package com.smart.ble

import android.bluetooth.le.*
import android.bluetooth.BluetoothAdapter
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import kotlin.math.pow

class StudentBle(private val context: ReactApplicationContext) {

    private val TAG = "StudentBle"

    private val bt: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private val advertiser = bt?.bluetoothLeAdvertiser
    private val scanner = bt?.bluetoothLeScanner

    private var advertiseCallback: AdvertiseCallback? = null
    private var scanCallback: ScanCallback? = null

    private val bleScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var active = false

    private val MAX_LOCAL_NAME = 26

    private fun emitSafe(event: String, msg: String) {
        try {
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(event, msg)
        } catch (e: Exception) {
            Log.e(TAG, "Emit failed: ${e.message}")
        }
    }

    fun startStudentMode(studentId: String) {
        if (bt == null || !bt.isEnabled) {
            emitSafe("bleError", "Bluetooth unavailable or disabled")
            return
        }
        if (active) {
            emitSafe("bleStatus", "Already running student mode")
            return
        }

        active = true
        val advName = sanitizeLocalName("AB:$studentId:Z")
        safeSetAdapterName(advName)
        emitSafe("bleStatus", "Student mode started: $advName")

        // --- Advertising setup ---
        advertiseCallback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                emitSafe("bleStatus", "Advertising as $advName")
            }
            override fun onStartFailure(errorCode: Int) {
                emitSafe("bleError", "Advertise failed: $errorCode")
            }
        }

        val advSettings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(false)
            .build()

        val advData = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .build()

        try {
            advertiser?.startAdvertising(advSettings, advData, advertiseCallback)
        } catch (e: Exception) {
            emitSafe("bleError", "startAdvertising failed: ${e.message}")
        }

        // --- Scanning setup ---
        scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                try {
                    val name = result?.scanRecord?.deviceName ?: result?.device?.name ?: return
                    val rssi = result.rssi

                    // Rough distance (TxPower≈-59 dBm, N≈2)
                    val distance = 10.0.pow((-59 - rssi) / 20.0)
                    emitSafe("rssiInfo", "RSSI $rssi dBm (~${"%.1f".format(distance)} m)")

                    if (rssi < -75) return // ignore far signals

                    if (name.startsWith("AC:")) {
                        val parts = name.split(":")
                        if (parts.size >= 4) {
                            val studentList = parts[1].split(",")
                            if (studentList.contains(studentId)) {
                                val subjectId = parts[2]
                                emitSafe("ackReceived", "ACK for subject $subjectId")
                                stopStudentMode()
                            }
                        }
                    }
                } catch (e: Exception) {
                    emitSafe("bleError", "Scan handling error: ${e.message}")
                }
            }

            override fun onScanFailed(errorCode: Int) {
                emitSafe("bleError", "Scan failed: $errorCode")
            }
        }

        val scanSettings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        try {
            scanner?.startScan(null, scanSettings, scanCallback)
        } catch (e: Exception) {
            emitSafe("bleError", "startScan failed: ${e.message}")
        }

        // --- Periodic advert refresh (for reliability) ---
        bleScope.launch {
            while (active) {
                try {
                    advertiser?.stopAdvertising(advertiseCallback)
                    delay(100)
                    advertiser?.startAdvertising(advSettings, advData, advertiseCallback)
                } catch (e: Exception) {
                    emitSafe("bleError", "Advertise refresh failed: ${e.message}")
                }
                delay(2000) // refresh every 2 s for stability
            }
        }
    }

    fun stopStudentMode() {
        try {
            active = false
            bleScope.coroutineContext.cancelChildren()

            advertiseCallback?.let {
                advertiser?.stopAdvertising(it)
                advertiseCallback = null
            }
            scanCallback?.let {
                scanner?.stopScan(it)
                scanCallback = null
            }

            emitSafe("bleStatus", "Student mode stopped")
        } catch (e: Exception) {
            emitSafe("bleError", "Stop failed: ${e.message}")
        }
    }

    // --- Helpers ---

    private fun sanitizeLocalName(raw: String): String {
        val filtered = raw.filter { it.code in 32..126 && (it.isLetterOrDigit() || it == ':' || it == ',' || it == 'Z') }
        return if (filtered.length > MAX_LOCAL_NAME) filtered.substring(0, MAX_LOCAL_NAME) else filtered
    }

    private fun safeSetAdapterName(name: String) {
        try {
            val current = bt?.name
            if (current != name) {
                bt?.name = name
                Thread.sleep(50)
            }
        } catch (e: Exception) {
            Log.e(TAG, "setAdapterName failed: ${e.message}")
        }
    }
}
