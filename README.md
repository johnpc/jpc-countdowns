# countdowns.jpc.io

A dead-simple app for keeping track of what's coming up next in your life

The app is available live at [https://countdowns.jpc.io](https://countdowns.jpc.io). You can download the app for iOS devices on the [App Store](https://apps.apple.com/us/app/jpc-countdown/id6689494969).

## Setup

Clone the repo, install dependencies, deploy backend resources:

```bash
git clone git@github.com:johnpc/jpc-countdowns.git
cd jpc-countdowns
npm install
npx cap sync
npx ampx sandbox
```

Then, to run the frontend app

```bash
# on web
npm run dev
```

or

```bash
# on ios
npm run ios
```

## Deploying

Deploy this application to your own AWS account in one click:

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/johnpc/jpc-countdowns)
