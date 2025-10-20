package com.smart.ble

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class BleModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val teacherBle = TeacherBle(reactContext)
    private val studentBle = StudentBle(reactContext)
    private var currentMode: String? = null

    override fun getName(): String = "BleModule"

    @ReactMethod
    fun startTeacherMode(subjectId: String) {
        try {
            currentMode = "teacher"
            teacherBle.startTeacherMode(subjectId)
        } catch (e: Exception) {
            emit("bleError", "Teacher start failed: ${e.message}")
        }
    }

    @ReactMethod
    fun startStudentMode(studentId: String) {
        try {
            currentMode = "student"
            studentBle.startStudentMode(studentId)
        } catch (e: Exception) {
            emit("bleError", "Student start failed: ${e.message}")
        }
    }

    @ReactMethod
    fun stopAll() {
        try {
            when (currentMode) {
                "teacher" -> teacherBle.stopTeacherMode()
                "student" -> studentBle.stopStudentMode()
            }
            currentMode = null
            emit("bleStatus", "All BLE operations stopped")
        } catch (e: Exception) {
            emit("bleError", "Stop failed: ${e.message}")
        }
    }

    private fun emit(event: String, message: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, message)
    }
}
