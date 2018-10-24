# Overview

The **Board Game Geek Community App** is an open source React Native application built by the BGG community.

## Current Version

The initial version is focused on providing mobile access to the BGG Event Previews (like GenCon / Spiel etc), but code is already in place for collection & wishlist management which will be turned on in later releases. The roadmap is completely open to whatever the community would like to add!

## Getting Started

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
