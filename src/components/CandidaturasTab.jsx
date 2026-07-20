import { useEffect, useMemo, useState } from 'react'
import { supabase, CURRICULOS_BUCKET } from '../lib/supabase.js'
import StatusSelect, { STATUS_OPTIONS } from './StatusSelect.jsx'
import NotasModal from './NotasModal.jsx'
import { exportCandidaturasCsv } from '../lib/csvExport.js'

export default function CandidaturasTab() {
  const [cargos, setCargos] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [baixando, setBaixando] = useState(null)
  const [notasDe, setNotasDe] = useState(null)

  // filtros
  const [cargoFiltro, setCargoFiltro] = useState('todos')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [dataDe, setDataDe] = useState('')
  const [dataAte, setDataAte] = useState('')

  useEffect(() => {
    supabase
      .from('cargos')
      .select('id, titulo')
      .order('titulo')
      .then(({ data }) => setCargos(data || []))
  }, [])

  async function carregar() {
    setCarregando(true)
    setErro('')

    let query = supabase
      .from('candidaturas')
      .select('*, cargos(titulo)')
      .eq('banco_talentos', false)
      .order('created_at', { ascending: false })

    if (cargoFiltro !== 'todos') {
      if (cargoFiltro === 'espontanea') {
        query = query.is('cargo_id', null)
      } else {
        query = query.eq('cargo_id', cargoFiltro)
      }
    }
    if (statusFiltro !== 'todos') query = query.eq('status', statusFiltro)
    if (dataDe) query = query.gte('created_at', `${dataDe}T00:00:00`)
    if (dataAte) query = query.lte('created_at', `${dataAte}T23:59:59`)

    const { data, error } = await query

    if (error) {
      console.error(error)
      setErro('Não foi possível carregar as candidaturas.')
    } else {
      setCandidaturas(data)
    }
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargoFiltro, statusFiltro, dataDe, dataAte])

  const candidaturasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return candidaturas
    return candidaturas.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) || c.email.toLowerCase().includes(termo)
    )
  }, [candidaturas, busca])

  const contadores = useMemo(() => {
    const base = { total: candidaturas.length }
    STATUS_OPTIONS.forEach((s) => {
      base[s.value] = candidaturas.filter((c) => c.status === s.value).length
    })
    return base
  }, [candidaturas])

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

  async function handleMudarStatus(candidatura, novoStatus) {
    setCandidaturas((prev) =>
      prev.map((c) => (c.id === candidatura.id ? { ...c, status: novoStatus } : c))
    )
    const { error } = await supabase
      .from('candidaturas')
      .update({ status: novoStatus })
      .eq('id', candidatura.id)
    if (error) {
      console.error(error)
      window.alert('Não foi possível atualizar o status. Tente novamente.')
      carregar()
    }
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

  async function handleArquivar(candidatura) {
    const { error } = await supabase
      .from('candidaturas')
      .update({ banco_talentos: true })
      .eq('id', candidatura.id)
    if (error) {
      console.error(error)
      window.alert('Não foi possível mover para o banco de talentos.')
      return
    }
    setCandidaturas((prev) => prev.filter((c) => c.id !== candidatura.id))
  }

  async function handleExcluir(candidatura) {
    const confirmar = window.confirm(
      `Excluir a candidatura de "${candidatura.nome}"? Essa ação não pode ser desfeita.`
    )
    if (!confirmar) return

    const { error } = await supabase.from('candidaturas').delete().eq('id', candidatura.id)
    if (error) {
      console.error(error)
      window.alert('Não foi possível excluir a candidatura.')
      return
    }
    setCandidaturas((prev) => prev.filter((c) => c.id !== candidatura.id))
  }

  function limparFiltros() {
    setCargoFiltro('todos')
    setStatusFiltro('todos')
    setBusca('')
    setDataDe('')
    setDataAte('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-armac-blueDarker text-lg">Candidaturas</h2>
        <button
          type="button"
          onClick={() => exportCandidaturasCsv(candidaturasFiltradas)}
          disabled={candidaturasFiltradas.length === 0}
          className="text-sm font-semibold text-armac-blue hover:underline disabled:opacity-40 disabled:no-underline"
        >
          Exportar CSV
        </button>
      </div>

      {/* Contadores rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-2xl font-bold text-armac-blueDarker">{contadores.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        {STATUS_OPTIONS.map((s) => (
          <div key={s.value} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-bold text-armac-blueDarker">{contadores[s.value]}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Vaga</label>
          <select
            value={cargoFiltro}
            onChange={(e) => setCargoFiltro(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="todos">Todas</option>
            <option value="espontanea">Candidaturas espontâneas</option>
            {cargos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="todos">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">De</label>
          <input
            type="date"
            value={dataDe}
            onChange={(e) => setDataDe(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Até</label>
          <input
            type="date"
            value={dataAte}
            onChange={(e) => setDataAte(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Buscar por nome ou e-mail
          </label>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex: João ou joao@email.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={limparFiltros}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 px-2 py-2"
        >
          Limpar filtros
        </button>
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-slate-500 text-sm">Carregando...</p>
      ) : candidaturasFiltradas.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhuma candidatura encontrada com esses filtros.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Vaga</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Recebido em</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {candidaturasFiltradas.map((c) => (
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
                    {c.cargos?.titulo || (
                      <span className="italic text-slate-400">
                        {c.area_interesse ? `Espontânea: ${c.area_interesse}` : 'Candidatura espontânea'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <div>{c.email}</div>
                    <div className="text-xs text-slate-400">{c.telefone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      value={c.status}
                      onChange={(novoStatus) => handleMudarStatus(c, novoStatus)}
                    />
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
                        onClick={() => handleArquivar(c)}
                        className="text-armac-greenDark hover:underline font-semibold text-xs whitespace-nowrap"
                      >
                        Banco de talentos
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
