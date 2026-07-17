function escapeCsv(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportCandidaturasCsv(candidaturas, nomeArquivo = 'candidaturas.csv') {
  const colunas = ['Nome', 'Email', 'Telefone', 'Vaga', 'Status', 'Recebido em', 'Notas']
  const linhas = candidaturas.map((c) => [
    c.nome,
    c.email,
    c.telefone,
    c.cargos?.titulo || '',
    c.status,
    new Date(c.created_at).toLocaleString('pt-BR'),
    c.notas || '',
  ])

  const csv = [colunas, ...linhas]
    .map((linha) => linha.map(escapeCsv).join(','))
    .join('\n')

  // BOM para o Excel abrir acentos corretamente
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
