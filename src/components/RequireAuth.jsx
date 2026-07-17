import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function RequireAuth({ children }) {
  const [status, setStatus] = useState('checking') // checking | in | out

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setStatus(data.session ? 'in' : 'out')
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'in' : 'out')
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center text-armac-blueDarker">
        Carregando...
      </div>
    )
  }

  if (status === 'out') {
    return <Navigate to="/admin" replace />
  }

  return children
}
