# Overview

The **Board Game Geek Community App** is an open source React Native application built by members of the BGG community.

## Release Status

The app is NOT yet available via either Google Play or the iOS App Store yet, while we continue to work on the first release candidate.

## Installing testing versions:

### iOS Users

You can install the beta via Apple's TestFlight app using this link: https://testflight.apple.com/join/uLlg7ICq

### Android Users

You can install the beta by first installing the Expo app from the Play store:

https://play.google.com/store/apps/details?id=host.exp.expon...

Once installed, you can run the app inside Expo using this link:

https://expo.io/@briandquinn/bggca

**Note:** I'm an Apple user myself, the app works on Android but hasn't had as much testing as iOS. Also, performance inside Expo isn't the best, so be patient.

## Development - Getting Started

This project is intended to be an open and friendly place for people to contribute and help create something meaningful for the entire BGG community. We actively encourage contributions at any level, so if you're interested in helping please open an issue and a start a discussion with us.

You don't need to be a pro, open source is a great way to learn new techology and skills, so if you can write a little Javascript or are willing to test the builds and provide meaningful bug reports - then please jump in!

### Setup local development environment

You'll need node + yarn installed and working locally first.

1. Next make sure you've got the latest expo cli installed:

```bash
yarn global add expo-cli
```

2. Clone the repo:

```bash
git clone git@github.com:BDQ/bgg_community_app.git
```

3. Install dependencies.

```bash
cd bgg_community_app
yarn install
```

4. Create a local .env file (inside bgg_community_app directory)

```bash
cp .env.sample .env
```

**NOTE:** This file contains configuration for various API's that the app integrates with, if you would like to develop against one of these features with our development datasets, please contact @BDQ for a key.

5. Start expo (inside bgg_community_app directory)

```bash
yarn start
```

If everything worked, then you should see a QR code which you can scan once you've got the Expo app installed on your iOS or Android device.

_iOS Device:_ You must use the normal camera app to scan the QR code, and that will open the app within Expo.

_Android_: You can scan the QR code using the Expo app on your device.

### Publishing (App admins only)

#### Publishing a dev build (EXPO only)

```bash
expo publish --release-channel=dev
```

#### Publishing new Native app

Expo SDK version bumps, and other major changes require that we submit an native builds for iOS + Android. That can be generated as follows.

1. Ensure the `version` key has been bumped in `app.json`

2. Ensure logging is disabled in `shared/debug.js` - the `enable()` call should be commented out.

##### iOS app

1. Start the build, this takes a while.

```bash
expo build:ios
```

2. Once the build is finished, you need to upload the resulting file to Apple.

```bash
expo upload:ios --apple-id <PRIVATE> --apple-id-password <EVEN MORE PRIVATEapp>
```

##### Android app

1. Ensure the `android.versionCode` key has been incremented in `app.json`

2. Start the build, this takes a while.

```bash
expo build:ios
```

3. Once the build is finished, you need to create a new release (open testing) on Play store and upload the artefact:

https://play.google.com/console/
