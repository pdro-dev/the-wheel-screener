import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { useOpLabService } from '@/hooks/useOpLabAPI'

export function AssetGrid() {
  const { getInstruments, getQuotes, isAuthenticated } = useOpLabService()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return

    const load = async () => {
      try {
        setLoading(true)
        const instruments = await getInstruments()
        const symbols = instruments.slice(0, 50).map(i => i.symbol)
        const quotes = await getQuotes(symbols)
        const merged = instruments.map(inst => {
          const quote = quotes.find(q => q.symbol === inst.symbol) || {}
          return {
            symbol: inst.symbol,
            name: inst.name,
            price: quote.price,
            volume: quote.volume
          }
        })
        setAssets(merged)
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [getInstruments, getQuotes, isAuthenticated])

  if (!isAuthenticated) {
    return <p className="text-sm text-muted-foreground">Configure a API para visualizar os ativos.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade de Ativos</CardTitle>
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
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map(asset => (
                <TableRow key={asset.symbol}>
                  <TableCell>{asset.symbol}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.price ?? '-'}</TableCell>
                  <TableCell>{asset.volume ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default AssetGrid
