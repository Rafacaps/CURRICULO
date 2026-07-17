import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import CargoForm from './CargoForm.jsx'

export default function CargosTab() {
  const [cargos, setCargos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null) // null = fechado, {} = novo, {...} = editar
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setErro('Não foi possível carregar os cargos.')
    } else {
      setCargos(data)
    }
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleSalvar(form) {
    setSalvando(true)
    setErro('')
    const payload = {
      titulo: form.titulo,
      local: form.local || null,
      descricao: form.descricao,
      ativo: form.ativo,
      ordem: form.ordem || 0,
    }

    const query = form.id
      ? supabase.from('cargos').update(payload).eq('id', form.id)
      : supabase.from('cargos').insert(payload)

    const { error } = await query
    setSalvando(false)

    if (error) {
      console.error(error)
      setErro('Não foi possível salvar a vaga.')
      return
    }

    setEditando(null)
    carregar()
  }

  async function handleExcluir(cargo) {
    const confirmar = window.confirm(
      `Excluir a vaga "${cargo.titulo}"? Essa ação não pode ser desfeita.`
    )
    if (!confirmar) return

    const { error } = await supabase.from('cargos').delete().eq('id', cargo.id)
    if (error) {
      console.error(error)
      window.alert(
        'Não foi possível excluir. Se já existem candidaturas para essa vaga, desative-a em vez de excluir.'
      )
      return
    }
    carregar()
  }

  async function handleToggleAtivo(cargo) {
    const { error } = await supabase
      .from('cargos')
      .update({ ativo: !cargo.ativo })
      .eq('id', cargo.id)
    if (error) {
      console.error(error)
      return
    }
    carregar()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-armac-blueDarker text-lg">Cargos</h2>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando({})}
            className="bg-armac-green hover:bg-armac-greenDark text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            + Nova vaga
          </button>
        )}
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {erro}
        </p>
      )}

      {editando && (
        <CargoForm
          cargoEditando={editando.id ? editando : null}
          salvando={salvando}
          onSalvar={handleSalvar}
          onCancelar={() => setEditando(null)}
        />
      )}

      {carregando ? (
        <p className="text-slate-500 text-sm">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {cargos.length === 0 && (
            <p className="text-slate-500 text-sm">Nenhuma vaga cadastrada ainda.</p>
          )}
          {cargos.map((cargo) => (
            <div
              key={cargo.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-armac-blueDarker">
                  {cargo.titulo}{' '}
                  {!cargo.ativo && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 ml-1">
                      inativa
                    </span>
                  )}
                </p>
                {cargo.local && (
                  <p className="text-xs text-slate-500">{cargo.local}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleAtivo(cargo)}
                  className="text-xs font-semibold text-armac-blue hover:underline"
                >
                  {cargo.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(cargo)}
                  className="text-xs font-semibold text-slate-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleExcluir(cargo)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
