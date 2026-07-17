import { useEffect, useState } from 'react'
import { supabase, CURRICULOS_BUCKET } from '../lib/supabase.js'

export default function CandidaturasTab() {
  const [cargos, setCargos] = useState([])
  const [cargoFiltro, setCargoFiltro] = useState('todos')
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [baixando, setBaixando] = useState(null)

  useEffect(() => {
    supabase
      .from('cargos')
      .select('id, titulo')
      .order('titulo')
      .then(({ data }) => setCargos(data || []))
  }, [])

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      setErro('')
      let query = supabase
        .from('candidaturas')
        .select('*, cargos(titulo)')
        .order('created_at', { ascending: false })

      if (cargoFiltro !== 'todos') {
        query = query.eq('cargo_id', cargoFiltro)
      }

      const { data, error } = await query
      if (error) {
        console.error(error)
        setErro('Não foi possível carregar as candidaturas.')
      } else {
        setCandidaturas(data)
      }
      setCarregando(false)
    }
    carregar()
  }, [cargoFiltro])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-armac-blueDarker text-lg">Candidaturas</h2>
        <select
          value={cargoFiltro}
          onChange={(e) => setCargoFiltro(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="todos">Todas as vagas</option>
          {cargos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titulo}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-slate-500 text-sm">Carregando...</p>
      ) : candidaturas.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhuma candidatura encontrada.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Vaga</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Recebido em</th>
                <th className="px-4 py-3 font-medium text-right">Currículo</th>
              </tr>
            </thead>
            <tbody>
              {candidaturas.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-armac-blueDarker">{c.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{c.cargos?.titulo || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{c.email}</div>
                    <div className="text-xs text-slate-400">{c.telefone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(c.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleBaixar(c)}
                      disabled={baixando === c.id}
                      className="text-armac-blue hover:underline font-semibold text-xs disabled:opacity-50"
                    >
                      {baixando === c.id ? 'Abrindo...' : 'Ver currículo'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
