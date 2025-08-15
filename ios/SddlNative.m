#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SddlNative, NSObject)

RCT_EXTERN_METHOD(getAppIdentifier:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(readClipboard:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
