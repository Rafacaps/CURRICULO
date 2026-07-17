import { useState } from 'react'

export default function JobCard({ cargo, isOpen, onToggle, onApply }) {
  const [expanded, setExpanded] = useState(false)
  const open = isOpen ?? expanded
  const toggle = onToggle ?? (() => setExpanded((v) => !v))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <h3 className="font-semibold text-armac-blueDarker text-base sm:text-lg">
            {cargo.titulo}
          </h3>
          {cargo.local && (
            <p className="text-xs text-slate-500 mt-0.5">{cargo.local}</p>
          )}
        </div>
        <span
          className={`shrink-0 w-8 h-8 rounded-full bg-armac-blue/10 text-armac-blue flex items-center justify-center transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-0">
            <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
              {cargo.descricao}
            </p>
            <button
              type="button"
              onClick={() => onApply(cargo)}
              className="mt-4 inline-flex items-center gap-2 bg-armac-green hover:bg-armac-greenDark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Candidatar-se para esta vaga
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
