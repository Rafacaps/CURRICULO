import { useEffect, useMemo, useState } from 'react'
import { supabase, CURRICULOS_BUCKET } from '../lib/supabase.js'
import NotasModal from './NotasModal.jsx'
import { exportCandidaturasCsv } from '../lib/csvExport.js'

export default function BancoTalentosTab() {
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [baixando, setBaixando] = useState(null)
  const [notasDe, setNotasDe] = useState(null)

  async function carregar() {
    setCarregando(true)
    setErro('')
    const { data, error } = await supabase
      .from('candidaturas')
      .select('*, cargos(titulo)')
      .eq('banco_talentos', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setErro('Não foi possível carregar o banco de talentos.')
    } else {
      setCandidaturas(data)
    }
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return candidaturas
    return candidaturas.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) || c.email.toLowerCase().includes(termo)
    )
  }, [candidaturas, busca])

  async function handleBaixar(candidatura) {
    setBaixando(candidatura.id)
    const { data, error } = await supabase.storage
      .from(CURRICULOS_BUCKET)
      .createSignedUrl(candidatura.arquivo_path, 60)
    setBaixando(null)

    if (error || !data?.signedUrl) {
      console.error(error)
      window.alert('Não foi possível abrir o currículo agora.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleSalvarNotas(id, notas) {
    const { error } = await supabase.from('candidaturas').update({ notas }).eq('id', id)
    if (error) {
      console.error(error)
      window.alert('Não foi possível salvar as notas.')
      return
    }
    setCandidaturas((prev) => prev.map((c) => (c.id === id ? { ...c, notas } : c)))
  }

  async function handleRestaurar(candidatura) {
    const { error } = await supabase
      .from('candidaturas')
      .update({ banco_talentos: false })
      .eq('id', candidatura.id)
    if (error) {
      console.error(error)
      window.alert('Não foi possível mover de volta para as candidaturas.')
      return
    }
    setCandidaturas((prev) => prev.filter((c) => c.id !== candidatura.id))
  }

  async function handleExcluir(candidatura) {
    const confirmar = window.confirm(
      `Excluir definitivamente "${candidatura.nome}" do banco de talentos?`
    )
    if (!confirmar) return

    const { error } = await supabase.from('candidaturas').delete().eq('id', candidatura.id)
    if (error) {
      console.error(error)
      window.alert('Não foi possível excluir.')
      return
    }
    setCandidaturas((prev) => prev.filter((c) => c.id !== candidatura.id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-armac-blueDarker text-lg">Banco de Talentos</h2>
          <p className="text-sm text-slate-500">
            Candidatos com bom perfil, guardados para futuras vagas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportCandidaturasCsv(filtradas, 'banco-de-talentos.csv')}
          disabled={filtradas.length === 0}
          className="text-sm font-semibold text-armac-blue hover:underline disabled:opacity-40 disabled:no-underline"
        >
          Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Buscar por nome ou e-mail
        </label>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Ex: João ou joao@email.com"
          className="w-full sm:w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-slate-500 text-sm">Carregando...</p>
      ) : filtradas.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
          Nenhum candidato no banco de talentos ainda. Use o botão "Banco de talentos" na
          aba Candidaturas para guardar perfis interessantes aqui.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Vaga original</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Arquivado em</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 font-medium text-armac-blueDarker whitespace-nowrap">
                    {c.nome}
                    {c.notas && (
                      <p className="text-xs text-slate-400 font-normal mt-0.5 max-w-[180px] truncate">
                        📝 {c.notas}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {c.cargos?.titulo || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <div>{c.email}</div>
                    <div className="text-xs text-slate-400">{c.telefone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleBaixar(c)}
                        disabled={baixando === c.id}
                        className="text-armac-blue hover:underline font-semibold text-xs disabled:opacity-50 whitespace-nowrap"
                      >
                        {baixando === c.id ? 'Abrindo...' : 'Ver currículo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotasDe(c)}
                        className="text-slate-600 hover:underline font-semibold text-xs whitespace-nowrap"
                      >
                        Notas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRestaurar(c)}
                        className="text-armac-blue hover:underline font-semibold text-xs whitespace-nowrap"
                      >
                        Mover p/ candidaturas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluir(c)}
                        className="text-red-600 hover:underline font-semibold text-xs whitespace-nowrap"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {notasDe && (
        <NotasModal
          candidatura={notasDe}
          onClose={() => setNotasDe(null)}
          onSalvar={handleSalvarNotas}
        />
      )}
    </div>
  )
}
