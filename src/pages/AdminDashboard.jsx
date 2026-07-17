import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import CargosTab from '../components/CargosTab.jsx'
import CandidaturasTab from '../components/CandidaturasTab.jsx'
import BancoTalentosTab from '../components/BancoTalentosTab.jsx'

export default function AdminDashboard() {
  const [aba, setAba] = useState('candidaturas')
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-armac-blue flex items-center justify-center text-white font-extrabold">
              a
            </div>
            <div>
              <p className="text-armac-blue font-extrabold leading-none">armac</p>
              <p className="text-armac-green text-[11px] font-semibold tracking-wide">
                PAINEL ADMINISTRATIVO
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold text-slate-500 hover:text-armac-blueDarker"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setAba('candidaturas')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              aba === 'candidaturas'
                ? 'bg-armac-blue text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Candidaturas
          </button>
          <button
            type="button"
            onClick={() => setAba('cargos')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              aba === 'cargos'
                ? 'bg-armac-blue text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Cargos
          </button>
          <button
            type="button"
            onClick={() => setAba('banco')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              aba === 'banco'
                ? 'bg-armac-blue text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Banco de Talentos
          </button>
        </div>

        {aba === 'candidaturas' && <CandidaturasTab />}
        {aba === 'cargos' && <CargosTab />}
        {aba === 'banco' && <BancoTalentosTab />}
      </main>
    </div>
  )
}
