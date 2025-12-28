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

    const trimmedGistId = gistId.trim()
    const trimmedToken = githubToken.trim()

    if (trimmedGistId.length < 20) {
      toast.error('Invalid Gist ID format')
      return
    }

    if (trimmedGistId.includes('/') || trimmedGistId.includes('gist.github.com')) {
      toast.error('Enter only the Gist ID, not full URL')
      return
    }

    if (!trimmedToken.startsWith('ghp_') && !trimmedToken.startsWith('github_pat_')) {
      toast.error('Invalid GitHub token format')
      return
    }

    if (trimmedToken.length < 40) {
      toast.error('Invalid GitHub token - too short')
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading('Connecting to database...')
    
    try {
      const testResponse = await fetch(`https://api.github.com/gists/${trimmedGistId}`, {
        headers: {
          'Authorization': `Bearer ${trimmedToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('Invalid GitHub token')
        } else if (testResponse.status === 404) {
          throw new Error('Gist not found. Check your Gist ID')
        } else {
          throw new Error(`Verification error: ${testResponse.status}`)
        }
      }

      const gistData = await testResponse.json()
      
      if (!gistData.files || !gistData.files['imperial-restaurants-database.json']) {
        throw new Error('Not a restaurant database Gist')
      }

      await onSetup(trimmedGistId, trimmedToken)
      toast.dismiss(loadingToast)
      toast.success('Database connected successfully!')
      setGistId('')
      setGithubToken('')
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Failed to connect to database', {
        duration: 6000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!githubToken) {
      toast.error('Please enter your GitHub token')
      return
    }

    const trimmedToken = githubToken.trim()

    if (!trimmedToken.startsWith('ghp_') && !trimmedToken.startsWith('github_pat_')) {
      toast.error('Invalid token format')
      return
    }

    if (trimmedToken.length < 40) {
      toast.error('Invalid GitHub token - too short')
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading('Creating database...')
    
    try {
      const testResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${trimmedToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('Invalid GitHub token')
        } else {
          throw new Error(`GitHub authorization error: ${testResponse.status}`)
        }
      }

      const userData = await testResponse.json()
      toast.dismiss(loadingToast)
      toast.success(`Token verified (user: ${userData.login})`)
      
      const creatingToast = toast.loading('Creating database in your GitHub account...')

      const result = await onCreateNew(trimmedToken)
      
      toast.dismiss(creatingToast)
      toast.success('Database created successfully!', { duration: 5000 })
      toast.info(`Gist ID: ${result.gistId.substring(0, 12)}...`, { duration: 8000 })
      
      setGithubToken('')
      setMode('connect')
    } catch (error: any) {
      toast.dismiss(loadingToast)
      const errorMessage = error.message || 'Failed to create database'
      toast.error(errorMessage, { duration: 8000 })
    } finally {
      setIsLoading(false)
    }
  }

  if (isConfigured) {
    return (
      <Card className="border-accent/20 bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="text-accent" size={28} weight="fill" />
            <div>
              <CardTitle className="text-lg">Database Connected</CardTitle>
              <CardDescription>Restaurant data is stored securely in GitHub Gist</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-accent/5 border-accent/20">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              Database is active. All changes are automatically saved to the cloud.
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
          <XCircle className="text-destructive" size={28} weight="fill" />
          <div>
            <CardTitle className="text-lg">Database Not Configured</CardTitle>
            <CardDescription>Set up cloud storage before importing restaurants</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-destructive/10 border-destructive/30">
          <Info className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm font-medium">
            Without database configuration, all restaurant data will be lost when you refresh the page.
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
              <Label htmlFor="gist-id" className="font-semibold">GitHub Gist ID</Label>
              <Input
                id="gist-id"
                placeholder="Example: 8f3e4d2c1b9a7f6e5d4c3b2a1f0e9d8c"
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github-token" className="font-semibold">GitHub Personal Access Token</Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="font-mono"
              />
            </div>

            <Button onClick={handleConnect} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? 'Connecting...' : 'Connect Database'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-token-create" className="text-base font-semibold">GitHub Personal Access Token</Label>
              <Input
                id="github-token-create"
                type="password"
                placeholder="ghp_..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Create token at{' '}
                <a 
                  href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-accent hover:underline"
                >
                  github.com/settings/tokens/new
                </a>
                {' '}(check only "gist" scope)
              </p>
            </div>

            <Button onClick={handleCreate} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? 'Creating Database...' : 'Create Database'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
