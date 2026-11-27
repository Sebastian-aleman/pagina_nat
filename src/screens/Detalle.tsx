import { useState, type ReactNode } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { mediaUrl, proyectos, txt } from '../data'
import { ModelViewer } from '../components/ModelViewer'
import type { MediaItem, Proyecto } from '../types'

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

function Gallery({ p, items, onOpen }: { p: Proyecto; items: MediaItem[]; onOpen: (m: MediaItem) => void }) {
  return (
    <div className="gallery">
      {items.map((m) => (
        <button key={m.archivo} className="gal-item" onClick={() => onOpen(m)}>
          {m.tipo === 'video'
            ? (<><video src={mediaUrl(p, m.archivo)} muted preload="metadata" playsInline /><div className="play">▶</div></>)
            : <img src={mediaUrl(p, m.archivo)} alt="" draggable={false} />}
        </button>
      ))}
    </div>
  )
}

export function Detalle() {
  const { lang, index, go, landscape } = useApp()
  const t = tr(lang)
  const p = proyectos[index]
  const [tab, setTab] = useState<Tab>('queEs')
  const [resetKey, setResetKey] = useState(0)
  const [open, setOpen] = useState<MediaItem | null>(null)

  const tabText = txt(p[tab], lang)
  const hasMedia = p.media.length > 0

  return (
    <div className="screen detalle" style={{ position: 'relative' }}>
      <div className="topbar">
        <button className="btn ghost" onClick={() => go('vitrina')}>‹ {t.back}</button>
        <h2 style={{ textAlign: 'right', fontSize: 48 }}>{txt(p.nombre, lang)}</h2>
      </div>

      <div className="detail-body">
      <div className="vwrapper" style={{ position: 'relative' }}>
        <ModelViewer project={p} width={landscape ? '100%' : 968} height={landscape ? '100%' : hasMedia ? 560 : 640} interactive autoRotate={false} resetKey={resetKey} />
        <button className="btn corner" style={{ position: 'absolute', right: 24, bottom: 24 }} onClick={() => setResetKey((k) => k + 1)}>
          ⟲ {t.reset}
        </button>
      </div>

      <div className="detail-info">
      {hasMedia && <Gallery p={p} items={p.media} onOpen={setOpen} />}

      <div className="tabs">
        {(['queEs', 'comoSeHizo', 'comoFunciona'] as Tab[]).map((k) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t.tabs[k]}</button>
        ))}
      </div>

      <div className="card tabpanel scroll">
        {tab === 'queEs' ? (
          <>
            <Field title={t.authors} empty={p.autores.length === 0}>
              <div className="chips">{p.autores.map((a) => <span className="chip" key={a}>{a}</span>)}</div>
            </Field>
            <Field title={t.semester} empty={!txt(p.semestre, lang)}><p>{txt(p.semestre, lang)}</p></Field>
            <Field title={t.tabs.queEs} empty={!tabText}><p>{tabText}</p></Field>
            <Field title={t.description} empty={!txt(p.descripcion, lang)}><p>{txt(p.descripcion, lang)}</p></Field>
            <Field title={t.purpose} empty={!txt(p.proposito, lang)}><p>{txt(p.proposito, lang)}</p></Field>
            <Field title={t.materials} empty={p.materiales.length === 0}>
              <div className="chips">{p.materiales.map((m, i) => <span className="chip" key={i}>{txt(m, lang)}</span>)}</div>
            </Field>
            {!hasMedia && <Field title={t.gallery} empty />}
          </>
        ) : (
          <Field title={t.tabs[tab]} empty={!tabText}><p>{tabText}</p></Field>
        )}
      </div>

      <button className="btn big" onClick={() => go('votacion')}>★ {t.evaluate}</button>
      </div>
      </div>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)}>
          {open.tipo === 'video'
            ? <video src={mediaUrl(p, open.archivo)} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} />
            : <img src={mediaUrl(p, open.archivo)} alt="" />}
          <button className="btn round" onClick={() => setOpen(null)} aria-label="close">✕</button>
        </div>
      )}
    </div>
  )
}
