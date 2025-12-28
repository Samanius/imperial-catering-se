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
              <CardTitle className="text-lg">✅ Database Connected Successfully</CardTitle>
              <CardDescription>Your restaurant data is stored securely in GitHub Gist</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-accent/5 border-accent/20">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              ✓ All changes are automatically saved to the cloud<br />
              ✓ Data persists across page refreshes and deployments<br />
              ✓ You can now import restaurants from Google Sheets
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground">
            Your database is ready! Go to the <strong>Restaurants</strong> tab to manage your data or import from Google Sheets.
          </p>
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
            <CardTitle className="text-lg">⚠️ Database Not Configured</CardTitle>
            <CardDescription>Required: Set up cloud storage to save your restaurants permanently</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-destructive/10 border-destructive/30">
          <Info className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm font-medium">
            <strong>IMPORTANT:</strong> Without database configuration, all restaurant data will be lost when you refresh the page, close the browser, or deploy to production. You MUST set up the database before importing from Google Sheets.
          </AlertDescription>
        </Alert>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold text-foreground">Quick Start Guide:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
            <li>Create a GitHub Personal Access Token (link below)</li>
            <li>Click "Create New" to make a new database</li>
            <li>Paste your token and click "Create Database"</li>
            <li>Save the Gist ID shown for future reference</li>
            <li>Done! Your data will now persist permanently</li>
          </ol>
        </div>

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
            <Alert className="bg-muted/30 border-border">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Use this option if you already have a Gist ID from a previous setup. If this is your first time, use <strong>"Create New"</strong> instead.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="gist-id">GitHub Gist ID</Label>
              <Input
                id="gist-id"
                placeholder="abc123def456..."
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The ID from your Gist URL (the long string after /gist/)
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
                Token with 'gist' scope. <a href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Create one here</a>
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
                <strong>Recommended for new users:</strong> This will create a new private GitHub Gist to store your restaurant data. This is the easiest way to get started. You'll receive a Gist ID that you should save for future reference.
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
                Need a token? <a href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">Click here to create one</a> (only takes 30 seconds)
              </p>
            </div>

            <Button onClick={handleCreate} disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Database'}
            </Button>
            
            <div className="bg-muted/30 p-3 rounded text-xs space-y-1">
              <p className="font-medium">What happens when you click Create:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2 text-muted-foreground">
                <li>A new private Gist is created in your GitHub account</li>
                <li>You'll get a Gist ID (save this for backup/recovery)</li>
                <li>Database is automatically connected</li>
                <li>You can immediately start importing restaurants</li>
              </ul>
            </div>
          </div>
        )}

        <Alert className="bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p className="font-medium">🚀 How to set up (first time):</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to <a href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">GitHub Settings → Tokens → New Token</a></li>
              <li>Check ONLY the "gist" checkbox</li>
              <li>Click "Generate token" and copy it</li>
              <li>Click "Create New" above and paste your token</li>
              <li>Save the Gist ID you receive</li>
            </ol>
            <p className="text-muted-foreground mt-2">💡 This is a one-time setup that takes about 2 minutes.</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
