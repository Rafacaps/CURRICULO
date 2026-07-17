import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import Header from '../components/Header.jsx'
import JobCard from '../components/JobCard.jsx'
import ApplyModal from '../components/ApplyModal.jsx'
import QRCodeBox from '../components/QRCodeBox.jsx'

export default function Home() {
  const [cargos, setCargos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [abertoId, setAbertoId] = useState(null)
  const [cargoSelecionado, setCargoSelecionado] = useState(null)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const { data, error } = await supabase
        .from('cargos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setErro('Não foi possível carregar as vagas agora. Atualize a página em instantes.')
      } else {
        setCargos(data)
      }
      setCarregando(false)
    }
    carregar()
  }, [])

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <section className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-armac-blueDarker">
            Vagas abertas na Armac
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Escolha a vaga que combina com seu perfil, veja a descrição completa e
            envie seu currículo em poucos minutos.
          </p>
        </section>

        <section className="mb-8">
          <QRCodeBox />
        </section>

        <section className="space-y-4">
          {carregando && (
            <p className="text-slate-500 text-sm">Carregando vagas...</p>
          )}

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {erro}
            </p>
          )}

          {!carregando && !erro && cargos.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
              Nenhuma vaga aberta no momento. Volte em breve!
            </div>
          )}

          {cargos.map((cargo) => (
            <JobCard
              key={cargo.id}
              cargo={cargo}
              isOpen={abertoId === cargo.id}
              onToggle={() => setAbertoId(abertoId === cargo.id ? null : cargo.id)}
              onApply={setCargoSelecionado}
            />
          ))}
        </section>
      </main>

      <footer className="text-center text-xs text-slate-400 py-8">
        © {new Date().getFullYear()} Armac. Todos os direitos reservados.
      </footer>

      {cargoSelecionado && (
        <ApplyModal cargo={cargoSelecionado} onClose={() => setCargoSelecionado(null)} />
      )}
    </div>
  )
}
