import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  ArrowSquareOut, 
  CloudArrowDown,
  SpinnerGap,
  Copy,
  FolderOpen
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { FirebaseDriveSync } from '@/lib/firebase-drive-sync'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'

export default function GoogleDriveSync() {
  const [firebaseApiKey] = useKV<string>('firebase-api-key', '')
  const [firebaseProjectId] = useKV<string>('firebase-project-id', '')
  const [firebaseStorageBucket] = useKV<string>('firebase-storage-bucket', '')
  const [googleApiKey] = useKV<string>('google-sheets-api-key', '')
  
  const [driveFolderUrl, setDriveFolderUrl] = useState('')
  const [firebasePath, setFirebasePath] = useState('restaurants')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, fileName: '' })
  const [syncResults, setSyncResults] = useState<{
    success: string[]
    failed: Array<{ name: string; error: string }>
  } | null>(null)

  const isConfigured = !!(firebaseApiKey && firebaseProjectId && firebaseStorageBucket && googleApiKey)

  const handleSync = async () => {
    if (!driveFolderUrl.trim()) {
      toast.error('Пожалуйста, введите ссылку на папку Google Drive')
      return
    }

    if (!isConfigured) {
      toast.error('Сначала настройте Firebase и Google API в соответствующих разделах')
      return
    }

    setIsSyncing(true)
    setSyncProgress({ current: 0, total: 0, fileName: '' })
    setSyncResults(null)

    try {
      const sync = new FirebaseDriveSync(
        {
          apiKey: firebaseApiKey,
          projectId: firebaseProjectId,
          storageBucket: firebaseStorageBucket
        },
        googleApiKey
      )

      const folderId = sync.extractDriveFolderId(driveFolderUrl)
      
      if (!folderId) {
        throw new Error('Не удалось извлечь ID папки из URL. Проверьте правильность ссылки.')
      }

      const results = await sync.syncDriveToFirebase(
        folderId,
        firebasePath,
        (current, total, fileName) => {
          setSyncProgress({ current, total, fileName })
        }
      )

      setSyncResults(results)

      if (results.success.length > 0) {
        toast.success(`Успешно загружено ${results.success.length} изображений`)
      }

      if (results.failed.length > 0) {
        toast.error(`Не удалось загрузить ${results.failed.length} изображений`)
      }

    } catch (error) {
      console.error('Sync error:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка при синхронизации')
    } finally {
      setIsSyncing(false)
    }
  }

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL скопирован в буфер обмена')
  }

  const progressPercentage = syncProgress.total > 0 
    ? Math.round((syncProgress.current / syncProgress.total) * 100) 
    : 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl flex items-center gap-2">
            <CloudArrowDown size={28} className="text-accent" />
            Автозагрузка из Google Drive в Firebase
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Автоматически загрузите все изображения из папки Google Drive в Firebase Storage
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isConfigured && (
            <Alert className="bg-yellow-50 border-yellow-300">
              <Info size={20} className="text-yellow-600" />
              <AlertDescription className="ml-2 text-yellow-800">
                <strong>Внимание!</strong> Сначала настройте Firebase (вкладка "Firebase Setup") и сохраните Google Sheets API Key (вкладка "Restaurants" → "Import from Google Sheets")
              </AlertDescription>
            </Alert>
          )}

          {isConfigured && (
            <Alert className="bg-accent/5 border-accent/30">
              <CheckCircle size={20} className="text-accent" />
              <AlertDescription className="ml-2">
                Firebase и Google API настроены. Готово к синхронизации!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drive-folder-url">Ссылка на папку Google Drive</Label>
              <Input
                id="drive-folder-url"
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                disabled={isSyncing}
              />
              <p className="text-xs text-muted-foreground">
                Папка должна быть доступна по ссылке (Anyone with the link can view)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firebase-path">Путь в Firebase Storage</Label>
              <Input
                id="firebase-path"
                value={firebasePath}
                onChange={(e) => setFirebasePath(e.target.value)}
                placeholder="restaurants"
                disabled={isSyncing}
              />
              <p className="text-xs text-muted-foreground">
                Папка в Firebase Storage, куда будут загружены изображения (например: restaurants, menu-items)
              </p>
            </div>

            <Button
              onClick={handleSync}
              disabled={!isConfigured || isSyncing || !driveFolderUrl.trim()}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSyncing ? (
                <>
                  <SpinnerGap size={20} className="mr-2 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <CloudArrowDown size={20} className="mr-2" />
                  Начать синхронизацию
                </>
              )}
            </Button>
          </div>

          {isSyncing && syncProgress.total > 0 && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Загрузка: {syncProgress.current} / {syncProgress.total}
                </span>
                <span className="text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {syncProgress.fileName && (
                <p className="text-xs text-muted-foreground truncate">
                  Текущий файл: {syncProgress.fileName}
                </p>
              )}
            </div>
          )}

          {syncResults && (
            <div className="space-y-4">
              <Separator />
              
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  Результаты синхронизации
                </h3>

                {syncResults.success.length > 0 && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-green-900 flex items-center gap-2">
                        <CheckCircle size={18} />
                        Успешно загружено: {syncResults.success.length}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {syncResults.success.map((url, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-2 p-2 bg-white rounded border border-green-200 text-xs"
                            >
                              <FolderOpen size={16} className="text-green-600 flex-shrink-0" />
                              <span className="flex-1 font-mono truncate">{url}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyUrlToClipboard(url)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(url, '_blank')}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowSquareOut size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {syncResults.failed.length > 0 && (
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-900 flex items-center gap-2">
                        <XCircle size={18} />
                        Ошибки: {syncResults.failed.length}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {syncResults.failed.map((item, index) => (
                            <div 
                              key={index}
                              className="p-3 bg-white rounded border border-red-200"
                            >
                              <p className="text-sm font-semibold text-red-900">{item.name}</p>
                              <p className="text-xs text-red-700 mt-1">{item.error}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            📖 Инструкция по использованию
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">1</span>
              Подготовка папки в Google Drive
            </h3>
            <div className="ml-8 space-y-2">
              <p>1. Создайте папку в Google Drive с изображениями</p>
              <p>2. Нажмите правой кнопкой на папку → <strong>"Share"</strong> → <strong>"Get link"</strong></p>
              <p>3. Установите доступ: <strong>"Anyone with the link"</strong> → <strong>"Viewer"</strong></p>
              <p>4. Скопируйте ссылку (выглядит как: <code className="bg-muted px-2 py-0.5 rounded text-xs">https://drive.google.com/drive/folders/1AbC...</code>)</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">2</span>
              Включение Google Drive API
            </h3>
            <div className="ml-8 space-y-2">
              <p>1. Перейдите в <strong>Google Cloud Console</strong></p>
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={() => window.open('https://console.cloud.google.com/apis/library/drive.googleapis.com', '_blank')}
              >
                <ArrowSquareOut size={14} className="mr-2" />
                Открыть Google Drive API
              </Button>
              <p className="pt-2">2. Выберите ваш проект (тот же, что использовали для Google Sheets API)</p>
              <p>3. Нажмите кнопку <strong>"Enable"</strong></p>
              <Alert className="bg-muted/30 border-border">
                <Info size={18} />
                <AlertDescription className="ml-2 text-xs">
                  <strong>Важно:</strong> Используйте тот же API Key, что и для Google Sheets. Не нужно создавать новый!
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">3</span>
              Настройка API Key
            </h3>
            <div className="ml-8 space-y-2">
              <p>1. В Google Cloud Console перейдите в <strong>"Credentials"</strong></p>
              <p>2. Найдите ваш API Key</p>
              <p>3. Нажмите на иконку редактирования (карандаш)</p>
              <p>4. В разделе <strong>"API restrictions"</strong> добавьте:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Google Sheets API (уже должен быть)</li>
                <li><strong>Google Drive API</strong> (добавьте этот)</li>
              </ul>
              <p className="pt-2">5. Нажмите <strong>"Save"</strong></p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">4</span>
              Запуск синхронизации
            </h3>
            <div className="ml-8 space-y-2">
              <p>1. Вставьте ссылку на папку Google Drive в поле выше</p>
              <p>2. Выберите путь в Firebase Storage (например: <code className="bg-muted px-2 py-0.5 rounded text-xs">restaurants/galla-catering</code>)</p>
              <p>3. Нажмите кнопку <strong>"Начать синхронизацию"</strong></p>
              <p>4. Дождитесь завершения загрузки</p>
              <p>5. Скопируйте полученные URL и используйте их в админ-панели</p>
            </div>
          </div>

          <Separator />

          <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 rounded-lg border border-accent/20">
            <h3 className="font-semibold flex items-center gap-2 text-accent-foreground mb-2">
              <Info size={20} className="text-accent" />
              Полезные советы
            </h3>
            <ul className="space-y-1 text-xs">
              <li>✓ Именуйте файлы понятными названиями (например: <code className="bg-muted/50 px-1 rounded">salmon-dish.jpg</code>)</li>
              <li>✓ Используйте оптимизированные изображения (до 2 МБ каждое)</li>
              <li>✓ Создавайте отдельные папки для разных ресторанов</li>
              <li>✓ Проверяйте, что все изображения в формате JPG, PNG или WebP</li>
              <li>✓ После синхронизации URL сохраняются и доступны навсегда</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
