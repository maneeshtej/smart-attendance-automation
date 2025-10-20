package com.smart.ble

import android.bluetooth.le.*
import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.min

class TeacherBle(private val context: ReactApplicationContext) {

    private val TAG = "TeacherBle"

    private val bt: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private val scanner = bt?.bluetoothLeScanner
    private val advertiser = bt?.bluetoothLeAdvertiser

    private val foundStudents = mutableSetOf<String>()
    private val ackedStudents = mutableSetOf<String>()

    private var scanCallback: ScanCallback? = null
    private var advertiseCallback: AdvertiseCallback? = null

    // Coroutine scope for BLE tasks
    private val bleScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    // Prevent overlapping advertise jobs
    private val advertisingInProgress = AtomicBoolean(false)

    // Cache last name we wrote to avoid unnecessary writes
    @Volatile
    private var lastAdapterName: String? = null

    // Maximum safe local name length (conservative)
    private val MAX_LOCAL_NAME = 26

    // Safe emit to JS (avoid crashing the native bridge)
    private fun emitSafe(event: String, msg: String) {
        try {
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(event, msg)
        } catch (e: Exception) {
            Log.e(TAG, "Emit failed: ${e.message}")
        }
    }

    fun startTeacherMode(subjectId: String) {
        if (bt == null || !bt.isEnabled) {
            emitSafe("bleError", "Bluetooth unavailable or disabled")
            return
        }

        emitSafe("bleStatus", "Teacher mode started")
        setupScanner(subjectId)
    }

    private fun setupScanner(subjectId: String) {
        scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                try {
                    // Prefer scanRecord.deviceName but fall back to device.name
                    val name = result?.scanRecord?.deviceName ?: result?.device?.name ?: return
                    if (name.startsWith("AB:")) {
                        // AB:<id>:Z  -> split and get id safely
                        val parts = name.split(":")
                        if (parts.size >= 2) {
                            val studentId = parts[1].trim()
                            if (studentId.isNotEmpty() && foundStudents.add(studentId)) {
                                emitSafe("studentDetected", "Student $studentId found")
                                // Launch ack advertise job (non-blocking)
                                advertiseAck(subjectId)
                            }
                        }
                    }
                } catch (e: Exception) {
                    emitSafe("bleError", "Scan result handling error: ${e.message}")
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
    }

    private fun advertiseAck(subjectId: String) {
        // If an advertise job is already running, let it finish: avoid overlapping name writes.
        if (advertisingInProgress.get()) {
            emitSafe("bleStatus", "Advertise already in progress, will include new IDs in next cycle")
            return
        }

        val newStudentsSnapshot = synchronized(foundStudents) {
            foundStudents.filterNot { ackedStudents.contains(it) }
        }

        if (newStudentsSnapshot.isEmpty()) {
            emitSafe("bleStatus", "No new students to ACK.")
            return
        }

        // Start coroutine job
        bleScope.launch {
            if (!advertisingInProgress.compareAndSet(false, true)) return@launch
            try {
                // Batch students conservatively (4 per batch as before)
                val chunks = newStudentsSnapshot.chunked(4)

                chunks.forEachIndexed { index, group ->
                    // Re-check if these students were acked in the meantime
                    val groupToSend = group.filterNot { ackedStudents.contains(it) }
                    if (groupToSend.isEmpty()) return@forEachIndexed

                    // Build ack name and ensure safe ASCII + length
                    var ackName = "AC:${groupToSend.joinToString(",")}:$subjectId:Z"
                    ackName = sanitizeLocalName(ackName)

                    // Avoid rewriting same adapter name repeatedly
                    val shouldWriteName = lastAdapterName != ackName
                    try {
                        if (shouldWriteName) {
                            val writeOk = safeSetAdapterName(ackName)
                            if (!writeOk) {
                                emitSafe("bleError", "Failed to set adapter name for ACK: $ackName")
                                // still try advertising, sometimes name change isn't necessary for visibility
                            } else {
                                lastAdapterName = ackName
                            }
                        }

                        emitSafe("ackBroadcast", "Advertising new ACK (${index + 1}/${chunks.size}): $ackName")

                        // Create advertise settings (use 1s window for reliability)
                        advertiseCallback = object : AdvertiseCallback() {
                            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                                emitSafe("bleStatus", "ACK batch ${index + 1} started")
                            }

                            override fun onStartFailure(errorCode: Int) {
                                emitSafe("bleError", "ACK batch ${index + 1} failed: $errorCode")
                            }
                        }

                        val settings = AdvertiseSettings.Builder()
                            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                            .setTimeout(1000) // 1000 ms advertise window
                            .build()

                        val data = AdvertiseData.Builder()
                            .setIncludeDeviceName(true) // rely on local name
                            .build()

                        try {
                            advertiser?.startAdvertising(settings, data, advertiseCallback)
                        } catch (e: Exception) {
                            emitSafe("bleError", "startAdvertising exception: ${e.message}")
                        }

                        // Wait for the advertised duration + small buffer
                        delay(1100)

                        try {
                            advertiser?.stopAdvertising(advertiseCallback)
                        } catch (e: Exception) {
                            emitSafe("bleError", "stopAdvertising exception: ${e.message}")
                        }

                        // Mark acked
                        synchronized(ackedStudents) {
                            ackedStudents.addAll(groupToSend)
                        }
                        emitSafe("bleStatus", "ACK batch ${index + 1} completed")
                    } catch (e: Exception) {
                        emitSafe("bleError", "Advertise exception in batch ${index + 1}: ${e.message}")
                    } finally {
                        // small pause before next batch to avoid hammering the stack
                        delay(200)
                    }
                }

                emitSafe("bleStatus", "New ACK batches completed (${chunks.size} total)")
            } finally {
                advertisingInProgress.set(false)
            }
        }
    }

    private fun sanitizeLocalName(raw: String): String {
        // Keep ASCII letters, digits, colon and comma only and trim length
        val filtered = raw.filter { ch ->
            ch.code in 32..126 && (ch.isLetterOrDigit() || ch == ':' || ch == ',' || ch == 'Z' )
        }
        // Truncate conservatively to MAX_LOCAL_NAME
        return if (filtered.length > MAX_LOCAL_NAME) filtered.substring(0, MAX_LOCAL_NAME) else filtered
    }

    private fun safeSetAdapterName(name: String): Boolean {
        return try {
            // Some devices ignore or reject name writes; guard and catch exceptions
            // Avoid writing if same as current adapter name
            val current = bt?.name
            if (current == name) return true
            bt?.name = name
            // small pause to let adapter apply name (non-blocking here, callers wait before advertising)
            Thread.sleep(50)
            true
        } catch (e: Exception) {
            Log.e(TAG, "setAdapterName failed: ${e.message}")
            false
        }
    }

    fun stopTeacherMode() {
        try {
            // Cancel any ongoing coroutine jobs
            bleScope.coroutineContext.cancelChildren()

            // Stop advertising if in progress
            advertiseCallback?.let {
                try {
                    advertiser?.stopAdvertising(it)
                } catch (e: Exception) {
                    Log.e(TAG, "stopAdvertising failed: ${e.message}")
                }
                advertiseCallback = null
            }

            // Stop scanning
            scanCallback?.let {
                try {
                    scanner?.stopScan(it)
                } catch (e: Exception) {
                    Log.e(TAG, "stopScan failed: ${e.message}")
                }
                scanCallback = null
            }

            foundStudents.clear()
            ackedStudents.clear()
            lastAdapterName = null
            advertisingInProgress.set(false)

            emitSafe("bleStatus", "Teacher mode stopped and cleared")
        } catch (e: Exception) {
            emitSafe("bleError", "Stop failed: ${e.message}")
        }
    }
}
