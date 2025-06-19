## Get started

1. Prerequisites

   - [Node.js](https://nodejs.org/en/download/) (version 22 or later)
   - [Expo CLI](https://docs.expo.dev/get-started/installation/) (installed globally with `npm install -g expo-cli`)
   - [TSX](https://www.typescriptlang.org/download) (installed globally with `npm install -g typescript`)

2. Install dependencies

   ```bash
   npm install
   ```
   
3. Configure environment variables

   Create a `.env` file in the root directory of the project and add your environment variables. You can use the `.env.example` file as a reference. Make sure to keep this file secret and not commit it to version control.

   ```bash
   cp .env.example .env
   ```

   Then, edit the `.env` file with your specific values.

4. Start the app

   ```bash
   npx expo start
   ```

   In the output, you'll find options to open the app in a

   - [development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
   - [web browser](https://docs.expo.dev/workflow/web/)


   The app is mainly tested now using the web version

   ```bash
     npx expo start --web
   ```
   But it's also easy to test on a mobile device using the Expo Go app.
   To use it, install the Expo Go app from:
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)
   and scan the QR code displayed in your terminal or browser, and start testing.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

5. package.json

    The `package.json` file contains the scripts to run the app, build it, and publish it. Here are some of the most useful commands:
    
    - `npm start`: Starts the development server.
    - `npm run android`: Opens the app in an Android emulator or device. (requires Android Studio and an emulator setup).
    - `npm run ios`: Opens the app in an iOS simulator or device. (requires Xcode and an iOS simulator setup).
    - `npm run web`: Opens the app in a web browser.
    - `npm run lint`: Runs the linter to check for code style issues in the app directory.