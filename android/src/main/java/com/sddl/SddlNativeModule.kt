package com.sddl.rnsdk

import android.content.ClipboardManager
import android.content.Context
import com.facebook.react.bridge.*

class SddlNativeModule(private val reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "SddlNative"

  @ReactMethod
  fun getAppIdentifier(promise: Promise) {
    try {
      promise.resolve(reactContext.packageName)
    } catch (e: Exception) {
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun readClipboard(promise: Promise) {
    try {
      val cm = reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      val txt = cm.primaryClip?.getItemAt(0)?.coerceToText(reactContext)?.toString()?.trim() ?: ""
      promise.resolve(if (txt.isEmpty()) null else txt)
    } catch (e: Exception) {
      promise.resolve(null)
    }
  }
}
