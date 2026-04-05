# Traductor IA móvil (Expo)

## Qué incluye
- App móvil con React Native + Expo
- Traducción inglés → español
- Selector de tono
- Copiar traducción
- Modo local de respaldo
- Ejemplo de backend seguro para OpenAI

## Cómo ejecutarla
1. Instala Node.js
2. Descomprime el proyecto
3. En la carpeta del proyecto:
   ```bash
   npm install
   ```
4. Copia `.env.example` a `.env` y cambia la URL del backend si lo vas a usar
5. Inicia Expo:
   ```bash
   npm run start
   ```
6. Escanea el QR con Expo Go en Android/iPhone

## Backend seguro
No pongas tu API key dentro de la app. Usa `server-example.js` en un servidor aparte.

### Backend rápido
```bash
npm install express cors
export OPENAI_API_KEY=tu_clave
node server-example.js
```

## APK
Este paquete contiene el código fuente listo para abrir en Expo.
Para generar APK puedes usar EAS Build o Android Studio.


## Compilar APK con EAS
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## Compilar local en Android Studio
```bash
npm install
npx expo prebuild -p android
npx expo run:android
```
