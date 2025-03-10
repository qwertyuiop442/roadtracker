
# Guía para convertir RoadTracker PWA a APK con Bubblewrap

Esta guía te ayudará a convertir tu Progressive Web App (PWA) en un archivo APK que puede ser instalado en dispositivos Android.

## Requisitos previos

1. Tener instalado [Node.js](https://nodejs.org/) (versión 14 o superior)
2. Tener instalado [Android Studio](https://developer.android.com/studio)
3. JDK 8 o superior
4. [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)

## Paso 1: Instalar Bubblewrap CLI

```bash
npm install -g @bubblewrap/cli
```

## Paso 2: Inicializar el proyecto de Bubblewrap

Navega hasta la carpeta donde quieres crear el proyecto APK y ejecuta:

```bash
bubblewrap init --manifest="https://tu-url-de-produccion.com/manifest.json"
```

Reemplaza "tu-url-de-produccion.com" con la URL donde has desplegado tu PWA.

## Paso 3: Configurar los detalles de la aplicación

Durante la inicialización, Bubblewrap te hará varias preguntas:

- Nombre del paquete: `app.lovable.roadtrackerpro`
- Versión del código de la aplicación: `1`
- Versión del nombre de la aplicación: `1.0.0`
- URL de la aplicación: URL completa de tu PWA
- Título: `RoadTracker Pro 2024`
- Idioma predeterminado: `es`
- Colores: usa el color del tema de la PWA (#FFA07A)
- Ubicación de los iconos: Los iconos se tomarán del manifest

## Paso 4: Configurar permisos de Android

Después de la inicialización, puedes editar el archivo `app.json` generado para añadir los permisos necesarios:

```json
{
  "permissions": [
    "CAMERA",
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "WAKE_LOCK",
    "VIBRATE"
  ]
}
```

## Paso 5: Generar la APK

```bash
bubblewrap build
```

Este comando creará el APK en la carpeta `build/`.

## Paso 6: Probar la APK

Transfiere el archivo APK a tu dispositivo Android e instálalo. Si recibes un error sobre "fuentes desconocidas", deberás habilitar la instalación desde fuentes desconocidas en la configuración de tu dispositivo.

## Paso 7: Firmar la APK para Google Play Store

Si quieres publicar la aplicación en Google Play Store, necesitarás firmar la APK:

```bash
bubblewrap build --release
```

Este comando generará un APK firmado que puede ser enviado a Google Play.

## Solución de problemas comunes

- **Error con el JDK**: Asegúrate de tener instalado JDK 8 o superior y que JAVA_HOME esté configurado correctamente.
- **Error con Android SDK**: Asegúrate de tener Android Studio instalado y configurado correctamente.
- **La aplicación se cierra inmediatamente**: Verifica que la URL de tu PWA esté correctamente configurada y accesible.
- **Problemas con los permisos**: Si la aplicación no puede acceder a la cámara o la ubicación, verifica que los permisos estén correctamente configurados en el archivo `app.json`.

## Metadatos para Google Play Store

Cuando estés listo para publicar tu aplicación en Google Play Store, prepara la siguiente información:

- **Nombre de la aplicación**: RoadTracker Pro 2024
- **Descripción corta**: Aplicación para el seguimiento de tiempos de conducción y descanso
- **Descripción completa**: RoadTracker Pro 2024 es una aplicación diseñada para conductores profesionales que necesitan llevar un control preciso de sus tiempos de conducción y descanso. Con una interfaz intuitiva y funcionalidad offline, te permite registrar y monitorear tus actividades en carretera cumpliendo con las normativas vigentes.
- **Categoría**: Transporte / Productividad
- **Etiquetas**: transporte, conductor, tiempos, descanso, camión, logística
- **Edad recomendada**: PEGI 3 / Para todos

## Recursos adicionales

- [Documentación oficial de Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap/tree/main/packages/cli)
- [PWA en Google Play Store](https://developer.android.com/google-play/guides/pwa)
- [Trusted Web Activity](https://developer.chrome.com/docs/android/trusted-web-activity/)
