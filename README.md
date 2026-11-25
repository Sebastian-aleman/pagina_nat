# Inventarium

App interactiva (kiosco vertical 1080×1920, táctil) para exposición de proyectos de diseño industrial. Vite + React + TypeScript + three.js (@react-three/fiber, drei). Sin CDN.

## Comandos
```bash
npm install
npm run dev        # desarrollo
npm run build      # typecheck + build en dist/
npm run preview    # servir dist/ (el Service Worker solo actúa en build)
```
Para kiosco offline: abrir **una vez** la versión `build` con conexión (o servidor local) para que el Service Worker guarde los archivos.

## Completar un proyecto (sin tocar código)
1. Edita `src/data/proyectos.json` (textos en `es` y `en`). Los campos vacíos muestran "Información próximamente".
2. Copia `public/models/proyecto-XX.glb` (o `.gltf`). Ver `docs/COMPRIMIR_GLB.md`.
3. Copia `public/media/proyecto-XX/miniatura.jpg` y las imágenes/videos; lístalos en `media`:
   `{ "tipo": "imagen", "archivo": "foto1.jpg", "titulo": { "es": "", "en": "" } }`.
4. El proyecto con `"demostrativo": true` es el único que se puede evaluar. Criterios en `votacion.criterios`.

## Ajustes
- Colores y fondo: `src/theme.css` (variables CSS).
- Tiempos, PIN y toques de admin: `src/data/config.json` (`idleSeconds`, `autoAdvanceSeconds`, `thanksSeconds`, `adminPin`, `adminTaps`).
- Logo: `public/logo.png`.

## Administrador (oculto)
Toca el logo en la bienvenida 5 veces seguidas → PIN (por defecto `1234`, **cámbialo**) → resultados y exportar CSV.

## Votos
`src/votes/VoteRepository.ts` es la interfaz; hoy se guarda en `localStorage` (`LocalVoteRepository`). Para Supabase: implementar la misma interfaz y cambiar la instancia en `src/votes/index.ts`.
