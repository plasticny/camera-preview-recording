## About
Simple android app using cordova camera preview plugin to record video
- Only tested on Android 13
- Node.js v18.19.0
- Vue + capacitor + typescript + scss
- Recorded videos are saved in DCIM/Recordings

## Npm Commands

### Install package
Gloabl package
```
npm install -g @vue/cli@5.0.8 cordova@12.0.0
```
Change current directory to project directory
```
npm install
```

### Run vue serve
```
npm run serve
```

### Compile scss
```
npm run scss
```

### Add platforms
```
npx cap add android
```

### Run on android
```
npm run android --target=<device id>
```
This command<br>
1. build the app using vue
2. run 'cap copy'
3. run 'cap run android --target=\<device id\>'