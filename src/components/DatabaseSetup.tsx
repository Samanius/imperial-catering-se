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
      toast.error('Invalid Gist ID format - must be at least 20 characters long')
      return
    }

    if (trimmedGistId.includes('/') || trimmedGistId.includes('gist.github.com')) {
      toast.error('Enter only the Gist ID, not the full URL. Example: abc123def456...')
      return
    }

    if (!trimmedToken.startsWith('ghp_') && !trimmedToken.startsWith('github_pat_')) {
      toast.error('Invalid GitHub token format - must start with "ghp_" or "github_pat_"')
      return
    }

    if (trimmedToken.length < 40) {
      toast.error('Invalid GitHub token - token appears incomplete (too short)')
      return
    }

    setIsLoading(true)
    try {
      await onSetup(trimmedGistId, trimmedToken)
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

    const trimmedToken = githubToken.trim()

    if (!trimmedToken.startsWith('ghp_') && !trimmedToken.startsWith('github_pat_')) {
      toast.error('Invalid GitHub token format - must start with "ghp_" or "github_pat_"')
      return
    }

    if (trimmedToken.length < 40) {
      toast.error('Invalid GitHub token - token appears incomplete (too short)')
      return
    }

    setIsLoading(true)
    try {
      const result = await onCreateNew(trimmedToken)
      toast.success('✅ Database created successfully!')
      toast.info(`Gist ID saved: ${result.gistId}`, { duration: 10000 })
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
            <CheckCircle className="text-accent" size={28} weight="fill" />
            <div>
              <CardTitle className="text-lg">✅ Database Connected & Ready</CardTitle>
              <CardDescription>Your restaurant data is stored securely in GitHub Gist</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-accent/5 border-accent/20">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              <strong>✓ Database is active and working</strong><br />
              ✓ All changes are automatically saved to the cloud<br />
              ✓ Data persists across page refreshes and deployments<br />
              ✓ You can now import restaurants from Google Sheets
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground">
            Your database is fully configured! Go to the <strong>Restaurants</strong> tab to manage your data or import from Google Sheets.
          </p>
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
            <CardTitle className="text-lg">⚠️ Database Not Configured</CardTitle>
            <CardDescription className="font-semibold">REQUIRED: Set up cloud storage before importing restaurants</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-destructive/10 border-destructive/30">
          <Info className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm font-medium">
            <strong>⚠️ CRITICAL:</strong> Without database configuration, all restaurant data will be lost when you refresh the page, close the browser, or deploy to production. You MUST set up the database before importing from Google Sheets or creating restaurants.
          </AlertDescription>
        </Alert>

        <div className="bg-accent/10 p-4 rounded-lg border border-accent/20 space-y-3">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <CheckCircle size={20} className="text-accent" weight="fill" />
            Quick Start - 3 Easy Steps (~2 minutes):
          </p>
          <ol className="list-decimal list-inside space-y-3 text-sm ml-2">
            <li className="text-foreground">
              <strong>Get GitHub Token:</strong>{' '}
              <a 
                href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-accent hover:underline font-medium"
              >
                Click this direct link
              </a>
              <div className="mt-2 ml-6 text-xs space-y-1 text-muted-foreground bg-background/50 p-2 rounded border border-border">
                <p>→ You'll see a page titled <strong className="text-foreground">"New personal access token (classic)"</strong></p>
                <p>→ Note field: Already filled with "Imperial Restaurant Database"</p>
                <p>→ Expiration: Select "No expiration" (or 90 days if you prefer)</p>
                <p>→ <strong className="text-accent">IMPORTANT:</strong> Check ONLY the box labeled <strong className="text-foreground">"gist"</strong> (under "Select scopes")</p>
                <p>→ Scroll to bottom → Click green <strong className="text-foreground">"Generate token"</strong> button</p>
                <p>→ Copy the token that appears (starts with <code className="text-accent">ghp_</code>)</p>
                <p className="text-destructive font-medium">⚠️ Save it immediately - you won't see it again!</p>
              </div>
            </li>
            <li className="text-foreground">
              <strong>Create Database:</strong> Click "Create New" button below → Paste token → Click "Create Database"
            </li>
            <li className="text-foreground">
              <strong>Done!</strong> You'll see a green success message and can then import restaurants
            </li>
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
                <strong>Use this if you already have a Gist ID</strong> from a previous database setup. If this is your first time or you don't have a Gist ID, click <strong>"Create New"</strong> instead.
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
              <div className="bg-background/50 p-3 rounded border border-accent/30 space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  🔍 Where to Find Your Gist ID:
                </p>
                <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside ml-1">
                  <li>
                    Go to{' '}
                    <a 
                      href="https://gist.github.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-accent hover:underline font-medium"
                    >
                      gist.github.com
                    </a>{' '}
                    and log in to your GitHub account
                  </li>
                  <li className="leading-relaxed">
                    Find your Gist named <strong className="text-foreground">"imperial-restaurants-database.json"</strong> in your list
                    <div className="ml-4 mt-1 text-[11px]">
                      (If you don't see it, you need to create a new database instead)
                    </div>
                  </li>
                  <li className="leading-relaxed">
                    Click on the Gist to open it. Look at the URL in your browser:
                    <div className="ml-4 mt-1 font-mono text-[11px] bg-accent/10 p-1.5 rounded text-accent">
                      https://gist.github.com/yourname/<strong className="underline">8f3e4d2c1b9a7f6e5d4c3b2a1f0e9d8c</strong>
                    </div>
                  </li>
                  <li>
                    The Gist ID is the <strong className="text-accent">long string of letters and numbers</strong> at the end of the URL
                  </li>
                  <li>
                    Copy <strong className="text-foreground">only that ID</strong> (not the full URL) and paste it above ↑
                  </li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Format:</strong> 32 characters, letters and numbers only. Example: <code className="text-accent">abc123def456ghi789...</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github-token" className="font-semibold">GitHub Personal Access Token</Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_... (your GitHub token)"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The same token you used when creating the database. Don't have it?{' '}
                <a 
                  href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-accent hover:underline font-medium"
                >
                  Create a new token here
                </a>{' '}
                (check only "gist" scope)
              </p>
            </div>

            <Button onClick={handleConnect} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? 'Connecting...' : 'Connect Database'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-accent/10 border-accent/30">
              <Info className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm">
                <strong>✅ Recommended for new users:</strong> This creates a new private GitHub Gist to store your restaurant data securely. It's the easiest and fastest way to get started. Takes only 60 seconds!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="github-token-create" className="text-base font-semibold">GitHub Personal Access Token</Label>
              <Input
                id="github-token-create"
                type="password"
                placeholder="ghp_... (paste your token here)"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="font-mono"
              />
              <div className="bg-background/50 p-3 rounded border border-accent/30 space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  🔐 How to Get Your Token (Step-by-Step):
                </p>
                <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside ml-1">
                  <li>
                    <a href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">
                      Click here to open GitHub token creation page
                    </a> (opens in new tab)
                  </li>
                  <li className="leading-relaxed">
                    On the GitHub page you'll see:
                    <div className="ml-4 mt-1 space-y-1 text-[11px]">
                      <p>• <strong className="text-foreground">Note:</strong> "Imperial Restaurant Database" (already filled)</p>
                      <p>• <strong className="text-foreground">Expiration:</strong> Choose "No expiration" (recommended) or "90 days"</p>
                    </div>
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-accent">CRITICAL:</strong> Under "Select scopes" section, check <strong className="text-foreground">ONLY the "gist" checkbox</strong>
                    <div className="ml-4 mt-1 text-[11px] text-destructive font-medium">
                      ⚠️ Do NOT check "repo" or other options - only "gist"!
                    </div>
                  </li>
                  <li>
                    Scroll down → Click the green <strong className="text-foreground">"Generate token"</strong> button at the bottom
                  </li>
                  <li className="leading-relaxed">
                    GitHub will show your new token (starts with <code className="text-accent bg-accent/10 px-1 rounded">ghp_</code>)
                    <div className="ml-4 mt-1 text-[11px] text-destructive font-medium">
                      ⚠️ Copy it NOW - GitHub shows it only once!
                    </div>
                  </li>
                  <li>
                    Paste the token into the field above ↑ and click "Create Database" button below ↓
                  </li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Token should start with <code className="text-accent">ghp_</code> or <code className="text-accent">github_pat_</code> and be at least 40 characters long
              </p>
            </div>

            <Button onClick={handleCreate} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? 'Creating Database...' : 'Create Database'}
            </Button>
            
            <div className="bg-muted/30 p-3 rounded text-xs space-y-1.5">
              <p className="font-medium text-foreground">What happens when you click Create:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2 text-muted-foreground">
                <li>A new private Gist is created in your GitHub account (free, secure)</li>
                <li>You'll receive a Gist ID (save this for backup/recovery)</li>
                <li>Database is automatically connected</li>
                <li>You can immediately start importing restaurants from Google Sheets</li>
                <li>All your data will persist forever (survives page refreshes & deployments)</li>
              </ul>
            </div>
          </div>
        )}

        <Alert className="bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-3">
            <div>
              <p className="font-semibold text-foreground mb-2">🆘 Troubleshooting Common Issues:</p>
              <div className="space-y-2 ml-2">
                <div>
                  <p className="font-medium text-foreground">❌ "Invalid token" error:</p>
                  <p className="ml-4 text-muted-foreground">
                    → Make sure you checked ONLY the "gist" scope when creating the token<br/>
                    → Token must start with <code className="text-accent">ghp_</code> or <code className="text-accent">github_pat_</code><br/>
                    → Ensure you copied the entire token (no spaces or line breaks)
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">❌ "Gist not found" error:</p>
                  <p className="ml-4 text-muted-foreground">
                    → Double-check the Gist ID from your Gist URL<br/>
                    → Make sure the Gist exists in YOUR GitHub account<br/>
                    → Try clicking "Create New" if you can't find the Gist
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">❓ Can't find GitHub token settings:</p>
                  <p className="ml-4 text-muted-foreground">
                    → Use this direct link: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">github.com/settings/tokens</a><br/>
                    → Or: GitHub → Settings (your profile) → Developer settings (bottom left) → Personal access tokens → Tokens (classic)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-2">
              <p className="font-medium text-foreground">💡 Quick Setup Guide (First Time):</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                <li>
                  Click{' '}
                  <a 
                    href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-accent hover:underline font-medium"
                  >
                    this link
                  </a>{' '}
                  to create a token on GitHub
                </li>
                <li>Check ONLY the "gist" checkbox</li>
                <li>Click "Generate token" and copy it immediately</li>
                <li>Click "Create New" button above</li>
                <li>Paste your token and click "Create Database"</li>
                <li>Done! You can now import restaurants from Google Sheets</li>
              </ol>
              <p className="text-muted-foreground mt-2">⏱️ Total time: ~2 minutes • This is a one-time setup</p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
