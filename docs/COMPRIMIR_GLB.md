# Cómo preparar y comprimir los modelos 3D

Meta por modelo: **2–5 MB** y **menos de 100 000 triángulos**.

## 1. Exportar
Desde Blender, SolidWorks, Fusion 360, Rhino o KeyShot, exporta a **GLB** (glTF binario) con texturas incluidas.
Aplica escala y rotación antes de exportar. El visor centra y escala el modelo solo, pero no corrige modelos con el eje "arriba" equivocado (+Y es arriba).

## 2. Comprimir con gltf-transform
```bash
npm i -g @gltf-transform/cli

# Geometría con Draco + texturas a WebP, quitando datos que sobran
gltf-transform optimize original.glb proyecto-01.glb --compress draco --texture-compress webp --texture-size 2048
```
Alternativa: `--compress meshopt` (más rápido de decodificar; también funciona sin internet).

Opcional, simplificar si pasa de 100k triángulos:
```bash
gltf-transform simplify entrada.glb salida.glb --ratio 0.5 --error 0.001
```

> El decodificador Draco ya está en `public/draco/` (no usa CDN).
> No uses texturas KTX2/Basis sin añadir su transcodificador a `public/` (no incluido).

## 3. Copiar
Guarda el archivo como `public/models/proyecto-01.glb` … `proyecto-10.glb`.
También se acepta `.gltf` (con su `.bin` y texturas en la misma carpeta). Si existen ambos, gana `.glb`.

## 4. Miniaturas
Guarda una imagen por proyecto en `public/media/proyecto-XX/miniatura.jpg` (cuadrada, ~400×400). Son imágenes: nunca hay 10 visores 3D a la vez.

## 5. Probar el peso
```bash
gltf-transform inspect proyecto-01.glb
```
