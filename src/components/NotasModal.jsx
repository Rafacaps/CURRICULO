import { useState } from 'react'

export default function NotasModal({ candidatura, onClose, onSalvar }) {
  const [notas, setNotas] = useState(candidatura.notas || '')
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar() {
    setSalvando(true)
    await onSalvar(candidatura.id, notas)
    setSalvando(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Notas internas
          </p>
          <h2 className="font-bold text-armac-blueDarker">{candidatura.nome}</h2>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-armac-blue"
            placeholder="Ex: Entrevista marcada para dia 20, boa experiência com Deere 320..."
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-armac-blue hover:bg-armac-blueDark disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
            >
              {salvando ? 'Salvando...' : 'Salvar notas'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium px-3"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
