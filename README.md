# SDDL React Native SDK

Official React Native SDK for SDDL. Handles **deferred deep links** end‑to‑end with minimal app code. Works alongside iOS **Universal Links** and Android **App Links**.

---

## Installation

> Autolinking is supported. No extra native setup is required beyond the platform link capabilities below.

```bash
# with npm	npm i @sddl/react-native-sdk
# or yarn	yarn add @sddl/react-native-sdk
# or pnpm	pnpm add @sddl/react-native-sdk
```

**iOS:**

```bash
npx pod-install
```

Requirements: React Native ≥ 0.71, iOS 12+, Android 5.0 (API 21)+.

---

## Platform Setup

### iOS — Universal Links

1. In Xcode: **Target → Signing & Capabilities → + Capability → Associated Domains**.
2. Add one of:

   ```text
   applinks:{YOUR_ID}.sddl.me
   ```

   or

   ```text
   applinks:{your.custom.domain}
   ```
3. Build & run on device. Make sure Associated Domains shows no warnings and your AASA is reachable.

> Your SDDL workspace hosts the AASA for your ID/custom domain. No extra files in the app are needed.

### Android — App Links

Add an **intent‑filter** to the activity that handles your links (usually `MainActivity`). Example:

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:launchMode="singleTop">

    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="{YOUR_ID}.sddl.me"
            android:pathPrefix="/" />
        <!-- or your custom domain in android:host -->
    </intent-filter>

    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

**Digital Asset Links**

1. In SDDL, open **App Links configuration** and enter your **Package Name** and **SHA256 certificate fingerprints** (debug + release as needed).
2. SDDL publishes `assetlinks.json` for your domain automatically.

Get SHA256 fingerprints:

```bash
# Debug
keytool -list -v -alias androiddebugkey \
  -keystore ~/.android/debug.keystore \
  -storepass android -keypass android

# Release (example)
keytool -list -v -alias YOUR_ALIAS -keystore /path/to/your-release.jks
```

Copy the `SHA256` value(s) into SDDL.

> No manual Gradle wiring is required for this SDK (autolinking adds the native module).

---

## Usage

The SDK mirrors the native iOS/Android behavior:

* If you **have a URL** (received via Universal/App Link), pass it in.
* If you **don’t have a URL** (cold start), call without arguments — the SDK will best‑effort resolve using the most recent safe signal.

Minimal React component:

```tsx
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { Sddl } from 'sddl-react-native-sdk';

export default function App() {
    useEffect(() => {
        // Runtime links (while app is open)
        const sub = Linking.addEventListener('url', e => {
            Sddl.resolve(e?.url, onSuccess, onError);
        });

        // Initial link or cold start (SDK handles 300ms delay internally)
        Linking.getInitialURL().then(url => {
            Sddl.resolve(url ?? undefined, onSuccess, onError);
        });

        return () => sub.remove();
    }, []);

    const onSuccess = (payload: Record<string, any>) => {
        // Handle routing using payload
        console.log('SDDL payload:', payload);
    };

    const onError = (msg: string) => {
        // Optional non-blocking log
        console.warn('SDDL error:', msg);
    };

    return null;
}
```

---

## Testing Checklist

1. Create a dynamic link in SDDL with metadata.
2. Install the app (debug build is fine).
3. Tap your link on a device:

    * If the app is installed, the OS delivers the Universal/App Link → your app calls `Sddl.resolve(url, ...)`.
    * If the app is not installed, the store opens → after install/first launch call `Sddl.resolve(undefined, ...)` to retrieve the deferred payload.

---

## Troubleshooting

* **iOS**: If links open Safari instead of the app, verify Associated Domains and that AASA is reachable for your domain.
* **Android**: Ensure `android:autoVerify="true"` and that your package name + SHA256 fingerprints are entered in SDDL.
* **Pods/Gradle**: After installing the SDK, run `npx pod-install` (iOS). On Android, no manual settings/implementation of the module is required.
* **Simulators**: Some Universal/App Link behaviors differ in simulators. Test on a real device when in doubt.

---

## Security & Privacy

* The SDK sends minimal headers to help SDDL securely match the correct payload:

    * `X-App-Identifier`: your bundle id / package name (when available).
    * `X-Device-Platform`: `iOS` or `Android`.
* No persistent device identifiers are collected by the SDK.

---

## License

MIT

Powered by [sddl.me](https://sddl.me) — deep linking API.
