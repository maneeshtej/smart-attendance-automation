package com.smart.ble

import android.bluetooth.le.*
import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class StudentBle(private val context: ReactApplicationContext) {

    private val bt = BluetoothAdapter.getDefaultAdapter()
    private val advertiser = bt.bluetoothLeAdvertiser
    private val scanner = bt.bluetoothLeScanner
    private var active = false

    private fun emit(event: String, msg: String) {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, msg)
    }

    fun startStudentMode(studentId: String) {
        if (bt == null || !bt.isEnabled) {
            emit("bleError", "Bluetooth unavailable or disabled")
            return
        }

        active = true
        val advName = "AB:$studentId:Z"
        bt.name = advName
        emit("bleStatus", "Student mode started: $advName")

        advertiser.startAdvertising(
            AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setConnectable(false)
                .build(),
            AdvertiseData.Builder().setIncludeDeviceName(true).build(),
            object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                    emit("bleStatus", "Advertising as $advName")
                }

                override fun onStartFailure(errorCode: Int) {
                    emit("bleError", "Advertise failed: $errorCode")
                }
            }
        )

        val scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
    val name = result?.scanRecord?.deviceName ?: return
    val rssi = result.rssi

    // 🔹 Estimate distance (TxPower ≈ -59, N ≈ 2)
    val distance = Math.pow(10.0, ((-59 - rssi).toDouble() / (10 * 2)))
    emit("rssiInfo", "RSSI: $rssi dBm (~${"%.1f".format(distance)} m)")

    // 🔹 Filter: ignore far devices
    if (rssi < -75) return   // roughly >1.5–2 m away

    if (name.startsWith("AC:")) {
        val parts = name.split(":")
        if (parts.size >= 4) {
            val studentList = parts[1].split(",")
            if (studentList.contains(studentId)) {
                val subjectId = parts[2]
                emit("ackReceived", "ACK for subject $subjectId")
                stopStudentMode()
            }
        }
    }
}


            override fun onScanFailed(errorCode: Int) {
                emit("bleError", "Scan failed: $errorCode")
            }
        }

        scanner.startScan(null, ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build(), scanCallback)
    }

    fun stopStudentMode() {
        try {
            advertiser?.stopAdvertising(object : AdvertiseCallback() {})
            scanner?.stopScan(object : ScanCallback() {})
            active = false
            emit("bleStatus", "Student mode stopped")
        } catch (e: Exception) {
            emit("bleError", "Stop failed: ${e.message}")
        }
    }
}
