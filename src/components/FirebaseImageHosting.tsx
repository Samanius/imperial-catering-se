import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle, XCircle, Info, Copy, ArrowSquareOut } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLanguage } from '@/hooks/use-language'
import { t } from '@/lib/i18n'

export default function FirebaseImageHosting() {
  const { language } = useLanguage()
  const [firebaseApiKey, setFirebaseApiKey] = useKV<string>('firebase-api-key', '')
  const [firebaseProjectId, setFirebaseProjectId] = useKV<string>('firebase-project-id', '')
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useKV<string>('firebase-storage-bucket', '')
  
  const [apiKeyInput, setApiKeyInput] = useState(firebaseApiKey || '')
  const [projectIdInput, setProjectIdInput] = useState(firebaseProjectId || '')
  const [storageBucketInput, setStorageBucketInput] = useState(firebaseStorageBucket || '')
  
  const [isConfigured, setIsConfigured] = useState(
    !!(firebaseApiKey && firebaseProjectId && firebaseStorageBucket)
  )

  const handleSaveConfig = () => {
    if (!apiKeyInput.trim() || !projectIdInput.trim() || !storageBucketInput.trim()) {
      toast.error('Please fill in all Firebase configuration fields')
      return
    }

    setFirebaseApiKey(apiKeyInput.trim())
    setFirebaseProjectId(projectIdInput.trim())
    setFirebaseStorageBucket(storageBucketInput.trim())
    setIsConfigured(true)
    toast.success('Firebase configuration saved successfully!')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl flex items-center gap-2">
            <img 
              src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png" 
              alt="Firebase" 
              className="w-7 h-7"
            />
            Firebase Image Hosting
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure Firebase Storage for hosting restaurant and menu item images
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isConfigured && (
            <Alert className="bg-accent/5 border-accent/30">
              <CheckCircle size={20} className="text-accent" />
              <AlertDescription className="ml-2">
                Firebase is configured and ready to use for image hosting
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firebase-api-key">Firebase API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="firebase-api-key"
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIza..."
                  className="flex-1"
                />
                {firebaseApiKey && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(firebaseApiKey, 'API Key')}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firebase-project-id">Project ID</Label>
              <div className="flex gap-2">
                <Input
                  id="firebase-project-id"
                  value={projectIdInput}
                  onChange={(e) => setProjectIdInput(e.target.value)}
                  placeholder="my-project-12345"
                  className="flex-1"
                />
                {firebaseProjectId && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(firebaseProjectId, 'Project ID')}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firebase-storage-bucket">Storage Bucket</Label>
              <div className="flex gap-2">
                <Input
                  id="firebase-storage-bucket"
                  value={storageBucketInput}
                  onChange={(e) => setStorageBucketInput(e.target.value)}
                  placeholder="my-project-12345.appspot.com"
                  className="flex-1"
                />
                {firebaseStorageBucket && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(firebaseStorageBucket, 'Storage Bucket')}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
            </div>

            <Button
              onClick={handleSaveConfig}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <CheckCircle size={20} className="mr-2" />
              Save Firebase Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            📖 Полная инструкция по настройке Firebase Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">1</span>
                Создание аккаунта Firebase
              </h3>
              <div className="ml-8 space-y-2 text-sm">
                <p>1. Перейдите на сайт Firebase:</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                >
                  <ArrowSquareOut size={16} className="mr-2" />
                  console.firebase.google.com
                </Button>
                
                <p className="pt-2">2. Нажмите кнопку <strong>"Get started"</strong> или <strong>"Go to console"</strong></p>
                
                <p>3. Войдите с помощью вашего Google аккаунта</p>
                
                <Alert className="bg-muted/30 border-border">
                  <Info size={18} />
                  <AlertDescription className="ml-2 text-xs">
                    <strong>Примечание:</strong> Если у вас нет Google аккаунта, создайте его на gmail.com
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">2</span>
                Создание нового проекта
              </h3>
              <div className="ml-8 space-y-2 text-sm">
                <p>1. В консоли Firebase нажмите <strong>"Add project"</strong> или <strong>"Добавить проект"</strong></p>
                
                <p>2. Введите название проекта (например: <code className="bg-muted px-2 py-0.5 rounded">imperial-delicious-menu</code>)</p>
                
                <p>3. Нажмите <strong>"Continue"</strong></p>
                
                <p>4. Отключите Google Analytics (не обязательно для нашего случая)</p>
                
                <p>5. Нажмите <strong>"Create project"</strong></p>
                
                <p>6. Дождитесь создания проекта (обычно 10-30 секунд)</p>
                
                <p>7. Нажмите <strong>"Continue"</strong> после завершения</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">3</span>
                Настройка Firebase Storage
              </h3>
              <div className="ml-8 space-y-2 text-sm">
                <p>1. В левом меню выберите <strong>"Build"</strong> → <strong>"Storage"</strong></p>
                
                <p>2. Нажмите кнопку <strong>"Get started"</strong></p>
                
                <p>3. В диалоге правил безопасности нажмите <strong>"Next"</strong> (мы настроим их позже)</p>
                
                <p>4. Выберите локацию для хранения данных (рекомендуется ближайшая к вашему региону):</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li><code className="bg-muted px-2 py-0.5 rounded">europe-west1</code> - Бельгия (рекомендуется для Европы)</li>
                  <li><code className="bg-muted px-2 py-0.5 rounded">us-central1</code> - США</li>
                  <li><code className="bg-muted px-2 py-0.5 rounded">asia-southeast1</code> - Сингапур</li>
                </ul>
                
                <p className="pt-2">5. Нажмите <strong>"Done"</strong></p>
                
                <Alert className="bg-accent/5 border-accent/30">
                  <CheckCircle size={18} className="text-accent" />
                  <AlertDescription className="ml-2 text-xs">
                    Firebase Storage создан! Теперь нужно настроить правила доступа.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">4</span>
                Настройка правил безопасности
              </h3>
              <div className="ml-8 space-y-2 text-sm">
                <Alert className="bg-yellow-50 border-yellow-300 mb-3">
                  <Info size={18} className="text-yellow-600" />
                  <AlertDescription className="ml-2 text-xs text-yellow-800">
                    <strong>Важно!</strong> Вкладка "Rules" находится <strong>ВНУТРИ</strong> раздела Storage, а не на главной странице проекта.
                  </AlertDescription>
                </Alert>

                <p><strong>Шаг 1:</strong> В <strong>ЛЕВОМ МЕНЮ</strong> найдите и нажмите на раздел <strong>"Storage"</strong></p>
                
                <Card className="bg-blue-50/50 border-blue-200 my-2">
                  <CardContent className="p-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-900">📍 Где находится Storage:</p>
                      <div className="ml-3 space-y-0.5 text-blue-800">
                        <p>• Посмотрите на <strong>ЛЕВУЮ БОКОВУЮ ПАНЕЛЬ</strong></p>
                        <p>• Найдите раздел "Product categories" или "Build"</p>
                        <p>• Нажмите на <strong>"Storage"</strong></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <p><strong>Шаг 2:</strong> После открытия Storage вы увидите <strong>ДВЕ ВКЛАДКИ ВВЕРХУ СТРАНИЦЫ:</strong></p>
                <ul className="ml-4 list-disc space-y-1">
                  <li><strong>"Files"</strong> - список загруженных файлов</li>
                  <li><strong>"Rules"</strong> - правила безопасности (нам нужна эта!)</li>
                </ul>
                
                <p><strong>Шаг 3:</strong> Нажмите на вкладку <strong>"Rules"</strong></p>
                
                <p><strong>Шаг 4:</strong> Замените существующие правила на следующие:</p>
                
                <Card className="bg-muted/50 border-border mt-2 mb-2">
                  <CardContent className="p-4">
                    <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Разрешить всем читать изображения
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Разрешить загрузку только изображений
    match /restaurants/{restaurantId}/{fileName} {
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    
    match /menu-items/{itemId}/{fileName} {
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}`}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const rules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
    }
    match /restaurants/{restaurantId}/{fileName} {
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /menu-items/{itemId}/{fileName} {
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}`
                        navigator.clipboard.writeText(rules)
                        toast.success('Security rules copied to clipboard')
                      }}
                    >
                      <Copy size={14} className="mr-2" />
                      Скопировать правила
                    </Button>
                  </CardContent>
                </Card>
                
                <p><strong>Шаг 5:</strong> Нажмите кнопку <strong>"Publish"</strong> в верхней ча��ти редактора правил</p>
                
                <Alert className="bg-muted/30 border-border">
                  <Info size={18} />
                  <AlertDescription className="ml-2 text-xs">
                    <strong>Важно:</strong> Эти правила разрешают всем читать изображения (публичный доступ) и загружать только изображения размером до 5 МБ.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">5</span>
                Создание Web приложения и получение API ключа
              </h3>
              <div className="ml-8 space-y-2 text-sm">
                <p>1. Вернитесь на главную страницу проекта (нажмите на название проекта вверху)</p>
                
                <p>2. В центре страницы нажмите на иконку <strong>{"</>"}</strong> (Web) для создания веб-приложения</p>
                
                <p>3. Введите название приложения (например: <code className="bg-muted px-2 py-0.5 rounded">Imperial Menu Web</code>)</p>
                
                <p>4. <strong>НЕ</strong> включайте Firebase Hosting</p>
                
                <p>5. Нажмите <strong>"Register app"</strong></p>
                
                <p>6. Вы увидите конфигурацию Firebase SDK. Скопируйте следующие значения:</p>
                
                <Card className="bg-muted/50 border-border mt-2 mb-2">
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs space-y-1">
                      <p className="font-semibold">Пример конфигурации:</p>
                      <pre className="text-[11px] font-mono whitespace-pre-wrap overflow-x-auto text-muted-foreground">
{`const firebaseConfig = {
  apiKey: "AIzaSyA...", // ← Скопируйте это в поле "Firebase API Key"
  projectId: "imperial-delicious-menu", // ← Скопируйте это в "Project ID"
  storageBucket: "imperial-delicious-menu.appspot.com", // ← Скопируйте это в "Storage Bucket"
};`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
                
                <p>7. Нажмите <strong>"Continue to console"</strong></p>
                
                <Alert className="bg-accent/5 border-accent/30">
                  <CheckCircle size={18} className="text-accent" />
                  <AlertDescription className="ml-2 text-xs">
                    <strong>Отлично!</strong> Теперь скопируйте эти значения в форму выше на этой странице и нажмите "Save Firebase Configuration".
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">6</span>
                Создание структуры папок в Storage
              </h3>
              <div className="ml-8 space-y-2 text-sm">
                <p>1. Вернитесь в <strong>"Storage"</strong> в левом меню</p>
                
                <p>2. Нажмите <strong>"Upload file"</strong> или <strong>"Upload folder"</strong></p>
                
                <p>3. Создайте следующую структуру папок:</p>
                
                <Card className="bg-muted/50 border-border mt-2 mb-2">
                  <CardContent className="p-4">
                    <div className="text-xs font-mono space-y-1">
                      <div>📁 restaurants/</div>
                      <div className="ml-4">└── 📁 {'{restaurant-id}'}/ <span className="text-muted-foreground">// ID каждого рес��орана</span></div>
                      <div className="ml-8">└── 🖼️ cover.jpg</div>
                      <div className="ml-8">└── 🖼️ gallery-1.jpg</div>
                      <div className="ml-8">└── 🖼️ gallery-2.jpg</div>
                      <div className="mt-2">📁 menu-items/</div>
                      <div className="ml-4">└── 📁 {'{item-id}'}/ <span className="text-muted-foreground">// ID каждой позиции меню</span></div>
                      <div className="ml-8">└── 🖼️ item-photo.jpg</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Alert className="bg-accent/5 border-accent/30">
                  <CheckCircle size={18} className="text-accent" />
                  <AlertDescription className="ml-2 text-xs">
                    <strong>💡 СОВЕТ:</strong> Используйте автозагрузку из Google Drive (вкладка "Drive → Firebase") для массовой загрузки изображений!
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">7</span>
                Получение публичного URL изображения
              </h3>
              <div className="ml-8 space-y-2 text-sm">
                <p>После загрузки изображения в Firebase Storage:</p>
                
                <p>1. Нажмите на файл в списке Storage</p>
                
                <p>2. В правой панели найдите раздел <strong>"Access tokens"</strong></p>
                
                <p>3. Скопируйте <strong>"Download URL"</strong> или создайте новый токен доступа</p>
                
                <p>4. Используйте этот URL в админ панели при добавлении ресторана или позиции меню</p>
                
                <Card className="bg-muted/50 border-border mt-2">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold mb-1">Пример URL:</p>
                    <pre className="text-[10px] font-mono whitespace-pre-wrap overflow-x-auto text-muted-foreground break-all">
https://firebasestorage.googleapis.com/v0/b/imperial-delicious-menu.appspot.com/o/restaurants%2Fgalla-catering%2Fcover.jpg?alt=media&token=abc123...
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-lg border border-accent/20">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-accent-foreground">
                <CheckCircle size={24} className="text-accent" />
                Готово!
              </h3>
              <p className="text-sm leading-relaxed">
                Теперь вы можете использовать Firebase Storage для хранения всех изображений ресторанов и позиций меню. 
                Все изображения будут доступны через CDN Firebase с высокой скоростью загрузки по всему миру.
              </p>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">Полезные ссылки:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                  >
                    <ArrowSquareOut size={14} className="mr-2" />
                    Firebase Console
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://firebase.google.com/docs/storage', '_blank')}
                  >
                    <ArrowSquareOut size={14} className="mr-2" />
                    Firebase Storage Docs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://firebase.google.com/pricing', '_blank')}
                  >
                    <ArrowSquareOut size={14} className="mr-2" />
                    Pricing (Free Tier)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-lg">💡 Преимущества использования Firebase Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <span><strong>Бесплатный тариф:</strong> 5 ГБ хранилища и 1 ГБ трафика в день бесплатно</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <span><strong>Глобальный CDN:</strong> Изображения загружаются быстро из любой точки мира</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <span><strong>Автоматическое масштабирование:</strong> Обрабатывает любое количество запросов</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <span><strong>Безопасность:</strong> Гибкие правила доступа и защита от несанкционированной загрузки</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <span><strong>Оптимизация:</strong> Автоматическое сжатие и оптимизация изображений</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
