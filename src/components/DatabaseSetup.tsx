import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Database, Plus, CheckCircle, XCircle, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DatabaseSetupProps {
  onSetup: (gistId: string, githubToken: string) => Promise<void>
  onCreateNew: (githubToken: string) => Promise<{ gistId: string; url: string }>
  isConfigured: boolean
}

export default function DatabaseSetup({ onSetup, onCreateNew, isConfigured }: DatabaseSetupProps) {
  const [mode, setMode] = useState<'connect' | 'create'>('connect')
  const [gistId, setGistId] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    if (!gistId || !githubToken) {
      toast.error('Please fill all fields')
      return
    }

    setIsLoading(true)
    try {
      await onSetup(gistId.trim(), githubToken.trim())
      toast.success('Database connected successfully')
      setGistId('')
      setGithubToken('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to database')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!githubToken) {
      toast.error('Please enter your GitHub token')
      return
    }

    setIsLoading(true)
    try {
      const result = await onCreateNew(githubToken.trim())
      toast.success('Database created successfully!')
      toast.info(`Gist ID: ${result.gistId}`, { duration: 10000 })
      setGithubToken('')
      setMode('connect')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create database')
    } finally {
      setIsLoading(false)
    }
  }

  if (isConfigured) {
    return (
      <Card className="border-accent/20 bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="text-accent" size={24} weight="fill" />
            <div>
              <CardTitle className="text-lg">Database Connected</CardTitle>
              <CardDescription>Your restaurant data is stored in GitHub Gist</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="bg-muted/30 border-accent/20">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              All changes are now saved to the cloud and will be visible to all users.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <XCircle className="text-destructive" size={24} weight="fill" />
          <div>
            <CardTitle className="text-lg">Database Not Configured</CardTitle>
            <CardDescription>Set up cloud storage to save your restaurants</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-destructive/5 border-destructive/20">
          <Info className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm">
            Without database configuration, all data will be lost when you refresh the page or deploy to production.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            variant={mode === 'connect' ? 'default' : 'outline'}
            onClick={() => setMode('connect')}
            className="flex-1"
          >
            <Database size={16} className="mr-2" />
            Connect Existing
          </Button>
          <Button
            variant={mode === 'create' ? 'default' : 'outline'}
            onClick={() => setMode('create')}
            className="flex-1"
          >
            <Plus size={16} className="mr-2" />
            Create New
          </Button>
        </div>

        {mode === 'connect' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gist-id">GitHub Gist ID</Label>
              <Input
                id="gist-id"
                placeholder="abc123def456..."
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The ID from your Gist URL (after /gist/)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github-token">GitHub Personal Access Token</Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Token with 'gist' scope. <a href="https://github.com/settings/tokens/new?scopes=gist&description=MERIDIEN%20Database" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Create one here</a>
              </p>
            </div>

            <Button onClick={handleConnect} disabled={isLoading} className="w-full">
              {isLoading ? 'Connecting...' : 'Connect Database'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-accent/5 border-accent/20">
              <Info className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm">
                This will create a new private GitHub Gist to store your restaurant data. You'll receive a Gist ID that you should save.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="github-token-create">GitHub Personal Access Token</Label>
              <Input
                id="github-token-create"
                type="password"
                placeholder="ghp_..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Token with 'gist' scope. <a href="https://github.com/settings/tokens/new?scopes=gist&description=MERIDIEN%20Database" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Create one here</a>
              </p>
            </div>

            <Button onClick={handleCreate} disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Database'}
            </Button>
          </div>
        )}

        <Alert className="bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p className="font-medium">How to set up:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create a GitHub Personal Access Token with 'gist' scope</li>
              <li>Either connect to an existing Gist or create a new one</li>
              <li>Save your Gist ID securely for future use</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
