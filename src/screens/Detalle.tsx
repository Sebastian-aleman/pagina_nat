import { useState, type ReactNode } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { mediaUrl, proyectos, txt } from '../data'
import { ModelViewer } from '../components/ModelViewer'

type Tab = 'queEs' | 'comoSeHizo' | 'comoFunciona'

function Field({ title, children, empty }: { title: string; children?: ReactNode; empty: boolean }) {
  const { lang } = useApp()
  return (
    <div className="field">
      <h3>{title}</h3>
      {empty ? <p className="soon">{tr(lang).soon}</p> : children}
    </div>
  )
}

export function Detalle() {
  const { lang, index, go, landscape } = useApp()
  const t = tr(lang)
  const p = proyectos[index]
  const [tab, setTab] = useState<Tab>('queEs')
  const [resetKey, setResetKey] = useState(0)
  const [videoFull, setVideoFull] = useState(false)

  const tabText = tab === 'comoFunciona' ? '' : txt(p[tab], lang)
  const video = (p.videoFunciona ?? '').trim()
  const videoSrc = video && (/^https?:\/\//.test(video) ? video : mediaUrl(p, video))

  return (
    <div className="screen detalle" style={{ position: 'relative' }}>
      <div className="topbar">
        <button className="btn ghost" onClick={() => go('vitrina')}>‹ {t.back}</button>
        <h2 style={{ textAlign: 'right', fontSize: 48 }}>{txt(p.nombre, lang)}</h2>
      </div>

      <div className="detail-body">
      <div className="vwrapper" style={{ position: 'relative' }}>
        <ModelViewer project={p} width={landscape ? '100%' : 968} height={landscape ? '100%' : 640} interactive autoRotate={false} resetKey={resetKey} />
        <button className="btn corner" style={{ position: 'absolute', right: 24, bottom: 24 }} onClick={() => setResetKey((k) => k + 1)}>
          ⟲ {t.reset}
        </button>
      </div>

      <div className="detail-info">
      <div className="tabs">
        {(['queEs', 'comoSeHizo', 'comoFunciona'] as Tab[]).map((k) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); if (k === 'comoFunciona' && videoSrc) setVideoFull(true) }}>{t.tabs[k]}</button>
        ))}
      </div>

      <div className="card tabpanel scroll">
        {tab === 'queEs' ? (
          <>
            <Field title={t.authors} empty={p.autores.length === 0}>
              <div className="chips">{p.autores.map((a) => <span className="chip" key={a}>{a}</span>)}</div>
            </Field>
            <Field title={t.semester} empty={!txt(p.semestre, lang)}><p>{txt(p.semestre, lang)}</p></Field>
            <Field title={t.professor} empty={!(p.profesor ?? '').trim()}><p>{p.profesor}</p></Field>
            <Field title={t.tabs.queEs} empty={!tabText}><p>{tabText}</p></Field>
            <Field title={t.description} empty={!txt(p.descripcion, lang)}><p>{txt(p.descripcion, lang)}</p></Field>
            <Field title={t.purpose} empty={!txt(p.proposito, lang)}><p>{txt(p.proposito, lang)}</p></Field>
            <Field title={t.materials} empty={p.materiales.length === 0}>
              <div className="chips">{p.materiales.map((m, i) => <span className="chip" key={i}>{txt(m, lang)}</span>)}</div>
            </Field>
          </>
        ) : tab === 'comoFunciona' ? (
          // Video en lugar de texto (no se interrumpe por inactividad mientras se reproduce)
          <Field title={t.tabs.comoFunciona} empty={!videoSrc}>
            {/* Vista previa en bucle: al tocarla vuelve a pantalla completa */}
            <video key={videoSrc} className="tab-video" src={videoSrc} autoPlay muted loop playsInline data-loop onClick={() => setVideoFull(true)} />
          </Field>
        ) : (
          <Field title={t.tabs[tab]} empty={!tabText}><p>{tabText}</p></Field>
        )}
      </div>

      <button className="btn big" onClick={() => go('votacion')}>★ {t.evaluate}</button>
      </div>
      </div>

      {videoFull && videoSrc && (
        <div className="video-full" onClick={() => setVideoFull(false)}>
          <video src={videoSrc} autoPlay muted loop playsInline data-loop />
          <button className="btn round" onClick={() => setVideoFull(false)} aria-label={t.close}>✕</button>
        </div>
      )}
    </div>
  )
}
