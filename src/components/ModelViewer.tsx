import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import { Box3, Group, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Proyecto } from '../types'
import { useApp } from '../state'
import { tr } from '../i18n'
import { ErrorBoundary } from './ErrorBoundary'
import { DRACO_PATH, forgetModelLookup, resolveModel } from './models'

/** Centra el modelo en el origen y lo escala para que mida ~2 unidades. */
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, DRACO_PATH)
  const obj = useMemo(() => {
    const clone = scene.clone(true)
    const box = new Box3().setFromObject(clone)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const max = Math.max(size.x, size.y, size.z) || 1
    clone.position.sub(center)
    const g = new Group()
    g.add(clone)
    g.scale.setScalar(2 / max)
    return g
  }, [scene])
  return <primitive object={obj} />
}

/** Marcador visible cuando todavía no existe el archivo del modelo. */
function Placeholder() {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.4 })
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#2f6bff" wireframe />
      </mesh>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, 2, -4]} intensity={0.6} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 5, -6]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 1, 2]} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, 1, 2]} scale={[4, 6, 1]} />
      </Environment>
    </>
  )
}

function LoadingOverlay() {
  const { lang } = useApp()
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="viewer-overlay">
      <div className="badge">{tr(lang).loading}</div>
      <div className="progress"><i style={{ width: `${Math.round(progress)}%` }} /></div>
    </div>
  )
}

interface Props {
  project: Proyecto
  width: number | string
  height: number | string
  interactive?: boolean      // giro + zoom táctil
  autoRotate?: boolean
  resetKey?: number          // al cambiar, restablece la vista
  onTouch?: () => void
}

export function ModelViewer({ project, width, height, interactive = false, autoRotate = true, resetKey = 0, onTouch }: Props) {
  const { lang } = useApp()
  const t = tr(lang)
  const [url, setUrl] = useState<string | null | undefined>(undefined) // undefined = buscando
  const [attempt, setAttempt] = useState(0) // reintentos / recuperación de contexto WebGL
  const controls = useRef<OrbitControlsImpl>(null)

  useEffect(() => {
    let alive = true
    setUrl(undefined)
    resolveModel(project).then((u) => alive && setUrl(u))
    return () => { alive = false }
  }, [project, attempt])

  useEffect(() => { controls.current?.reset() }, [resetKey])

  const failed = (reset: () => void) => (
    <div className="viewer-overlay" style={{ pointerEvents: 'auto' }}>
      <div className="badge warn">{t.modelError}</div>
      <button className="btn" onClick={() => { forgetModelLookup(project); reset(); setAttempt((a) => a + 1) }}>{t.retry}</button>
    </div>
  )

  return (
    <div className="viewer" style={{ width, height }} onPointerDown={onTouch}>
      <ErrorBoundary key={`${project.id}-${attempt}`} fallback={(reset) => failed(reset)}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.9, 5.2], fov: 35 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              window.setTimeout(() => setAttempt((a) => a + 1), 400) // recupera sin intervención
            })
          }}
        >
          <Lights />
          <Suspense fallback={null}>
            {url ? <Model url={url} /> : url === null ? <Placeholder /> : null}
          </Suspense>
          <OrbitControls
            ref={controls}
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            enableRotate={interactive}
            enableZoom={interactive}
            minDistance={2.6}
            maxDistance={9}
            autoRotate={autoRotate}
            autoRotateSpeed={1.6}
          />
        </Canvas>
      </ErrorBoundary>
      <LoadingOverlay />
      {url === null && (
        <div className="viewer-overlay" style={{ justifyContent: 'flex-end' }}>
          <div className="badge">{t.modelMissing}</div>
        </div>
      )}
    </div>
  )
}
