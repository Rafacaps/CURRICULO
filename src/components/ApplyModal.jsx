import { useState } from 'react'
import { supabase, CURRICULOS_BUCKET } from '../lib/supabase.js'

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
const MAX_SIZE_MB = 8

export default function ApplyModal({ cargo, onClose }) {
  const espontanea = !cargo || !cargo.id

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [areaInteresse, setAreaInteresse] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  function handleFile(e) {
    const file = e.target.files?.[0]
    setErro('')
    if (!file) {
      setArquivo(null)
      return
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErro('Envie o currículo em PDF, JPG ou PNG.')
      setArquivo(null)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErro(`O arquivo precisa ter até ${MAX_SIZE_MB}MB.`)
      setArquivo(null)
      return
    }
    setArquivo(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      setErro('Preencha nome, e-mail e telefone.')
      return
    }
    if (espontanea && !areaInteresse.trim()) {
      setErro('Diga qual área ou cargo você tem interesse.')
      return
    }
    if (!arquivo) {
      setErro('Anexe seu currículo em PDF ou imagem.')
      return
    }

    setEnviando(true)
    try {
      const extensao = arquivo.name.split('.').pop()
      const pastaId = espontanea ? 'espontanea' : cargo.id
      const caminho = `${pastaId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${extensao}`

      const { error: uploadError } = await supabase.storage
        .from(CURRICULOS_BUCKET)
        .upload(caminho, arquivo, { upsert: false })

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('candidaturas').insert({
        cargo_id: espontanea ? null : cargo.id,
        area_interesse: espontanea ? areaInteresse.trim() : null,
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        arquivo_path: caminho,
        arquivo_nome: arquivo.name,
      })

      if (insertError) throw insertError

      setEnviado(true)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível enviar sua candidatura agora. Tente novamente em instantes.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-armac-blue rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">
              Candidatura
            </p>
            <h2 className="text-white font-bold text-lg leading-tight">
              {espontanea ? 'Candidatura espontânea' : cargo.titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {enviado ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-armac-green/10 text-armac-green flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>
            <h3 className="font-bold text-armac-blueDarker text-lg mb-1">
              Candidatura enviada!
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {espontanea
                ? 'Recebemos seu currículo. Nossa equipe vai analisar seu perfil e considerar você para vagas compatíveis.'
                : `Recebemos seu currículo para a vaga de ${cargo.titulo}. Nossa equipe vai analisar e entrar em contato caso o perfil combine com a vaga.`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-armac-blue hover:bg-armac-blueDark text-white text-sm font-semibold px-6 py-2.5 rounded-lg"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {espontanea && (
              <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                Não achou uma vaga aberta pro seu perfil? Sem problema — deixe seu
                currículo com a gente e avisamos quando surgir uma oportunidade.
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="nome">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-armac-blue"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-armac-blue"
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="telefone">
                Telefone / WhatsApp
              </label>
              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-armac-blue"
                placeholder="(92) 90000-0000"
              />
            </div>

            {espontanea && (
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1"
                  htmlFor="areaInteresse"
                >
                  Qual área ou cargo você tem interesse?
                </label>
                <input
                  id="areaInteresse"
                  type="text"
                  value={areaInteresse}
                  onChange={(e) => setAreaInteresse(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-armac-blue"
                  placeholder="Ex: Lubrificador, Auxiliar administrativo..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="arquivo">
                Currículo (PDF, JPG ou PNG, até {MAX_SIZE_MB}MB)
              </label>
              <input
                id="arquivo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFile}
                className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-armac-blue/10 file:text-armac-blue file:px-3 file:py-2 file:text-sm file:font-semibold"
              />
            </div>

            {erro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-armac-green hover:bg-armac-greenDark disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {enviando ? 'Enviando...' : 'Enviar candidatura'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

