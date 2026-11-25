import { useApp } from '../state'
import { tr } from '../i18n'
import { proyectos, txt } from '../data'
import { Thumb } from '../components/ui'

export function Catalogo() {
  const { lang, openProject } = useApp()
  const t = tr(lang)
  return (
    <div className="screen catalogo">
      <h2>{t.catalogTitle}</h2>
      <div className="grid2 scroll" style={{ flex: 1 }}>
        {proyectos.map((p, i) => (
          <button key={p.id} className="card proj-card" onClick={() => openProject(i)}>
            <div className="pic"><Thumb project={p} /></div>
            <div>
              <div className="n">{String(i + 1).padStart(2, '0')} / {proyectos.length}</div>
              <div className="t">{txt(p.nombre, lang)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
