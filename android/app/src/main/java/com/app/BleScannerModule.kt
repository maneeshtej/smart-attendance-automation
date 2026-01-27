package com.app // Check your package name in AndroidManifest.xml

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class BleScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var bluetoothAdapter: BluetoothAdapter? = null
    private val scanner by lazy { bluetoothAdapter?.bluetoothLeScanner }

    init {
        val bluetoothManager = reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothAdapter = bluetoothManager.adapter
    }

    override fun getName(): String = "BleScannerModule"

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val deviceName = result.device.name ?: result.scanRecord?.deviceName ?: "Unknown"
            val deviceId = result.device.address
            val rssi = result.rssi

            val map = Arguments.createMap()
            map.putString("name", deviceName)
            map.putString("id", deviceId)
            map.putInt("rssi", rssi)

            // Stream the result immediately to JS
            sendEvent("onDeviceFound", map)
        }
    }

    @ReactMethod
    fun startNativeScan() {
        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            // 🔥 ADD THIS LINE to ensure you get updates when the name changes
            .setReportDelay(0) 
            .build()
        
        // Some Android versions require a specific match mode for rapid updates
        // .setMatchMode(ScanSettings.MATCH_MODE_AGGRESSIVE) 

        scanner?.startScan(null, settings, scanCallback)
    }

    @ReactMethod
    fun stopNativeScan() {
        scanner?.stopScan(scanCallback)
    }
}