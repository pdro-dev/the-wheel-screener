import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { useOpLabService } from '@/hooks/useOpLabAPI'

export function OptionsGrid({ symbol = 'PETR4' }) {
  const { getOptions, isAuthenticated } = useOpLabService()
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return

    const load = async () => {
      try {
        setLoading(true)
        const data = await getOptions(symbol)
        setOptions(data)
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [getOptions, isAuthenticated, symbol])

  if (!isAuthenticated) {
    return <p className="text-sm text-muted-foreground">Configure a API para visualizar as opções.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade de Opções</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map(opt => (
                <TableRow key={opt.symbol}>
                  <TableCell>{opt.symbol}</TableCell>
                  <TableCell>{opt.type || '-'}</TableCell>
                  <TableCell>{opt.strikePrice ?? '-'}</TableCell>
                  <TableCell>{opt.expiration || '-'}</TableCell>
                  <TableCell>{opt.lastPrice ?? '-'}</TableCell>
                  <TableCell>{opt.volume ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default OptionsGrid
