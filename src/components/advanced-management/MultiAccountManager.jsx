import React, { useState, useEffect, useMemo } from 'react'
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Key,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Generate mock accounts data
const generateMockAccounts = () => {
  const accounts = [
    {
      id: '1',
      name: 'Conta Principal',
      broker: 'OpLab',
      apiKey: 'oplab_key_123456789',
      status: 'active',
      balance: 150000,
      positions: 12,
      lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      createdAt: new Date('2024-01-15'),
      permissions: ['read', 'trade', 'withdraw'],
      riskLevel: 'medium',
      notes: 'Conta principal para operações de renda variável'
    },
    {
      id: '2',
      name: 'Conta Swing Trade',
      broker: 'XP Investimentos',
      apiKey: 'xp_key_987654321',
      status: 'active',
      balance: 75000,
      positions: 8,
      lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      createdAt: new Date('2024-02-20'),
      permissions: ['read', 'trade'],
      riskLevel: 'high',
      notes: 'Conta dedicada para swing trade em ações'
    },
    {
      id: '3',
      name: 'Conta Day Trade',
      broker: 'Clear Corretora',
      apiKey: 'clear_key_456789123',
      status: 'inactive',
      balance: 25000,
      positions: 0,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date('2024-03-10'),
      permissions: ['read'],
      riskLevel: 'high',
      notes: 'Conta para day trade - temporariamente inativa'
    },
    {
      id: '4',
      name: 'Conta Conservadora',
      broker: 'Itaú Corretora',
      apiKey: 'itau_key_789123456',
      status: 'error',
      balance: 200000,
      positions: 15,
      lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      createdAt: new Date('2024-01-05'),
      permissions: ['read', 'trade'],
      riskLevel: 'low',
      notes: 'Conta para investimentos conservadores - erro de conexão'
    }
  ]

  return accounts
}

export function MultiAccountManager() {
  const [accounts, setAccounts] = useState(() => generateMockAccounts())
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showKeyDialog, setShowKeyDialog] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: '',
    broker: '',
    apiKey: '',
    permissions: ['read'],
    riskLevel: 'medium',
    notes: ''
  })
  const [showApiKeys, setShowApiKeys] = useState({})

  // Account statistics
  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    const totalPositions = accounts.reduce((sum, acc) => sum + acc.positions, 0)
    const activeAccounts = accounts.filter(acc => acc.status === 'active').length
    const errorAccounts = accounts.filter(acc => acc.status === 'error').length

    return {
      totalBalance,
      totalPositions,
      activeAccounts,
      errorAccounts,
      totalAccounts: accounts.length
    }
  }, [accounts])

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  // Get risk level color
  const getRiskColor = (level) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Toggle API key visibility
  const toggleApiKeyVisibility = (accountId) => {
    setShowApiKeys(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  // Copy API key to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  // Add new account
  const handleAddAccount = () => {
    const account = {
      id: Date.now().toString(),
      ...newAccount,
      status: 'active',
      balance: 0,
      positions: 0,
      lastSync: new Date(),
      createdAt: new Date()
    }

    setAccounts(prev => [...prev, account])
    setNewAccount({
      name: '',
      broker: '',
      apiKey: '',
      permissions: ['read'],
      riskLevel: 'medium',
      notes: ''
    })
    setShowAddDialog(false)
  }

  // Edit account
  const handleEditAccount = () => {
    setAccounts(prev => prev.map(acc => 
      acc.id === selectedAccount.id ? { ...acc, ...newAccount } : acc
    ))
    setShowEditDialog(false)
    setSelectedAccount(null)
  }

  // Delete account
  const handleDeleteAccount = () => {
    setAccounts(prev => prev.filter(acc => acc.id !== selectedAccount.id))
    setShowDeleteDialog(false)
    setSelectedAccount(null)
  }

  // Sync account
  const handleSyncAccount = (accountId) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, lastSync: new Date(), status: 'active' }
        : acc
    ))
  }

  // Export accounts
  const handleExport = () => {
    const exportData = accounts.map(acc => ({
      name: acc.name,
      broker: acc.broker,
      status: acc.status,
      balance: acc.balance,
      positions: acc.positions,
      riskLevel: acc.riskLevel,
      createdAt: acc.createdAt.toISOString(),
      lastSync: acc.lastSync.toISOString()
    }))

    const csvContent = [
      ['Nome', 'Corretora', 'Status', 'Saldo', 'Posições', 'Risco', 'Criado', 'Última Sync'].join(','),
      ...exportData.map(acc => [
        acc.name,
        acc.broker,
        acc.status,
        acc.balance,
        acc.positions,
        acc.riskLevel,
        acc.createdAt,
        acc.lastSync
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'accounts-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Multi Account Manager</h2>
          <p className="text-muted-foreground">
            Gerencie múltiplas contas de corretoras em um só lugar
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Conta</DialogTitle>
                <DialogDescription>
                  Configure uma nova conta de corretora para integração
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="Ex: Conta Principal"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="broker" className="text-right">Corretora</Label>
                  <Select value={newAccount.broker} onValueChange={(value) => setNewAccount(prev => ({ ...prev, broker: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione a corretora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OpLab">OpLab</SelectItem>
                      <SelectItem value="XP Investimentos">XP Investimentos</SelectItem>
                      <SelectItem value="Clear Corretora">Clear Corretora</SelectItem>
                      <SelectItem value="Itaú Corretora">Itaú Corretora</SelectItem>
                      <SelectItem value="Rico Investimentos">Rico Investimentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newAccount.apiKey}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="col-span-3"
                    placeholder="Chave da API"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="riskLevel" className="text-right">Nível de Risco</Label>
                  <Select value={newAccount.riskLevel} onValueChange={(value) => setNewAccount(prev => ({ ...prev, riskLevel: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newAccount.notes}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, notes: e.target.value }))}
                    className="col-span-3"
                    placeholder="Notas sobre esta conta..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddAccount}>
                  Adicionar Conta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Total de Contas</p>
                <p className="text-2xl font-bold">{stats.totalAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Contas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium">Com Erro</p>
                <p className="text-2xl font-bold text-red-600">{stats.errorAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                R$
              </div>
              <div>
                <p className="text-sm font-medium">Saldo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                #
              </div>
              <div>
                <p className="text-sm font-medium">Posições</p>
                <p className="text-2xl font-bold">{stats.totalPositions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Contas Configuradas</CardTitle>
              <CardDescription>
                Gerencie suas contas de corretoras e APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Corretora</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Posições</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Última Sync</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.broker}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(account.status)}
                            <Badge className={getStatusColor(account.status)}>
                              {account.status === 'active' ? 'Ativa' : 
                               account.status === 'inactive' ? 'Inativa' : 'Erro'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(account.balance)}</TableCell>
                        <TableCell>{account.positions}</TableCell>
                        <TableCell>
                          <Badge className={getRiskColor(account.riskLevel)}>
                            {account.riskLevel === 'low' ? 'Baixo' :
                             account.riskLevel === 'medium' ? 'Médio' : 'Alto'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(account.lastSync)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncAccount(account.id)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account)
                                setNewAccount({
                                  name: account.name,
                                  broker: account.broker,
                                  apiKey: account.apiKey,
                                  permissions: account.permissions,
                                  riskLevel: account.riskLevel,
                                  notes: account.notes
                                })
                                setShowEditDialog(true)
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {account.name}
                    {getStatusIcon(account.status)}
                  </CardTitle>
                  <CardDescription>{account.broker}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Permissões Atuais</h4>
                      <div className="flex flex-wrap gap-2">
                        {account.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">
                            {permission === 'read' ? 'Leitura' :
                             permission === 'trade' ? 'Negociação' :
                             permission === 'withdraw' ? 'Saque' : permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Configurações de Segurança</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">API Key Criptografada</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rate Limiting</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Logs de Auditoria</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </div>

                    {account.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Observações</h4>
                        <p className="text-sm text-muted-foreground">{account.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Todas as API keys são criptografadas e armazenadas com segurança. 
                Nunca compartilhe suas chaves com terceiros.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Gerencie as chaves de API das suas contas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-sm text-muted-foreground">{account.broker}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                          {showApiKeys[account.id] 
                            ? account.apiKey 
                            : '•'.repeat(account.apiKey.length)
                          }
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(account.id)}
                        >
                          {showApiKeys[account.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.apiKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança Global</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Criptografia de API Keys</h4>
                      <p className="text-sm text-muted-foreground">
                        Criptografar todas as chaves de API armazenadas
                      </p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Rate Limiting</h4>
                      <p className="text-sm text-muted-foreground">
                        Limitar número de requisições por minuto
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Logs de Auditoria</h4>
                      <p className="text-sm text-muted-foreground">
                        Registrar todas as operações realizadas
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Backup Automático</h4>
                      <p className="text-sm text-muted-foreground">
                        Backup diário das configurações
                      </p>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
            <DialogDescription>
              Atualize as informações da conta selecionada
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Nome</Label>
              <Input
                id="edit-name"
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-broker" className="text-right">Corretora</Label>
              <Select value={newAccount.broker} onValueChange={(value) => setNewAccount(prev => ({ ...prev, broker: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpLab">OpLab</SelectItem>
                  <SelectItem value="XP Investimentos">XP Investimentos</SelectItem>
                  <SelectItem value="Clear Corretora">Clear Corretora</SelectItem>
                  <SelectItem value="Itaú Corretora">Itaú Corretora</SelectItem>
                  <SelectItem value="Rico Investimentos">Rico Investimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">Observações</Label>
              <Textarea
                id="edit-notes"
                value={newAccount.notes}
                onChange={(e) => setNewAccount(prev => ({ ...prev, notes: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditAccount}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a conta "{selectedAccount?.name}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Excluir Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

