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

## Panel de administrador (para el equipo)
- Abre la página con `#admin` al final (ej. `https://tu-sitio.vercel.app/#admin`) o toca el logo 5 veces → PIN → estadísticas (total, promedio general, por criterio con distribución de estrellas, votos por hora, últimos votos) y exportar CSV.
- Sin nube el PIN es `adminPin` de `src/data/config.json` y solo se ven los votos de ese navegador. Con la nube, el PIN lo valida la base de datos.

## Votos en la nube (Supabase)
1. Crea un proyecto en Supabase y ejecuta `docs/supabase.sql` (cambiando el PIN dentro).
2. En Vercel → Settings → Environment Variables: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (la clave publishable/anon). Vuelve a desplegar.
3. Los votos se envían solos; si no hay internet quedan en cola y se reenvían. El equipo solo necesita el enlace y el PIN.

Sin esas variables la app guarda los votos solo en el navegador. La interfaz está en `src/votes/`.
