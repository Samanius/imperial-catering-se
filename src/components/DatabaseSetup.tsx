import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Database, Plus, CheckCircle, XCircle, Info, ArrowSquareOut, PencilSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { db } from '@/lib/database'

interface DatabaseSetupProps {
  onSetup: (gistId: string, githubToken: string) => Promise<void>
  onCreateNew: (githubToken: string) => Promise<{ gistId: string; url: string }>
  isConfigured: boolean
  hasWriteAccess?: boolean
}

export default function DatabaseSetup({ onSetup, onCreateNew, isConfigured, hasWriteAccess = false }: DatabaseSetupProps) {
  const [mode, setMode] = useState<'connect' | 'create'>('connect')
  const [gistId, setGistId] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEditingToken, setIsEditingToken] = useState(false)
  const [newToken, setNewToken] = useState('')

  const handleConnect = async () => {
    const trimmedToken = githubToken.trim()
    let trimmedGistId = gistId.trim()

    if (!isConfigured && !trimmedGistId) {
      toast.error('Please enter Gist ID')
      return
    }

    if (isConfigured && !trimmedGistId) {
      const credentials = db.getCredentials()
      trimmedGistId = credentials.gistId || ''
    }

    if (!trimmedToken) {
      toast.error('Please enter GitHub token')
      return
    }

    if (trimmedGistId && trimmedGistId.length < 20) {
      toast.error('Invalid Gist ID format')
      return
    }

    if (trimmedGistId && (trimmedGistId.includes('/') || trimmedGistId.includes('gist.github.com'))) {
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
      
      if (!gistData.files || !gistData.files['imperial-restaurants.json']) {
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

  const handleUpdateToken = async () => {
    const trimmedToken = newToken.trim()

    if (!trimmedToken) {
      toast.error('Please enter a new GitHub token')
      return
    }

    if (!trimmedToken.startsWith('ghp_') && !trimmedToken.startsWith('github_pat_')) {
      toast.error('Invalid token format')
      return
    }

    if (trimmedToken.length < 40) {
      toast.error('Invalid GitHub token - too short')
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading('Verifying new token...')
    
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
      
      const credentials = db.getCredentials()
      const currentGistId = credentials.gistId || ''

      if (currentGistId) {
        const gistResponse = await fetch(`https://api.github.com/gists/${currentGistId}`, {
          headers: {
            'Authorization': `Bearer ${trimmedToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })

        if (!gistResponse.ok) {
          if (gistResponse.status === 404) {
            throw new Error('Cannot access database with this token. Make sure you own the Gist or have access to it.')
          } else if (gistResponse.status === 401) {
            throw new Error('Token is valid but cannot access the database')
          }
        }
      }

      await onSetup(currentGistId, trimmedToken)
      
      toast.dismiss(loadingToast)
      toast.success(`GitHub token updated successfully (user: ${userData.login})`)
      
      setNewToken('')
      setIsEditingToken(false)
    } catch (error: any) {
      toast.dismiss(loadingToast)
      const errorMessage = error.message || 'Failed to update token'
      toast.error(errorMessage, { duration: 8000 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className={isConfigured ? (hasWriteAccess ? "border-accent/20 bg-card" : "border-yellow-500/20 bg-card") : "border-destructive/20"}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {isConfigured ? (
              hasWriteAccess ? (
                <>
                  <CheckCircle className="text-accent" size={28} weight="fill" />
                  <div>
                    <CardTitle className="text-lg">Database Connected (Full Access)</CardTitle>
                    <CardDescription>Restaurant data is stored securely. You can read and write.</CardDescription>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="text-yellow-600" size={28} weight="fill" />
                  <div>
                    <CardTitle className="text-lg">Database Connected (Read-Only)</CardTitle>
                    <CardDescription>You can view data. Add GitHub token for write access.</CardDescription>
                  </div>
                </>
              )
            ) : (
              <>
                <XCircle className="text-destructive" size={28} weight="fill" />
                <div>
                  <CardTitle className="text-lg">Database Not Configured</CardTitle>
                  <CardDescription>Set up cloud storage before importing restaurants</CardDescription>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isConfigured && hasWriteAccess ? (
            <>
              <Alert className="bg-accent/5 border-accent/20">
                <Info className="h-4 w-4 text-accent" />
                <AlertDescription className="text-sm">
                  Database is active. All changes are automatically saved to the cloud.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">GitHub Token</p>
                    <p className="text-xs text-muted-foreground">Update your access token if needed</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingToken(!isEditingToken)}
                  >
                    <PencilSimple size={16} className="mr-2" />
                    {isEditingToken ? 'Cancel' : 'Change Token'}
                  </Button>
                </div>

                {isEditingToken && (
                  <div className="space-y-3 pt-2">
                    <Alert className="bg-accent/5 border-accent/20">
                      <Info className="h-4 w-4 text-accent" />
                      <AlertDescription className="text-xs space-y-2">
                        <p className="font-semibold">Need a new token?</p>
                        <div className="flex flex-col gap-1">
                          <a 
                            href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-accent hover:underline inline-flex items-center gap-1"
                          >
                            Create New API Token <ArrowSquareOut size={14} weight="bold" />
                          </a>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="new-token" className="font-semibold">New GitHub Token</Label>
                      <Input
                        id="new-token"
                        type="password"
                        placeholder="ghp_..."
                        value={newToken}
                        onChange={(e) => setNewToken(e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Token must have "gist" scope enabled
                      </p>
                    </div>

                    <Button 
                      onClick={handleUpdateToken} 
                      disabled={isLoading || !newToken.trim()} 
                      className="w-full" 
                      size="sm"
                    >
                      {isLoading ? 'Updating Token...' : 'Update Token'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : isConfigured && !hasWriteAccess ? (
            <>
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm font-medium">
                  You are in read-only mode. To add or edit restaurants, configure your GitHub token below.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant={mode === 'connect' ? 'default' : 'outline'}
                  onClick={() => setMode('connect')}
                  className="flex-1"
                >
                  <Database size={16} className="mr-2" />
                  Add Write Access
                </Button>
              </div>

              {mode === 'connect' && (
                <div className="space-y-4">
                  <Alert className="bg-accent/5 border-accent/20">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertDescription className="text-xs space-y-2">
                      <p className="font-semibold">Quick Links:</p>
                      <div className="flex flex-col gap-1">
                        <a 
                          href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent hover:underline inline-flex items-center gap-1"
                        >
                          Create API Token <ArrowSquareOut size={14} weight="bold" />
                        </a>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="github-token-readonly" className="font-semibold">GitHub Personal Access Token</Label>
                    <Input
                      id="github-token-readonly"
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

                  <Button 
                    onClick={handleConnect} 
                    disabled={isLoading} 
                    className="w-full" 
                    size="lg"
                  >
                    {isLoading ? 'Connecting...' : 'Enable Write Access'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
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
                  <Alert className="bg-accent/5 border-accent/20">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertDescription className="text-xs space-y-2">
                      <p className="font-semibold">Quick Links:</p>
                      <div className="flex flex-col gap-1">
                        <a 
                          href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent hover:underline inline-flex items-center gap-1"
                        >
                          Create API Token <ArrowSquareOut size={14} weight="bold" />
                        </a>
                        <a 
                          href="https://gist.github.com/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent hover:underline inline-flex items-center gap-1"
                        >
                          View Your Gists <ArrowSquareOut size={14} weight="bold" />
                        </a>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="gist-id" className="font-semibold">GitHub Gist ID</Label>
                    <Input
                      id="gist-id"
                      placeholder="Example: 8f3e4d2c1b9a7f6e5d4c3b2a1f0e9d8c"
                      value={gistId}
                      onChange={(e) => setGistId(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Find your Gist ID at{' '}
                      <a 
                        href="https://gist.github.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-accent hover:underline"
                      >
                        gist.github.com
                      </a>
                      {' '}(it's in the URL)
                    </p>
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

                  <Button onClick={handleConnect} disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? 'Connecting...' : 'Connect Database'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-accent/5 border-accent/20">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertDescription className="text-xs space-y-2">
                      <p className="font-semibold">Quick Links:</p>
                      <div className="flex flex-col gap-1">
                        <a 
                          href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent hover:underline inline-flex items-center gap-1"
                        >
                          Create API Token <ArrowSquareOut size={14} weight="bold" />
                        </a>
                        <a 
                          href="https://gist.github.com/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent hover:underline inline-flex items-center gap-1"
                        >
                          View Your Gists <ArrowSquareOut size={14} weight="bold" />
                        </a>
                      </div>
                    </AlertDescription>
                  </Alert>

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
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/30 mt-6">
        <CardHeader>
          <CardTitle className="text-base">Configuration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="font-semibold text-foreground mb-2 font-body">Google</div>
              <div className="space-y-1.5 pl-2">
                <div>
                  <span className="text-muted-foreground">Folder:</span>
                  <br />
                  <a 
                    href="https://drive.google.com/drive/u/0/folders/1aQW3j8oAtwYSDPcjM2LxpJXRNDDPEVqs" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-accent hover:underline break-all"
                  >
                    https://drive.google.com/drive/u/0/folders/1aQW3j8oAtwYSDPcjM2LxpJXRNDDPEVqs
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">File:</span>
                  <br />
                  <a 
                    href="https://docs.google.com/spreadsheets/d/1my60zyjTGdDaY0sen9WAxCWooP7EDPneRTzwVDxoxEQ/edit?gid=0#gid=0" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-accent hover:underline break-all"
                  >
                    https://docs.google.com/spreadsheets/d/1my60zyjTGdDaY0sen9WAxCWooP7EDPneRTzwVDxoxEQ/edit?gid=0#gid=0
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">Api Key:</span> AIzaSyDX3Morf9Oeg-ANaP4ABE_irlIRbqMsSyE
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-foreground mb-2 font-body">Git</div>
              <div className="space-y-1.5 pl-2">
                <div>
                  <span className="text-muted-foreground">Api Token:</span> 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
                </div>
                <div>
                  <span className="text-muted-foreground">Database:</span> {db.getCredentials().gistId || '❌ Not configured'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
