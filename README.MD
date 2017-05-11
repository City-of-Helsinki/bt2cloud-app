# bt2cloud-app

## A React Native App for reading BLE data and distributing it to the cloud

### Setup:

Facebook provides a [generous step-by-step installation guide for React Native](https://facebook.github.io/react-native/docs/getting-started.html). Select 'Android' as your Mobile OS, and whichever platform you're using as your Development OS.

Skip the "Starting the Android Virtual Device" section and instead follow the instructions for "Using a real device". Stop at "Testing your React Native Installation".

Done? in the directory of your choice, run:

```
git clone git@github.com:City-of-Helsinki/bt2cloud-app.git
cd bt2cloud-app
npm install
react-native run-android
```

The app should launch on your device.

To run tests:

```
npm test
```
