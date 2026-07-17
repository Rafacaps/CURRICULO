import { useEffect, useState } from 'react'

const VAZIO = { titulo: '', local: '', descricao: '', ativo: true, ordem: 0 }

export default function CargoForm({ cargoEditando, onSalvar, onCancelar, salvando }) {
  const [form, setForm] = useState(VAZIO)

  useEffect(() => {
    setForm(cargoEditando ? { ...VAZIO, ...cargoEditando } : VAZIO)
  }, [cargoEditando])

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSalvar(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
    >
      <h3 className="font-semibold text-armac-blueDarker">
        {cargoEditando ? 'Editar vaga' : 'Nova vaga'}
      </h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Título do cargo
        </label>
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => handleChange('titulo', e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-armac-blue"
          placeholder="Ex: Mecânico de Equipamentos Pesados"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Local / unidade (opcional)
        </label>
        <input
          type="text"
          value={form.local || ''}
          onChange={(e) => handleChange('local', e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-armac-blue"
          placeholder="Ex: Manaus - AM"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Descrição da vaga
        </label>
        <textarea
          value={form.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-armac-blue"
          placeholder="Responsabilidades, requisitos, benefícios..."
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(e) => handleChange('ativo', e.target.checked)}
          />
          Vaga ativa (visível no site)
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          Ordem
          <input
            type="number"
            value={form.ordem}
            onChange={(e) => handleChange('ordem', Number(e.target.value))}
            className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={salvando}
          className="bg-armac-blue hover:bg-armac-blueDark disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
        >
          {salvando ? 'Salvando...' : 'Salvar vaga'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="text-slate-500 hover:text-slate-700 text-sm font-medium px-3"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
