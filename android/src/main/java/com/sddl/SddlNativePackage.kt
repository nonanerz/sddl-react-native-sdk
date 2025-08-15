package com.sddl.rnsdk

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.bridge.NativeModule

class SddlNativePackage : ReactPackage {
  override fun createNativeModules(rc: ReactApplicationContext): List<NativeModule> =
    listOf(SddlNativeModule(rc))

  override fun createViewManagers(rc: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}
