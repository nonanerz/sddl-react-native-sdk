import Foundation
import UIKit
import React

@objc(SddlNative)
class SddlNative: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool { true }

  @objc(getAppIdentifier:rejecter:)
  func getAppIdentifier(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) {
    let bid = Bundle.main.bundleIdentifier
    resolve(bid)
  }

  @objc(readClipboard:rejecter:)
  func readClipboard(_ resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) {
    let raw = UIPasteboard.general.string?.trimmingCharacters(in: .whitespacesAndNewlines)
    if let s = raw, !s.isEmpty {
      resolve(s)
    } else {
      resolve(nil)
    }
  }
}
