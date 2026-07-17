export const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', color: 'bg-slate-100 text-slate-700' },
  { value: 'em_analise', label: 'Em análise', color: 'bg-blue-100 text-blue-700' },
  { value: 'entrevista', label: 'Entrevista', color: 'bg-amber-100 text-amber-700' },
  { value: 'aprovado', label: 'Aprovado', color: 'bg-armac-green/15 text-armac-greenDark' },
  { value: 'reprovado', label: 'Reprovado', color: 'bg-red-100 text-red-700' },
]

export function statusInfo(value) {
  return STATUS_OPTIONS.find((s) => s.value === value) || STATUS_OPTIONS[0]
}

export default function StatusSelect({ value, onChange }) {
  const info = statusInfo(value)
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer ${info.color}`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
