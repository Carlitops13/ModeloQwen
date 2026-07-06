# MiniGPT HF

MiniGPT HF es una actividad de chatbot web construida con Node.js, Express y la librería `@huggingface/inference`. El proyecto conecta un frontend conversacional con modelos de Hugging Face y permite elegir entre varios modelos desde la interfaz.

## Objetivo de la actividad

El objetivo principal fue crear una aplicación web que funcione como asistente educativo y que demuestre el flujo completo de una app moderna:

1. Interfaz en el navegador.
2. Envío de mensajes al backend.
3. Comunicación con Hugging Face.
4. Respuesta renderizada en pantalla.

Además, se agregaron mejoras de experiencia de usuario como selector de modelos, sugerencias rápidas, manejo de errores y un diseño visual más limpio.

## Tecnologías usadas

- Node.js
- Express
- CORS
- dotenv
- @huggingface/inference
- HTML, CSS y JavaScript vanilla

## Funcionalidades

- Chat web con historial local en el navegador.
- Selector de modelos desde el frontend.
- Envío del modelo seleccionado al backend.
- Uso de `provider=auto` para que Hugging Face elija el proveedor disponible.
- Fallback automático si un modelo falla.
- Interfaz responsiva con estilo moderno inspirado en asistentes tipo Gemini.
- Sugerencias rápidas para iniciar conversaciones.
- Botón para limpiar el chat.

## Estructura del proyecto

```text
backend/
├── public/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── .env
├── .env.example
├── package.json
├── server.js
└── README.md
```

## Cómo funciona

### Frontend

El frontend vive dentro de la carpeta `public`.

- `index.html` define la estructura visual.
- `style.css` aplica el diseño visual.
- `app.js` maneja la interacción del usuario, el historial local, el selector de modelos y la llamada al backend.

El usuario escribe un mensaje, elige un modelo y el frontend envía un JSON con:

```json
{
  "messages": [...],
  "model": "mistralai/Mistral-7B-Instruct-v0.3",
  "provider": "auto"
}
```

### Backend

El archivo `server.js` levanta un servidor Express que:

- Sirve los archivos estáticos del frontend.
- Expone `/api/health` para verificar el estado del backend.
- Expone `/api/chat` para procesar los mensajes.
- Valida que exista `HF_TOKEN` en el `.env`.
- Envía la conversación a Hugging Face usando `@huggingface/inference`.
- Intenta un fallback si el modelo seleccionado falla.

## Modelos disponibles en el selector

El frontend incluye estos modelos:

- `meta-llama/Llama-3.1-8B-Instruct`
- `mistralai/Mistral-7B-Instruct-v0.3`
- `Qwen/Qwen3-8B`
- `deepseek-ai/DeepSeek-R1`
- `google/gemma-3-12b-it`
- `microsoft/Phi-4`
- `TinyLlama/TinyLlama-1.1B-Chat-v1.0`

## Archivos de configuración

### `.env`

Este archivo contiene las variables reales que usa el backend.

Ejemplo:

```env
HF_TOKEN=tu_token_de_hugging_face
PORT=3000
HF_MODEL=Qwen/Qwen2.5-7B-Instruct
HF_PROVIDER=together
```

### `.env.example`

Sirve como plantilla para configurar el proyecto sin exponer credenciales reales.

## Instalación

1. Entra a la carpeta del backend.
2. Instala dependencias con `npm install`.
3. Crea el archivo `.env` si no existe.
4. Coloca tu token de Hugging Face en `HF_TOKEN`.

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor quedará disponible en:

```text
http://localhost:3000
```

## Endpoints

### `GET /api/health`

Devuelve el estado del backend y la configuración actual.

Respuesta ejemplo:

```json
{
  "ok": true,
  "message": "Backend funcionando",
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "provider": "together"
}
```

### `POST /api/chat`

Recibe la conversación y genera una respuesta del modelo.

Campos esperados:

- `messages`: arreglo de mensajes con `role` y `content`
- `model`: modelo seleccionado desde el frontend
- `provider`: proveedor elegido, normalmente `auto`

## Manejo de errores

El proyecto incluye varios niveles de control:

- Si falta `HF_TOKEN`, el backend responde con un error claro.
- Si un modelo no está disponible, se intenta con otros modelos de respaldo.
- Si el proveedor remoto falla, el backend devuelve un mensaje amigable en lugar de romper la aplicación.

## Diseño visual

La interfaz fue rediseñada con una estética limpia y moderna:

- Fondo oscuro con gradientes suaves.
- Tarjetas con bordes redondeados.
- Barra superior compacta.
- Panel central amplio para conversación.
- Sugerencias rápidas tipo chip.
- Botón principal destacado para enviar mensajes.

## Flujo de uso

1. Abre la aplicación en el navegador.
2. Elige un modelo desde el selector.
3. Escribe una pregunta o usa una sugerencia rápida.
4. Presiona `Enviar`.
5. El frontend envía el mensaje al backend.
6. El backend consulta Hugging Face.
7. La respuesta aparece en la conversación.

## Notas importantes

- No subas el archivo `.env` con tu token real al repositorio.
- Si un modelo no responde, prueba otro del selector.
- La respuesta puede variar según la disponibilidad del proveedor de Hugging Face.

## Créditos

Proyecto desarrollado como actividad práctica de integración entre frontend, backend y modelos de lenguaje de Hugging Face.
