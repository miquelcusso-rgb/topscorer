# Google Play Store — TWA Setup Guide

## Prerequisites
1. Install Java JDK 8+ and Android SDK (or Android Studio)
2. Install Bubblewrap: `npm install -g @bubblewrap/cli`
3. Initialize Bubblewrap SDK: `bubblewrap init --manifest https://www.top-scorers.com/manifest.webmanifest`

## Build steps
```bash
cd twa/
bubblewrap build
```
This generates `app-release-signed.apk` and `app-release-bundle.aab`

## Before building — update assetlinks.json
1. After `bubblewrap init`, it generates a keystore
2. Get the SHA256: `keytool -list -v -keystore android.keystore -alias android -storepass android -keypass android`
3. Update `public/.well-known/assetlinks.json` with the real SHA256
4. Deploy the site so assetlinks.json is live BEFORE submitting to Play Store
5. Verify: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://top-scorers.com&relation=delegate_permission/common.handle_all_urls

## Play Store submission checklist
- [ ] Screenshots: 2-8 phone screenshots (16:9 or 9:16, min 320px, max 3840px)
- [ ] Feature graphic: 1024x500px
- [ ] Hi-res icon: 512x512px (no rounded corners)
- [ ] Short description: max 80 chars
- [ ] Full description: max 4000 chars
- [ ] Content rating questionnaire (Sports app = usually Everyone)
- [ ] Privacy policy URL: https://www.top-scorers.com/privacidad
- [ ] Target API level: 34 (Android 14)

## App details for Play Console
- Package name: com.topscorers.app
- Category: Sports
- Content rating: Everyone
- Privacy policy: https://www.top-scorers.com/privacidad
- Email: support@top-scorers.com

## Cost
- Google Play developer account: $25 one-time fee
- URL: https://play.google.com/console/signup
