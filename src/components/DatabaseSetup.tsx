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
      toast.error('Пожалуйста, заполните все поля / Please fill all fields')
      return
    }

    const trimmedGistId = gistId.trim()
    const trimmedToken = githubToken.trim()

    if (trimmedGistId.length < 20) {
      toast.error('Неверный формат Gist ID - должен быть минимум 20 символов / Invalid Gist ID format - must be at least 20 characters long')
      return
    }

    if (trimmedGistId.includes('/') || trimmedGistId.includes('gist.github.com')) {
      toast.error('Введите только Gist ID, а не полный URL. Пример / Enter only the Gist ID: abc123def456...')
      return
    }

    if (!trimmedToken.startsWith('ghp_') && !trimmedToken.startsWith('github_pat_')) {
      toast.error('Неверный формат токена GitHub - должен начинаться с "ghp_" или "github_pat_" / Invalid GitHub token format')
      return
    }

    if (trimmedToken.length < 40) {
      toast.error('Неверный токен GitHub - слишком короткий / Invalid GitHub token - too short')
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading('Проверка подключения к базе данных... / Checking database connection...')
    
    try {
      const testResponse = await fetch(`https://api.github.com/gists/${trimmedGistId}`, {
        headers: {
          'Authorization': `Bearer ${trimmedToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('Неверный GitHub токен. Проверьте правильность токена / Invalid GitHub token. Please check your token')
        } else if (testResponse.status === 404) {
          throw new Error('Gist не найден. Проверьте правильность Gist ID или создайте новую базу / Gist not found. Check your Gist ID or create a new database')
        } else {
          throw new Error(`Ошибка проверки: ${testResponse.status} / Verification error: ${testResponse.status}`)
        }
      }

      const gistData = await testResponse.json()
      
      if (!gistData.files || !gistData.files['imperial-restaurants-database.json']) {
        throw new Error('Найден Gist, но это не база данных ресторанов. Убедитесь что используете правильный Gist ID / Found Gist but it\'s not a restaurant database. Make sure you\'re using the correct Gist ID')
      }

      await onSetup(trimmedGistId, trimmedToken)
      toast.dismiss(loadingToast)
      toast.success('✅ База данных успешно подключена! / Database connected successfully!')
      setGistId('')
      setGithubToken('')
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Не удалось подключиться к базе данных / Failed to connect to database', {
        duration: 6000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!githubToken) {
      toast.error('Пожалуйста, введите GitHub токен / Please enter your GitHub token')
      return
    }

    const trimmedToken = githubToken.trim()

    if (!trimmedToken.startsWith('ghp_') && !trimmedToken.startsWith('github_pat_')) {
      toast.error('Неверный формат токена - должен начинаться с "ghp_" или "github_pat_" / Invalid token format - must start with "ghp_" or "github_pat_"')
      return
    }

    if (trimmedToken.length < 40) {
      toast.error('Неверный токен GitHub - слишком короткий (минимум 40 символов) / Invalid GitHub token - too short (minimum 40 characters)')
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading('Проверка токена и создание базы данных... / Verifying token and creating database...')
    
    try {
      const testResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${trimmedToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('❌ Неверный GitHub токен. Проверьте:\n1. Токен скопирован полностью\n2. Отмечен ТОЛЬКО чекбокс "gist"\n3. Токен не истёк / Invalid GitHub token. Check: 1. Token copied completely, 2. Only "gist" scope checked, 3. Token not expired')
        } else {
          throw new Error(`Ошибка авторизации GitHub: ${testResponse.status} / GitHub authorization error: ${testResponse.status}`)
        }
      }

      const userData = await testResponse.json()
      toast.dismiss(loadingToast)
      toast.success(`✓ Токен проверен (пользователь: ${userData.login}) / Token verified (user: ${userData.login})`)
      
      const creatingToast = toast.loading('Создание базы данных в вашем GitHub аккаунте... / Creating database in your GitHub account...')

      const result = await onCreateNew(trimmedToken)
      
      toast.dismiss(creatingToast)
      toast.success('✅ База данных успешно создана! / Database created successfully!', {
        duration: 5000
      })
      toast.info(`💾 Gist ID сохранён: ${result.gistId.substring(0, 12)}... / Gist ID saved: ${result.gistId.substring(0, 12)}...`, { 
        duration: 8000 
      })
      toast.info(`🔗 URL базы: ${result.url} / Database URL: ${result.url}`, { 
        duration: 10000 
      })
      
      setGithubToken('')
      setMode('connect')
    } catch (error: any) {
      toast.dismiss(loadingToast)
      const errorMessage = error.message || 'Не удалось создать базу данных / Failed to create database'
      toast.error(errorMessage, {
        duration: 8000
      })
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
              <CardTitle className="text-lg">✅ База Данных Подключена и Работает / Database Connected & Ready</CardTitle>
              <CardDescription>Данные ресторанов хранятся безопасно в GitHub Gist / Restaurant data is stored securely in GitHub Gist</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-accent/5 border-accent/20">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              <strong>✓ База данных активна и работает / Database is active and working</strong><br />
              ✓ Все изменения автоматически сохраняются в облако / All changes are automatically saved to the cloud<br />
              ✓ Данные сохраняются при обновлении страницы и перезапуске / Data persists across page refreshes and deployments<br />
              ✓ Можете импортировать рестораны из Google Sheets / You can now import restaurants from Google Sheets
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground">
            База данных полностью настроена! Перейдите во вкладку <strong>Restaurants</strong> для управления данными или импорта из Google Sheets.<br/>
            Your database is fully configured! Go to the <strong>Restaurants</strong> tab to manage your data or import from Google Sheets.
          </p>
          
          <div className="bg-muted/30 p-3 rounded border border-border text-xs space-y-2">
            <p className="font-medium text-foreground">💡 Полезная информация / Useful information:</p>
            <ul className="ml-4 space-y-1 text-muted-foreground">
              <li>• Все данные хранятся в вашем приватном GitHub Gist</li>
              <li>• Посмотреть базу: <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">gist.github.com</a> → найдите "imperial-restaurants-database.json"</li>
              <li>• При необходимости можете экспортировать данные вручную из Gist</li>
              <li>• Для переноса на другой компьютер используйте тот же Gist ID и токен</li>
            </ul>
          </div>
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
            <CardTitle className="text-lg">⚠️ База Данных Не Настроена / Database Not Configured</CardTitle>
            <CardDescription className="font-semibold">ОБЯЗАТЕЛЬНО: Настройте облачное хранилище перед импортом ресторанов / REQUIRED: Set up cloud storage before importing restaurants</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-destructive/10 border-destructive/30">
          <Info className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm font-medium">
            <strong>⚠️ КРИТИЧНО / CRITICAL:</strong> Без настройки базы данных все данные ресторанов будут потеряны при обновлении страницы, закрытии браузера или деплое. Вы ДОЛЖНЫ настроить базу данных перед импортом из Google Sheets или созданием ресторанов.<br/><br/>
            Without database configuration, all restaurant data will be lost when you refresh the page, close the browser, or deploy to production. You MUST set up the database before importing from Google Sheets or creating restaurants.
          </AlertDescription>
        </Alert>

        <div className="bg-accent/10 p-4 rounded-lg border border-accent/20 space-y-3">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <CheckCircle size={20} className="text-accent" weight="fill" />
            Пошаговая Инструкция - Создание Базы Данных (~3 минуты):
          </p>
          
          <div className="space-y-4 text-sm ml-2">
            <div className="space-y-2">
              <p className="font-bold text-foreground">ШАГ 1: Создание GitHub Token</p>
              <div className="ml-4 space-y-2 text-xs">
                <p className="font-medium text-foreground">1.1. Откройте страницу создания токена:</p>
                <div className="ml-4 bg-background/50 p-2 rounded border border-accent/30">
                  <a 
                    href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-accent hover:underline font-medium break-all"
                  >
                    👉 НАЖМИТЕ СЮДА - прямая ссылка на создание токена
                  </a>
                  <p className="text-muted-foreground mt-1">(откроется в новой вкладке, войдите в GitHub если не вошли)</p>
                </div>

                <p className="font-medium text-foreground mt-3">1.2. На открывшейся странице вы увидите форму:</p>
                <div className="ml-4 bg-background/50 p-3 rounded border border-border space-y-2">
                  <div>
                    <p className="text-foreground font-medium">• Поле "Note" (примечание):</p>
                    <p className="ml-4 text-muted-foreground">Уже заполнено текстом "Imperial Restaurant Database" - не меняйте</p>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">• Поле "Expiration" (срок действия):</p>
                    <p className="ml-4 text-muted-foreground">Выберите <strong className="text-accent">"No expiration"</strong> (без срока) из выпадающего списка</p>
                    <p className="ml-4 text-muted-foreground text-[11px]">(или выберите "90 days" если хотите ограничить срок)</p>
                  </div>
                </div>

                <p className="font-medium text-foreground mt-3">1.3. Настройка разрешений (Scopes) - САМОЕ ВАЖНОЕ:</p>
                <div className="ml-4 bg-destructive/10 p-3 rounded border border-destructive/30 space-y-2">
                  <p className="text-destructive font-bold">⚠️ КРИТИЧЕСКИ ВАЖНО:</p>
                  <p className="text-foreground">Прокрутите страницу вниз до раздела <strong>"Select scopes"</strong></p>
                  <p className="text-foreground">Вы увидите список чекбоксов (галочек). Найдите чекбокс <strong className="text-accent">"gist"</strong></p>
                  <p className="text-foreground font-bold">✅ Поставьте галочку ТОЛЬКО на "gist" и БОЛЬШЕ НИГДЕ</p>
                  <p className="text-destructive text-[11px] mt-1">❌ НЕ ставьте галочки на "repo", "workflow", "admin" или других опциях!</p>
                  <p className="text-muted-foreground text-[11px]">Только один чекбокс должен быть отмечен - "gist"</p>
                </div>

                <p className="font-medium text-foreground mt-3">1.4. Генерация токена:</p>
                <div className="ml-4 bg-background/50 p-2 rounded border border-border space-y-1">
                  <p className="text-muted-foreground">• Прокрутите в самый низ страницы</p>
                  <p className="text-muted-foreground">• Найдите зелёную кнопку <strong className="text-foreground">"Generate token"</strong></p>
                  <p className="text-muted-foreground">• Нажмите на неё</p>
                </div>

                <p className="font-medium text-foreground mt-3">1.5. Копирование токена:</p>
                <div className="ml-4 bg-accent/10 p-3 rounded border border-accent/30 space-y-2">
                  <p className="text-foreground">GitHub покажет ваш новый токен - длинную строку, начинающуюся с <code className="text-accent bg-background px-1 rounded">ghp_</code></p>
                  <p className="text-foreground">Пример: <code className="text-accent text-[11px] bg-background px-1 rounded">ghp_AbCdEf1234567890...</code></p>
                  <p className="text-destructive font-bold mt-2">⚠️ СКОПИРУЙТЕ ЕГО ПРЯМО СЕЙЧАС!</p>
                  <p className="text-muted-foreground text-[11px]">Нажмите на иконку копирования рядом с токеном или выделите и Ctrl+C/Cmd+C</p>
                  <p className="text-destructive text-[11px]">GitHub покажет его только один раз! Если закроете страницу - токен будет потерян навсегда</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <p className="font-bold text-foreground">ШАГ 2: Создание Базы Данных (Database)</p>
              <div className="ml-4 space-y-2 text-xs">
                <p className="font-medium text-foreground">2.1. На этой странице:</p>
                <div className="ml-4 bg-background/50 p-2 rounded border border-border space-y-1">
                  <p className="text-muted-foreground">• Найдите кнопку <strong className="text-foreground">"Create New"</strong> (чуть ниже) и нажмите на неё</p>
                  <p className="text-muted-foreground">• Она переключит форму в режим создания новой базы</p>
                </div>

                <p className="font-medium text-foreground mt-2">2.2. Вставка токена:</p>
                <div className="ml-4 bg-background/50 p-2 rounded border border-border space-y-1">
                  <p className="text-muted-foreground">• Найдите поле "GitHub Personal Access Token"</p>
                  <p className="text-muted-foreground">• Вставьте скопированный токен (Ctrl+V / Cmd+V)</p>
                  <p className="text-muted-foreground">• Убедитесь что токен начинается с <code className="text-accent">ghp_</code></p>
                </div>

                <p className="font-medium text-foreground mt-2">2.3. Создание:</p>
                <div className="ml-4 bg-accent/10 p-3 rounded border border-accent/30 space-y-1">
                  <p className="text-foreground">• Нажмите большую кнопку <strong className="text-foreground">"Create Database"</strong></p>
                  <p className="text-muted-foreground">• Подождите 2-5 секунд (появится надпись "Creating Database...")</p>
                  <p className="text-accent font-medium">• Появится зелёное уведомление "Database created successfully!"</p>
                  <p className="text-muted-foreground text-[11px]">Также появится Gist ID - сохраните его на всякий случай</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <p className="font-bold text-foreground">ШАГ 3: Готово! ✅</p>
              <div className="ml-4 bg-accent/10 p-3 rounded border border-accent/30 space-y-1 text-xs">
                <p className="text-foreground font-medium">После успешного создания:</p>
                <p className="text-muted-foreground">✓ База данных создана и подключена автоматически</p>
                <p className="text-muted-foreground">✓ Все данные будут сохраняться в облаке (GitHub Gist)</p>
                <p className="text-muted-foreground">✓ Можете переходить во вкладку "Restaurants" и импортировать рестораны из Google Sheets</p>
                <p className="text-muted-foreground">✓ Данные не удалятся при обновлении страницы или перезапуске</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded border border-border mt-4">
            <p className="text-xs font-bold text-foreground mb-2">❓ Где найти созданный Gist после создания:</p>
            <div className="text-xs text-muted-foreground space-y-1 ml-2">
              <p>1. Откройте <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">gist.github.com</a></p>
              <p>2. Войдите в свой GitHub аккаунт</p>
              <p>3. В списке ваших Gist-ов найдите файл с именем <strong className="text-foreground">"imperial-restaurants-database.json"</strong></p>
              <p>4. В URL этого Gist-а будет ваш Gist ID (длинная строка букв и цифр)</p>
            </div>
          </div>
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
                <strong>Используйте эту опцию если:</strong><br/>
                • У вас уже есть Gist ID от предыдущей настройки<br/>
                • Вы ранее создавали базу данных<br/>
                • Вы знаете свой Gist ID<br/><br/>
                <strong>Если это первая настройка</strong> или вы не знаете что такое Gist ID, нажмите кнопку <strong>"Create New"</strong> выше.
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
                  🔍 Подробная инструкция: Где найти ваш Gist ID
                </p>
                <ol className="text-xs text-muted-foreground space-y-3 list-decimal list-inside ml-1">
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Откройте GitHub Gist:</strong>
                    <div className="ml-4 mt-1 space-y-1">
                      <p>Перейдите на{' '}
                        <a 
                          href="https://gist.github.com/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent hover:underline font-medium"
                        >
                          gist.github.com
                        </a>
                      </p>
                      <p className="text-[11px]">Войдите в свой GitHub аккаунт (если не вошли автоматически)</p>
                    </div>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Найдите ваш Gist в списке:</strong>
                    <div className="ml-4 mt-1 space-y-1 bg-muted/30 p-2 rounded">
                      <p>После входа вы увидите список ваших Gist-ов (если они есть)</p>
                      <p className="font-medium text-foreground">Найдите Gist с именем файла:</p>
                      <p className="text-accent font-mono text-[11px]">imperial-restaurants-database.json</p>
                      <p className="text-destructive text-[11px] mt-1">⚠️ Если такого Gist нет - значит база не создана. Используйте "Create New"</p>
                    </div>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Откройте ваш Gist:</strong>
                    <div className="ml-4 mt-1 space-y-1">
                      <p>Нажмите на название Gist-а <code className="text-accent bg-accent/10 px-1 rounded">imperial-restaurants-database.json</code></p>
                      <p className="text-[11px]">Откроется страница с содержимым вашей базы данных</p>
                    </div>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Скопируйте Gist ID из URL:</strong>
                    <div className="ml-4 mt-2 space-y-2 bg-muted/30 p-2 rounded">
                      <p>Посмотрите на адресную строку браузера. URL будет выглядеть так:</p>
                      <div className="font-mono text-[11px] bg-background p-2 rounded border border-border break-all">
                        <span className="text-muted-foreground">https://gist.github.com/</span>
                        <span className="text-muted-foreground">ваш_логин</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-accent font-bold underline">8f3e4d2c1b9a7f6e5d4c3b2a1f0e9d8c</span>
                      </div>
                      <p className="text-foreground font-medium mt-2">Gist ID - это <span className="text-accent">длинная строка букв и цифр</span> в конце URL</p>
                      <p className="text-[11px]">Обычно это 32 символа (буквы a-f и цифры 0-9)</p>
                    </div>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Скопируйте только ID:</strong>
                    <div className="ml-4 mt-1 space-y-2 bg-accent/10 p-2 rounded border border-accent/30">
                      <p className="text-foreground font-medium">✅ Правильно:</p>
                      <code className="text-accent text-[11px] block mt-1">8f3e4d2c1b9a7f6e5d4c3b2a1f0e9d8c</code>
                      
                      <p className="text-destructive font-medium mt-2">❌ Неправильно (не копируйте весь URL):</p>
                      <code className="text-destructive text-[11px] block mt-1 break-all">https://gist.github.com/user/8f3e4d2c1b9a...</code>
                      
                      <p className="text-muted-foreground text-[11px] mt-2">
                        <strong>Совет:</strong> Выделите только ID часть, скопируйте и вставьте в поле выше ↑
                      </p>
                    </div>
                  </li>
                </ol>
                
                <div className="bg-destructive/10 p-2 rounded border border-destructive/30 mt-3">
                  <p className="text-xs font-bold text-destructive">⚠️ Частые ошибки:</p>
                  <ul className="text-[11px] text-muted-foreground space-y-1 mt-1 ml-4">
                    <li>• Копирование полного URL вместо только ID</li>
                    <li>• Лишние пробелы в начале или конце</li>
                    <li>• Использование ID чужого Gist (должен быть ваш)</li>
                    <li>• ID другого Gist (не базы данных ресторанов)</li>
                  </ul>
                </div>
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
                <strong>✅ Рекомендуется для новых пользователей:</strong> Создаёт новый приватный GitHub Gist для безопасного хранения данных ресторанов. Это самый простой и быстрый способ начать. Займёт всего 2-3 минуты!
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
                  🔐 Пошаговая инструкция получения токена:
                </p>
                <ol className="text-xs text-muted-foreground space-y-3 list-decimal list-inside ml-1">
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Откройте страницу создания токена:</strong>
                    <div className="ml-4 mt-1 bg-accent/10 p-2 rounded border border-accent/30">
                      <a href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium break-all">
                        👉 Нажмите сюда чтобы открыть страницу (откроется в новой вкладке)
                      </a>
                    </div>
                    <p className="ml-4 mt-1 text-[11px]">Если не вошли в GitHub - сначала войдите в свой аккаунт</p>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Заполните форму на GitHub:</strong>
                    <div className="ml-4 mt-2 space-y-2 bg-muted/30 p-2 rounded">
                      <div>
                        <p className="text-foreground font-medium">Страница будет называться:</p>
                        <p className="text-accent text-[11px] font-mono">"New personal access token (classic)"</p>
                      </div>
                      
                      <div className="border-t border-border pt-2">
                        <p className="font-medium text-foreground">Что вы увидите в форме:</p>
                        <div className="space-y-2 ml-2 mt-1">
                          <div>
                            <p className="text-foreground">• <strong>Note</strong> (Примечание):</p>
                            <p className="ml-4 text-[11px]">Уже заполнено: "Imperial Restaurant Database"</p>
                            <p className="ml-4 text-[11px] text-muted-foreground">Ничего менять не нужно ✓</p>
                          </div>
                          
                          <div>
                            <p className="text-foreground">• <strong>Expiration</strong> (Срок действия):</p>
                            <p className="ml-4 text-[11px]">Выпадающий список с вариантами</p>
                            <p className="ml-4 text-accent font-medium text-[11px]">Выберите: <strong>"No expiration"</strong> (Без срока)</p>
                            <p className="ml-4 text-muted-foreground text-[11px]">или "90 days" если хотите ограничить</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-destructive">КРИТИЧЕСКИ ВАЖНО - Select scopes (Выбор разрешений):</strong>
                    <div className="ml-4 mt-2 space-y-2 bg-destructive/10 p-3 rounded border border-destructive/30">
                      <p className="text-foreground font-bold">Прокрутите страницу вниз до раздела "Select scopes"</p>
                      
                      <div className="bg-background p-2 rounded border border-border space-y-2">
                        <p className="text-foreground font-medium">Вы увидите длинный список чекбоксов (галочек):</p>
                        <ul className="ml-4 text-[11px] space-y-1">
                          <li>□ repo</li>
                          <li>□ workflow</li>
                          <li>□ write:packages</li>
                          <li className="text-accent font-bold">☑ gist ← ПОСТАВЬТЕ ГАЛОЧКУ ЗДЕСЬ</li>
                          <li>□ notifications</li>
                          <li>□ user</li>
                          <li>□ ...</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-accent font-bold">✅ Найдите и отметьте ТОЛЬКО чекбокс "gist"</p>
                        <p className="text-destructive font-bold">❌ НЕ отмечайте другие чекбоксы!</p>
                        <p className="text-muted-foreground text-[11px]">Только одна галочка должна стоять - напротив "gist"</p>
                      </div>
                      
                      <div className="bg-destructive/20 p-2 rounded mt-2">
                        <p className="text-destructive font-bold text-[11px]">⚠️ Если отметите другие опции (repo, workflow и т.д.) - токен может не работать или будет небезопасным!</p>
                      </div>
                    </div>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Создайте токен:</strong>
                    <div className="ml-4 mt-1 space-y-1 bg-background/50 p-2 rounded">
                      <p>• Прокрутите страницу в самый низ</p>
                      <p>• Найдите большую зелёную кнопку <strong className="text-accent">"Generate token"</strong></p>
                      <p>• Нажмите на неё</p>
                    </div>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-accent">Скопируйте токен НЕМЕДЛЕННО:</strong>
                    <div className="ml-4 mt-2 space-y-2 bg-accent/10 p-3 rounded border border-accent/30">
                      <p className="text-foreground font-medium">GitHub покажет вам новый токен:</p>
                      <div className="bg-background p-2 rounded border border-border font-mono text-[11px] break-all">
                        <span className="text-accent">ghp_</span>
                        <span className="text-muted-foreground">AbCdEfGh1234567890IjKlMnOp...</span>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        <p className="text-foreground font-medium">Как скопировать:</p>
                        <p className="ml-4 text-[11px]">1. Нажмите на иконку копирования (📋) рядом с токеном</p>
                        <p className="ml-4 text-[11px]">2. Или выделите токен мышкой и нажмите Ctrl+C (Windows) / Cmd+C (Mac)</p>
                      </div>
                      
                      <div className="bg-destructive/20 p-2 rounded border border-destructive mt-2">
                        <p className="text-destructive font-bold text-[11px]">⚠️ КРИТИЧЕСКИ ВАЖНО:</p>
                        <p className="text-destructive text-[11px]">GitHub покажет токен только ОДИН РАЗ!</p>
                        <p className="text-destructive text-[11px]">Если закроете страницу - токен будет потерян навсегда</p>
                        <p className="text-destructive text-[11px]">Придётся создавать новый токен</p>
                      </div>
                      
                      <div className="bg-accent/20 p-2 rounded border border-accent mt-2">
                        <p className="text-accent font-medium text-[11px]">💡 Рекомендация:</p>
                        <p className="text-muted-foreground text-[11px]">Сразу после копирования вставьте токен в поле ниже ↓ и нажмите "Create Database"</p>
                      </div>
                    </div>
                  </li>
                  
                  <li className="leading-relaxed">
                    <strong className="text-foreground">Вставьте токен и создайте базу:</strong>
                    <div className="ml-4 mt-1 space-y-1 bg-muted/30 p-2 rounded">
                      <p>• Вернитесь на эту страницу</p>
                      <p>• Вставьте токен в поле "GitHub Personal Access Token" (ниже ↓)</p>
                      <p>• Нажмите кнопку <strong className="text-accent">"Create Database"</strong></p>
                      <p>• Подождите 3-5 секунд</p>
                      <p>• Увидите зелёное уведомление об успехе ✅</p>
                    </div>
                  </li>
                </ol>
                
                <div className="bg-muted/30 p-2 rounded border border-border mt-3">
                  <p className="text-xs font-bold text-foreground mb-1">❓ Частые вопросы:</p>
                  <div className="space-y-2 text-[11px] text-muted-foreground ml-2">
                    <div>
                      <p className="font-medium text-foreground">Q: Токен начинается не с "ghp_", а с другого?</p>
                      <p className="ml-4">A: Может начинаться с "github_pat_" - это тоже правильно</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Q: Потерял токен, что делать?</p>
                      <p className="ml-4">A: Создайте новый токен по той же ссылке выше</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Q: Можно ли использовать один токен много раз?</p>
                      <p className="ml-4">A: Да, сохраните токен в надёжном месте для будущего использования</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Token should start with <code className="text-accent">ghp_</code> or <code className="text-accent">github_pat_</code> and be at least 40 characters long
              </p>
            </div>

            <Button onClick={handleCreate} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? 'Creating Database...' : 'Create Database'}
            </Button>
            
            <div className="bg-muted/30 p-3 rounded text-xs space-y-1.5">
              <p className="font-medium text-foreground">💡 Что произойдёт после нажатия "Create Database":</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2 text-muted-foreground">
                <li>Проверка вашего токена (2-3 секунды)</li>
                <li>Создание приватного Gist в вашем GitHub аккаунте (бесплатно, безопасно)</li>
                <li>Автоматическое сохранение Gist ID (для восстановления/резервного копирования)</li>
                <li>Автоматическое подключение базы данных</li>
                <li>Вы сразу сможете импортировать рестораны из Google Sheets</li>
                <li>Все ваши данные будут храниться вечно (переживут обновление страницы и перезапуск)</li>
              </ul>
              <p className="text-accent font-medium mt-2">⏱️ Общее время: ~3-5 секунд</p>
            </div>
          </div>
        )}

        <Alert className="bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-3">
            <div>
              <p className="font-semibold text-foreground mb-2">🆘 Решение частых проблем:</p>
              <div className="space-y-3 ml-2">
                <div>
                  <p className="font-medium text-destructive">❌ Ошибка "Invalid token" (Неверный токен):</p>
                  <p className="ml-4 text-muted-foreground text-[11px] space-y-0.5">
                    <span className="block">→ Убедитесь что отметили ТОЛЬКО чекбокс "gist" при создании токена</span>
                    <span className="block">→ Токен должен начинаться с <code className="text-accent">ghp_</code> или <code className="text-accent">github_pat_</code></span>
                    <span className="block">→ Проверьте что скопировали весь токен целиком (без пробелов и переносов строк)</span>
                    <span className="block">→ Токен не должен быть просрочен (проверьте Expiration)</span>
                    <span className="block text-accent">→ Попробуйте создать новый токен</span>
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-destructive">❌ Ошибка "Gist not found" (Gist не найден):</p>
                  <p className="ml-4 text-muted-foreground text-[11px] space-y-0.5">
                    <span className="block">→ Проверьте правильность Gist ID (32 символа, буквы и цифры)</span>
                    <span className="block">→ Убедитесь что Gist создан в ВАШЕМ аккаунте GitHub</span>
                    <span className="block">→ Проверьте что Gist не был удалён</span>
                    <span className="block text-accent">→ Если не можете найти Gist - используйте "Create New"</span>
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-destructive">❌ Ошибка "403 Forbidden" или "Permission denied":</p>
                  <p className="ml-4 text-muted-foreground text-[11px] space-y-0.5">
                    <span className="block">→ Токен не имеет разрешения "gist"</span>
                    <span className="block">→ Создайте новый токен и обязательно отметьте "gist" scope</span>
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-destructive">❌ Ошибка "Database not found" после создания:</p>
                  <p className="ml-4 text-muted-foreground text-[11px] space-y-0.5">
                    <span className="block">→ Это означает что база не была создана успешно</span>
                    <span className="block">→ Проверьте что токен имеет разрешение "gist"</span>
                    <span className="block text-accent">→ Попробуйте создать базу заново</span>
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground">❓ Не могу найти настройки токенов на GitHub:</p>
                  <p className="ml-4 text-muted-foreground text-[11px] space-y-0.5">
                    <span className="block">→ Используйте прямую ссылку выше (кнопка "Нажмите сюда")</span>
                    <span className="block">→ Или: GitHub → Settings (ваш профиль) → Developer settings (внизу слева) → Personal access tokens → Tokens (classic)</span>
                    <span className="block">→ Прямая ссылка на все токены: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">github.com/settings/tokens</a></span>
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground">❓ Где посмотреть созданную базу данных:</p>
                  <p className="ml-4 text-muted-foreground text-[11px] space-y-0.5">
                    <span className="block">→ Откройте <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">gist.github.com</a></span>
                    <span className="block">→ Найдите Gist с именем "imperial-restaurants-database.json"</span>
                    <span className="block">→ Там будут все данные ваших ресторанов в формате JSON</span>
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground">❓ Можно ли использовать существующий токен:</p>
                  <p className="ml-4 text-muted-foreground text-[11px] space-y-0.5">
                    <span className="block">→ Да, если у вас уже есть токен с разрешением "gist"</span>
                    <span className="block">→ Просто вставьте его и создайте/подключите базу</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-2">
              <p className="font-medium text-foreground">💡 Быстрая настройка (для новичков):</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                <li>
                  Нажмите на{' '}
                  <a 
                    href="https://github.com/settings/tokens/new?scopes=gist&description=Imperial%20Restaurant%20Database" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-accent hover:underline font-medium"
                  >
                    эту ссылку
                  </a>{' '}
                  для создания токена на GitHub
                </li>
                <li>Отметьте ТОЛЬКО чекбокс "gist" (ничего больше)</li>
                <li>Нажмите "Generate token" внизу и скопируйте токен немедленно</li>
                <li>Вернитесь сюда и нажмите кнопку "Create New" выше ↑</li>
                <li>Вставьте токен и нажмите "Create Database"</li>
                <li>Готово! Теперь можете импортировать рестораны из Google Sheets</li>
              </ol>
              <p className="text-muted-foreground mt-2">⏱️ Время: ~2-3 минуты • Настройка один раз навсегда</p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
