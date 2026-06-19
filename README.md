# GESB Comunicación

Base móvil de la vista principal para una aplicación de comunicación interna, construida con Expo y React Native.

## Qué incluye

- Pantalla de inicio de sesión conectada al webservice de acceso.
- Vista principal conectada al webservice de conversaciones.
- Vista de mensajes de un chat específico.
- Encabezado con título, usuario actual, buscador y acceso a perfil.
- Lista de conversaciones con destinatario, último mensaje y fecha.
- Mensajes alineados por remitente y destinatario.
- Campo inferior para redactar mensajes con ajuste al teclado.
- Configuración inicial para crear builds con EAS en Android e iOS.
- Ícono de app personalizado en `assets/icon.png`.

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
    ChatMessagesScreen.tsx
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

## Vista de mensajes

Al tocar una conversación, la app abre la vista del chat. El encabezado muestra una flecha para regresar, el área como título y el nombre asociado a la conversación debajo.

Los mensajes del usuario actual se alinean a la derecha; los mensajes del destinatario se alinean a la izquierda. Cada burbuja muestra el mensaje y la fecha de envío en texto pequeño.

La lectura de mensajes usa:

```text
https://escolarex.com/ws_app/c_chats_mensajes.php
```

El cuerpo se envía como JSON:

```json
{
  "idchat": "1"
}
```

El campo inferior permite escribir un mensaje y la vista se ajusta cuando aparece el teclado del dispositivo.

El envío de mensajes usa:

```text
https://escolarex.com/ws_app/c_chats_nmsg.php
```

El cuerpo se envía como JSON:

```json
{
  "idchat": "2",
  "idus": "1565718332",
  "usuario": "EFREN CALVO",
  "tipo": "TEXTO",
  "msg": "Buenos días Sr Javier"
}
```

Las notificaciones push por mensaje se envían desde el webservice de mensajes. La app no llama directamente a Expo Push al enviar.

## Recepción en tiempo real

La app refresca automáticamente la información usando los webservices actuales:

- La vista principal consulta conversaciones cada 10 segundos mientras está visible.
- La vista de mensajes consulta el chat abierto cada 5 segundos.

Este mecanismo permite recibir mensajes nuevos sin recargar manualmente. Si más adelante existe un canal WebSocket o SSE, puede reemplazar este sondeo periódico.

## Registro de token push

Después de iniciar sesión, la app solicita permisos de notificación, genera el token Expo del dispositivo y lo guarda con:

```text
https://escolarex.com/ws_app/c_token_guardar.php
```

El cuerpo se envía como JSON:

```json
{
  "idus": "1565718332",
  "token": "ExponentPushToken[...]",
  "device_id": "identificador_del_dispositivo",
  "model": "modelo",
  "system": "Android",
  "version": "15",
  "brand": "marca"
}
```

Para generar el token se usan `expo-notifications`, `expo-device` y `expo-application`. En Android también se configura el permiso `POST_NOTIFICATIONS`.

## Persistencia de sesión

Después de iniciar sesión correctamente, la app guarda el objeto del usuario en almacenamiento seguro del dispositivo con `expo-secure-store`. Al abrir la app de nuevo, intenta restaurar esa sesión antes de mostrar la pantalla de acceso.

Al cerrar sesión desde Perfil, la sesión local se elimina y la app vuelve a mostrar el inicio de sesión.

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

1. Crear una pantalla para seleccionar usuarios e iniciar conversaciones.
2. Crear perfil de usuario.
3. Agregar recuperación de contraseña o cambio de contraseña.
4. Reemplazar el sondeo de mensajes por WebSocket o SSE si el backend lo ofrece.

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
