package com.smart.ble

import android.bluetooth.le.*
import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class TeacherBle(private val context: ReactApplicationContext) {

    private val bt = BluetoothAdapter.getDefaultAdapter()
    private val scanner = bt?.bluetoothLeScanner
    private val advertiser = bt?.bluetoothLeAdvertiser

    private var scanning = false
    private val foundStudents = mutableSetOf<String>()
    private val ackedStudents = mutableSetOf<String>()

    private var scanCallback: ScanCallback? = null
    private var advertiseCallback: AdvertiseCallback? = null

    private fun emit(event: String, msg: String) {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, msg)
    }

    fun startTeacherMode(subjectId: String) {
        if (bt == null || !bt.isEnabled) {
            emit("bleError", "Bluetooth unavailable or disabled")
            return
        }

        emit("bleStatus", "Teacher mode started")
        scanning = true

        scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                val name = result?.scanRecord?.deviceName ?: return
                if (name.startsWith("AB:")) {
                    val studentId = name.split(":")[1]
                    if (foundStudents.add(studentId)) {
                        emit("studentDetected", "Student $studentId found")
                        advertiseAck(subjectId)
                    }
                }
            }

            override fun onScanFailed(errorCode: Int) {
                emit("bleError", "Scan failed: $errorCode")
            }
        }

        val scanSettings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        scanner?.startScan(null, scanSettings, scanCallback)
    }

    private fun advertiseAck(subjectId: String) {
        try {
            val newStudents = foundStudents.filterNot { ackedStudents.contains(it) }
            if (newStudents.isEmpty()) {
                emit("bleStatus", "No new students to ACK.")
                return
            }

            val chunks = newStudents.chunked(4)

            Thread {
                chunks.forEachIndexed { index, group ->
                    val ackName = "AC:${group.joinToString(",")}:$subjectId:Z"
                    try {
                        bt?.name = ackName
                        emit("ackBroadcast", "Advertising new ACK ($index/${chunks.size}): $ackName")

                        advertiseCallback = object : AdvertiseCallback() {
                            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                                emit("bleStatus", "ACK batch $index sent successfully")
                            }

                            override fun onStartFailure(errorCode: Int) {
                                emit("bleError", "ACK batch $index failed: $errorCode")
                            }
                        }

                        val settings = AdvertiseSettings.Builder()
                            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                            .setTimeout(500) // ✅ increased timeout for stability
                            .build()

                        val data = AdvertiseData.Builder()
                            .setIncludeDeviceName(true)
                            .build()

                        advertiser?.startAdvertising(settings, data, advertiseCallback)
                        Thread.sleep(500) // ✅ wait matching timeout
                        advertiser?.stopAdvertising(advertiseCallback)

                        ackedStudents.addAll(group)
                    } catch (e: Exception) {
                        emit("bleError", "Advertise exception in batch $index: ${e.message}")
                    }
                }

                emit("bleStatus", "New ACK batches completed (${chunks.size} total)")
            }.start()

        } catch (e: Exception) {
            emit("bleError", "AdvertiseAck failed: ${e.message}")
        }
    }

    fun stopTeacherMode() {
    try {
        // ✅ Stop advertising safely
        advertiseCallback?.let {
            advertiser?.stopAdvertising(it)
            advertiseCallback = null
        }

        // ✅ Stop scanning safely
        scanCallback?.let {
            scanner?.stopScan(it)
            scanCallback = null
        }

        scanning = false
        emit("bleStatus", "Teacher mode stopped")

        foundStudents.clear()
        ackedStudents.clear()
        emit("bleStatus", "Cleared captured student and ACK lists")
    } catch (e: Exception) {
        emit("bleError", "Stop failed safely: ${e.message}")
    }
}

}
