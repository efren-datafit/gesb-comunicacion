# GESB Comunicación

Base móvil de la vista principal para una aplicación de comunicación tipo WhatsApp, construida con Expo y React Native.

## Qué incluye

- Pantalla de inicio de sesión conectada al webservice de acceso.
- Vista principal conectada al webservice de conversaciones.
- Encabezado con título, usuario actual y buscador.
- Lista de conversaciones con destinatario, último mensaje y fecha.
- Barra inferior con dos acciones: Perfil e Iniciar conversación.
- Configuración inicial para crear builds con EAS en Android e iOS.

## Estructura

```text
App.tsx
src/
  api/
    authApi.ts
    chatsApi.ts
  components/
    ConversationCard.tsx
  screens/
    LoginScreen.tsx
    ConversationsScreen.tsx
  theme/
    colors.ts
  types/
    auth.ts
    chat.ts
    conversation.ts
```

## Inicio de sesión

La pantalla de acceso envía una petición `POST` a:

```text
https://escolarex.com/ws_app/c_acceso.php
```

El cuerpo se envía como JSON:

```json
{
  "usuario": "nombre_de_usuario",
  "llave": "contraseña"
}
```

Si el servicio responde con `res: "ok"`, la app guarda en memoria el objeto `data` del usuario y muestra la vista principal. Cualquier otro valor de `res` se toma como acceso denegado y se muestra el texto recibido en `msg`.

El cliente de acceso está en:

```text
src/api/authApi.ts
```

## Carga de conversaciones

Después de iniciar sesión, la vista principal consulta:

```text
https://escolarex.com/ws_app/c_chats.php
```

El cuerpo se envía como JSON usando el `idus` recibido en el inicio de sesión:

```json
{
  "idus": "1565718332"
}
```

La app espera `res: "ok"` y convierte las conversaciones recibidas en el índice `data` a tarjetas visuales.

El cliente de conversaciones está en:

```text
src/api/chatsApi.ts
```

## Ejecutar la app

Instala dependencias:

```bash
npm install
```

Abre el entorno de desarrollo:

```bash
npm run start
```

Luego puedes abrir la app en Android, iOS o web desde Expo.

## Próximas funcionalidades sugeridas

1. Persistir la sesión del usuario en el dispositivo.
2. Crear una pantalla de conversación individual.
3. Crear una pantalla para seleccionar usuarios e iniciar conversaciones.
4. Crear perfil de usuario.
5. Agregar recuperación de contraseña o cambio de contraseña.
6. Agregar envío y recepción de mensajes en tiempo real.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Crear base móvil de GESB Comunicación"
git branch -M main
git remote add origin https://github.com/usuario/gesb-comunicacion.git
git push -u origin main
```

## Publicar para Android e iOS

Este proyecto está preparado para Expo Application Services.

Instala la herramienta de publicación:

```bash
npm install -g eas-cli
```

Inicia sesión:

```bash
eas login
```

Configura el proyecto:

```bash
eas init
```

Crear builds internas de prueba:

```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

Crear builds de producción:

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

Enviar a tiendas:

```bash
eas submit --platform android
eas submit --platform ios
```

Para iOS se necesita una cuenta activa de Apple Developer. Para Android se necesita una cuenta de Google Play Console.
