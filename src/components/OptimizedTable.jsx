import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown, Download, Filter, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVirtualScrolling } from '@/hooks/usePerformance'
import { ScreeningUtils } from '@/services/opLabAPI'

// Memoized table row component for performance
const MemoizedTableRow = React.memo(function TableRow({ 
  item, 
  isSelected, 
  onSelect, 
  style,
  columns,
  formatters 
}) {
  return (
    <tr 
      style={style}
      className={`border-b hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
      onClick={() => onSelect?.(item)}
    >
      {columns.map(column => {
        const value = item[column.key]
        const formatter = formatters[column.key]
        const displayValue = formatter ? formatter(value) : value

        return (
          <td key={column.key} className="p-3 text-sm">
            {column.render ? column.render(value, item) : displayValue}
          </td>
        )
      })}
    </tr>
  )
})

// Sortable header component
function SortableHeader({ 
  column, 
  sortBy, 
  sortDirection, 
  onSort 
}) {
  const isSorted = sortBy === column.key
  
  return (
    <th 
      className="p-3 text-left cursor-pointer hover:bg-muted/50 user-select-none"
      onClick={() => column.sortable !== false && onSort?.(column.key)}
    >
      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium">{column.title}</span>
        {column.sortable !== false && (
          <div className="flex flex-col">
            <ChevronUp 
              className={`h-3 w-3 ${isSorted && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground'}`} 
            />
            <ChevronDown 
              className={`h-3 w-3 -mt-1 ${isSorted && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground'}`} 
            />
          </div>
        )}
      </div>
    </th>
  )
}

// Main optimized table component
export function OptimizedTable({
  data = [],
  columns = [],
  title = '',
  onRowSelect,
  selectedRows = [],
  exportable = true,
  filterable = true,
  virtualScrolling = true,
  itemHeight = 60,
  containerHeight = 400,
  className = '',
  emptyMessage = 'Nenhum resultado encontrado'
}) {
  const [sortBy, setSortBy] = useState(null)
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedItems, setSelectedItems] = useState(selectedRows)
  const containerRef = useRef()

  // Memoized sort function
  const sortedData = useMemo(() => {
    if (!sortBy) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal || '').toLowerCase()
      const bStr = String(bVal || '').toLowerCase()
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr)
      }
      return bStr.localeCompare(aStr)
    })
  }, [data, sortBy, sortDirection])

  // Virtual scrolling for large datasets
  const {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex
  } = useVirtualScrolling({
    items: sortedData,
    itemHeight,
    containerHeight: virtualScrolling ? containerHeight : sortedData.length * itemHeight,
    overscan: 5
  })

  // Handle sorting
  const handleSort = useCallback((columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(columnKey)
      setSortDirection('desc')
    }
  }, [sortBy])

  // Handle row selection
  const handleRowSelect = useCallback((item) => {
    const itemId = item.symbol || item.id
    const isSelected = selectedItems.includes(itemId)
    
    if (isSelected) {
      setSelectedItems(prev => prev.filter(id => id !== itemId))
    } else {
      setSelectedItems(prev => [...prev, itemId])
    }
    
    onRowSelect?.(item, !isSelected)
  }, [selectedItems, onRowSelect])

  // Export functionality
  const handleExport = useCallback(() => {
    if (sortedData.length === 0) return

    const csvHeaders = columns.map(col => col.title).join(',')
    const csvRows = sortedData.map(item => 
      columns.map(col => {
        const value = item[col.key]
        return `"${value || ''}"`
      }).join(',')
    )

    const csvContent = [csvHeaders, ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    URL.revokeObjectURL(url)
  }, [sortedData, columns, title])

  // Default formatters
  const formatters = useMemo(() => ({
    price: (value) => ScreeningUtils.formatCurrency(value),
    volume: (value) => ScreeningUtils.formatVolume(value),
    roic: (value) => `${ScreeningUtils.formatNumber(value, 1)}%`,
    score: (value) => ScreeningUtils.formatNumber(value, 0),
    volatility: (value) => `${ScreeningUtils.formatNumber(value * 100, 1)}%`
  }), [])

  // Default columns if none provided
  const defaultColumns = useMemo(() => {
    if (columns.length > 0) return columns

    return [
      { key: 'symbol', title: 'Símbolo', sortable: true },
      { key: 'name', title: 'Nome', sortable: true },
      { key: 'price', title: 'Preço', sortable: true },
      { key: 'volume', title: 'Volume', sortable: true },
      { key: 'roic', title: 'ROIC', sortable: true },
      { 
        key: 'score', 
        title: 'Score', 
        sortable: true,
        render: (value) => (
          <Badge variant={value >= 80 ? 'default' : value >= 60 ? 'secondary' : 'outline'}>
            {ScreeningUtils.formatNumber(value, 0)}
          </Badge>
        )
      },
      { key: 'sector', title: 'Setor', sortable: true }
    ]
  }, [columns])

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {(title || exportable) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            <div className="flex items-center space-x-2">
              {exportable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExport}
                  disabled={sortedData.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div 
            ref={containerRef}
            className="overflow-auto"
            style={{ height: virtualScrolling ? containerHeight : 'auto' }}
            onScroll={virtualScrolling ? handleScroll : undefined}
          >
            <table className="w-full">
              <thead className="sticky top-0 bg-background border-b z-10">
                <tr>
                  {defaultColumns.map(column => (
                    <SortableHeader
                      key={column.key}
                      column={column}
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  ))}
                </tr>
              </thead>
              <tbody style={{ height: virtualScrolling ? totalHeight : 'auto' }}>
                {virtualScrolling ? (
                  // Virtual scrolling - only render visible items
                  <>
                    {startIndex > 0 && (
                      <tr style={{ height: startIndex * itemHeight }}>
                        <td colSpan={defaultColumns.length} />
                      </tr>
                    )}
                    {visibleItems.map((item, index) => (
                      <MemoizedTableRow
                        key={item.symbol || item.id || index}
                        item={item}
                        style={{ height: itemHeight }}
                        isSelected={selectedItems.includes(item.symbol || item.id)}
                        onSelect={handleRowSelect}
                        columns={defaultColumns}
                        formatters={formatters}
                      />
                    ))}
                    {endIndex < sortedData.length && (
                      <tr style={{ height: (sortedData.length - endIndex) * itemHeight }}>
                        <td colSpan={defaultColumns.length} />
                      </tr>
                    )}
                  </>
                ) : (
                  // Regular rendering - all items
                  sortedData.map((item, index) => (
                    <MemoizedTableRow
                      key={item.symbol || item.id || index}
                      item={item}
                      isSelected={selectedItems.includes(item.symbol || item.id)}
                      onSelect={handleRowSelect}
                      columns={defaultColumns}
                      formatters={formatters}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Footer with stats */}
        <div className="border-t p-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {sortedData.length} {sortedData.length === 1 ? 'resultado' : 'resultados'}
              {selectedItems.length > 0 && ` · ${selectedItems.length} selecionado${selectedItems.length !== 1 ? 's' : ''}`}
            </span>
            {virtualScrolling && sortedData.length > 50 && (
              <span className="flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                Scroll virtual ativo
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Higher-order component for table with filters
export function FilterableTable({ 
  data, 
  filters, 
  onFilterChange,
  ...tableProps 
}) {
  const filteredData = useMemo(() => {
    let result = data

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(item => 
        item.symbol?.toLowerCase().includes(searchLower) ||
        item.name?.toLowerCase().includes(searchLower) ||
        item.sector?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(item => item.price >= filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(item => item.price <= filters.maxPrice)
    }

    if (filters.minVolume !== undefined) {
      result = result.filter(item => item.volume >= filters.minVolume)
    }

    if (filters.minROIC !== undefined) {
      result = result.filter(item => (item.roic || 0) >= filters.minROIC)
    }

    if (filters.sectors && filters.sectors.length > 0) {
      result = result.filter(item => filters.sectors.includes(item.sector))
    }

    if (filters.minScore !== undefined) {
      result = result.filter(item => (item.score || 0) >= filters.minScore)
    }

    return result
  }, [data, filters])

  return (
    <OptimizedTable 
      data={filteredData}
      {...tableProps}
    />
  )
}

export default OptimizedTable