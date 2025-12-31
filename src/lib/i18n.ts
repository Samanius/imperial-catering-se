export type Language = 'en' | 'ru'

type TranslationObject = {
  [key: string]: string | TranslationObject
}

export const translations = {
  en: {
    header: {
      title: 'Imperial delicious menu',
      subtitle: 'Curated Dining for the High Seas',
      language: 'Language',
    },
    catalog: {
      heading: 'Explore Our Curated Selection',
      description: 'Each restaurant brings its own unique culinary perspective.',
      noRestaurants: 'No restaurants available. Please check back later.',
      heroTitle: 'Exquisite Dining.\nOn your Yacht.',
      heroSubtitle: "Curated gastronomy from Dubai's finest establishments",
    },
    restaurant: {
      minimumOrder: 'Min. order',
      orderDeadline: 'Order {{hours}}h before charter',
      chefServiceAvailable: 'Chef Service Available',
      waiterServiceAvailable: 'Waiter Service Available',
      chefAndWaiterAvailable: 'Chef & Waiter Services Available',
      exploreMenu: 'Explore Menu',
      orderInformation: 'Order Information',
      additionalServices: 'Additional Services',
      chefService: 'Chef Service',
      waiterService: 'Waiter Service',
      waiters: 'Waiters',
      addToCart: 'Add to Cart',
      alreadyInCart: 'Already in Cart',
      theStory: 'The Story',
      ourMenu: 'Our Menu',
      tastingMenu: 'Tasting Menu',
      aLaCarte: 'A la Carte',
      backToCatalog: 'Back to Catalog',
    },
    cart: {
      title: 'Your Order',
      empty: 'Your cart is empty',
      emptyDescription: 'Explore our restaurants and add items to begin your culinary journey.',
      subtotal: 'Subtotal',
      services: 'Services',
      total: 'Total',
      continueExploring: 'Continue Exploring',
      proceedToOrder: 'Proceed to Order',
      orderSummary: 'Order Summary',
      fromRestaurant: 'from',
      items: 'items',
    },
    concierge: {
      placeOrder: 'Place Order',
      orderNow: 'Order Now',
      selectItems: 'Select items from our restaurants to place an order.',
      conciergeOrder: 'Concierge Order',
      conciergeService: 'Concierge Service',
      describeDining: 'Describe your dining experience',
      placeholder: 'I would like the Tasting Menu for 4 guests on Friday evening...',
      ourConcierge: 'Our concierge will personally arrange your experience',
      sendViaWhatsapp: 'Send via WhatsApp',
      chefSignature: "Chef's signature",
      yourRequest: 'Your Request',
      conciergeDescription: 'Describe your perfect dining experience and our concierge will arrange everything.',
      placeholderLong: 'I would like to order a tasting menu for 6 guests on Friday evening. We prefer seafood and have one vegetarian guest...',
      enterDetails: 'Please enter your order details',
      provideDetails: 'Please provide more details about your order',
      openingWhatsapp: 'Opening WhatsApp...',
      charactersCount: '{{count}} characters',
    },
    services: {
      chefService: 'Chef Service',
      waiterService: 'Waiter Service ({{count}})',
      totalServiceCost: 'Total service cost',
      perWaiter: 'per waiter',
    },
    admin: {
      title: 'Admin Panel',
      dashboard: 'Concierge Dashboard',
      manageRestaurants: 'Manage restaurants and menus',
      restaurants: 'Restaurants',
      database: 'Database',
      translations: 'Translations',
      addRestaurant: 'Add Restaurant',
      newRestaurant: 'New Restaurant',
      editRestaurant: 'Edit Restaurant',
      importFromSheets: 'Import from Google Sheets',
      refreshData: 'Refresh Data',
      noRestaurants: 'No restaurants yet. Add one to get started.',
      selectOrCreate: 'Select a restaurant or create a new one',
      hide: 'Hide',
      show: 'Show',
      edit: 'Edit',
      delete: 'Delete',
      visible: 'Visible',
      hidden: 'Hidden',
      saveRestaurant: 'Save Restaurant',
      restaurantName: 'Restaurant Name',
      tagline: 'Tagline',
      tags: 'Tags',
      story: 'Restaurant Story',
      coverImage: 'Cover Image',
      menuType: 'Menu Type',
      minimumOrderAmount: 'Minimum Order Amount',
      orderDeadlineHours: 'Order Deadline (hours before charter)',
      chefServicePrice: 'Chef Service Price',
      waiterServicePrice: 'Waiter Service Price (per waiter)',
      tastingMenuDescription: 'Tasting Menu Description',
      menuCategories: 'Menu Categories',
      menuItems: 'Menu Items',
      addMenuItem: 'Add Menu Item',
      itemName: 'Item name',
      price: 'Price',
      category: 'Category',
      weight: 'Weight (g)',
      description: 'Description',
      addItem: 'Add Item',
      dragAndDrop: 'Drag and drop image here or click to browse',
      uploadingImage: 'Uploading...',
      imageFormats: 'JPG, PNG, WebP, or GIF (max 5MB)',
      required: 'required',
      fillRequired: 'Please fill required fields',
      restaurantCreated: 'Restaurant created',
      restaurantUpdated: 'Restaurant updated',
      restaurantDeleted: 'Restaurant deleted',
      menuItemAdded: 'Menu item added',
      menuItemUpdated: 'Menu item updated',
      confirmDelete: 'Are you sure you want to delete this restaurant?',
    },
    database: {
      title: 'Database Configuration',
      refreshDatabase: 'Refresh Database',
      loadLatest: 'Load latest data from cloud',
      refreshing: 'Refreshing database...',
      refreshSuccess: 'Database refreshed successfully!',
      refreshFailed: 'Failed to refresh database',
      configDetails: 'Configuration Details',
      googleFolder: 'Folder',
      googleFile: 'File',
      googleApiKey: 'Api Key',
      gitApiToken: 'Api Token',
      gitDatabase: 'Database',
    },
    translationsEditor: {
      title: 'Translations Editor',
      subtitle: 'Edit all website text in English and Russian',
      resetToDefaults: 'Reset to Defaults',
      saveChanges: 'Save Changes',
      confirmReset: 'Reset all translations to default values? This cannot be undone.',
      saved: 'Translations saved successfully!',
      reset: 'Translations reset to defaults',
      english: 'English',
      russian: 'Русский',
    },
    common: {
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      remove: 'Remove',
      add: 'Add',
      back: 'Back',
      english: 'English',
      russian: 'Русский',
    },
    footer: {
      copyright: '© {{year}} Imperial Delicious Menu. Curated dining for the high seas.',
      documentation: 'Updates & Documentation',
    },
  },
  ru: {
    header: {
      title: 'Imperial delicious menu',
      subtitle: 'Изысканная кухня для морских путешествий',
      language: 'Язык',
    },
    catalog: {
      heading: 'Наша Тщательно Подобранная Коллекция',
      description: 'Каждый ресторан предлагает свою уникальную кулинарную концепцию.',
      noRestaurants: 'Рестораны временно недоступны. Пожалуйста, вернитесь позже.',
      heroTitle: 'Изысканная кухня.\nНа вашей яхте.',
      heroSubtitle: 'Лучшие рестораны Дубая для вашего путешествия',
    },
    restaurant: {
      minimumOrder: 'Мин. заказ',
      orderDeadline: 'Заказ за {{hours}}ч до чартера',
      chefServiceAvailable: 'Доступна услуга шеф-повара',
      waiterServiceAvailable: 'Доступна услуга официанта',
      chefAndWaiterAvailable: 'Доступны услуги шеф-повара и официанта',
      exploreMenu: 'Изучить меню',
      orderInformation: 'Информация о заказе',
      additionalServices: 'Дополнительные услуги',
      chefService: 'Услуга шеф-повара',
      waiterService: 'Услуга официанта',
      waiters: 'Официанты',
      addToCart: 'Добавить в корзину',
      alreadyInCart: 'Уже в корзине',
      theStory: 'История',
      ourMenu: 'Наше меню',
      tastingMenu: 'Дегустационное меню',
      aLaCarte: 'А ля карт',
      backToCatalog: 'Вернуться в каталог',
    },
    cart: {
      title: 'Ваш заказ',
      empty: 'Ваша корзина пуста',
      emptyDescription: 'Изучите наши рестораны и добавьте блюда, чтобы начать кулинарное путешествие.',
      subtotal: 'Промежуточный итог',
      services: 'Услуги',
      total: 'Итого',
      continueExploring: 'Продолжить выбор',
      proceedToOrder: 'Оформить заказ',
      orderSummary: 'Итоги заказа',
      fromRestaurant: 'из',
      items: 'позиций',
    },
    concierge: {
      placeOrder: 'Оформить заказ',
      orderNow: 'Заказать сейчас',
      selectItems: 'Выберите блюда из наших ресторанов, чтобы оформить заказ.',
      conciergeOrder: 'Заказ через консьержа',
      conciergeService: 'Консьерж-сервис',
      describeDining: 'Опишите желаемый ужин',
      placeholder: 'Я хотел бы дегустационное меню для 4 гостей в пятницу вечером...',
      ourConcierge: 'Наш консьерж лично организует ваш ужин',
      sendViaWhatsapp: 'Отправить через WhatsApp',
      chefSignature: 'Подпись шеф-повара',
      yourRequest: 'Ваш запрос',
      conciergeDescription: 'Опишите ваше идеальное застолье, и наш консьерж организует все.',
      placeholderLong: 'Я хотел бы заказать дегустационное меню для 6 гостей в пятницу вечером. Мы предпочитаем морепродукты, и у нас один гость-вегетарианец...',
      enterDetails: 'Пожалуйста, введите детали вашего заказа',
      provideDetails: 'Пожалуйста, укажите больше деталей о вашем заказе',
      openingWhatsapp: 'Открываем WhatsApp...',
      charactersCount: '{{count}} символов',
    },
    services: {
      chefService: 'Услуга шеф-повара',
      waiterService: 'Услуга официанта ({{count}})',
      totalServiceCost: 'Общая стоимость услуг',
      perWaiter: 'за официанта',
    },
    admin: {
      title: 'Панель администратора',
      dashboard: 'Панель Консьержа',
      manageRestaurants: 'Управление ресторанами и меню',
      restaurants: 'Рестораны',
      database: 'База данных',
      translations: 'Переводы',
      addRestaurant: 'Добавить ресторан',
      newRestaurant: 'Новый ресторан',
      editRestaurant: 'Редактировать ресторан',
      importFromSheets: 'Импорт из Google Таблиц',
      refreshData: 'Обновить данные',
      noRestaurants: 'Рестораны отсутствуют. Добавьте первый ресторан.',
      selectOrCreate: 'Выберите ресторан или создайте новый',
      hide: 'Скрыть',
      show: 'Показать',
      edit: 'Редактировать',
      delete: 'Удалить',
      visible: 'Видимый',
      hidden: 'Скрытый',
      saveRestaurant: 'Сохранить ресторан',
      restaurantName: 'Название ресторана',
      tagline: 'Слоган',
      tags: 'Теги',
      story: 'История ресторана',
      coverImage: 'Обложка',
      menuType: 'Тип меню',
      minimumOrderAmount: 'Минимальная сумма заказа',
      orderDeadlineHours: 'Срок заказа (часов до чартера)',
      chefServicePrice: 'Цена услуги шеф-повара',
      waiterServicePrice: 'Цена услуги официанта (за официанта)',
      tastingMenuDescription: 'Описание дегустационного меню',
      menuCategories: 'Категории меню',
      menuItems: 'Позиции меню',
      addMenuItem: 'Добавить позицию',
      itemName: 'Название позиции',
      price: 'Цена',
      category: 'Категория',
      weight: 'Вес (г)',
      description: 'Описание',
      addItem: 'Добавить позицию',
      dragAndDrop: 'Перетащите изображение сюда или нажмите для выбора',
      uploadingImage: 'Загрузка...',
      imageFormats: 'JPG, PNG, WebP или GIF (макс. 5МБ)',
      required: 'обязательно',
      fillRequired: 'Пожалуйста, заполните обязательные поля',
      restaurantCreated: 'Ресторан создан',
      restaurantUpdated: 'Ресторан обновлен',
      restaurantDeleted: 'Ресторан удален',
      menuItemAdded: 'Позиция добавлена',
      menuItemUpdated: 'Позиция обновлена',
      confirmDelete: 'Вы уверены, что хотите удалить этот ресторан?',
    },
    database: {
      title: 'Настройка базы данных',
      refreshDatabase: 'Обновить базу данных',
      loadLatest: 'Загрузить последние данные из облака',
      refreshing: 'Обновление базы данных...',
      refreshSuccess: 'База данных успешно обновлена!',
      refreshFailed: 'Не удалось обновить базу данных',
      configDetails: 'Детали конфигурации',
      googleFolder: 'Папка',
      googleFile: 'Файл',
      googleApiKey: 'API ключ',
      gitApiToken: 'API токен',
      gitDatabase: 'База данных',
    },
    translationsEditor: {
      title: 'Редактор переводов',
      subtitle: 'Редактирование всех текстов сайта на английском и русском',
      resetToDefaults: 'Сбросить к стандартным',
      saveChanges: 'Сохранить изменения',
      confirmReset: 'Сбросить все переводы к стандартным значениям? Это действие нельзя отменить.',
      saved: 'Переводы успешно сохранены!',
      reset: 'Переводы сброшены к стандартным значениям',
      english: 'English',
      russian: 'Русский',
    },
    common: {
      close: 'Закрыть',
      cancel: 'Отмена',
      save: 'Сохранить',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      remove: 'Удалить',
      add: 'Добавить',
      back: 'Назад',
      english: 'English',
      russian: 'Русский',
    },
    footer: {
      copyright: '© {{year}} Imperial Delicious Menu. Изысканная кухня для морских путешествий.',
      documentation: 'Обновления и документация',
    },
  },
}

let cachedCustomTranslations: { en: TranslationObject; ru: TranslationObject } = { en: {}, ru: {} }
let lastLoadTime = 0
const CACHE_DURATION = 1000

function loadCustomTranslations(): { en: TranslationObject; ru: TranslationObject } {
  const now = Date.now()
  if ((now - lastLoadTime) < CACHE_DURATION) {
    return cachedCustomTranslations
  }
  
  try {
    const stored = localStorage.getItem('kv:custom-translations')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') {
        cachedCustomTranslations = { en: {}, ru: {}, ...parsed }
        lastLoadTime = now
        return cachedCustomTranslations
      }
    }
  } catch (error) {
    console.error('Failed to load custom translations:', error)
  }
  
  cachedCustomTranslations = { en: {}, ru: {} }
  lastLoadTime = now
  return cachedCustomTranslations
}

export function clearTranslationCache() {
  lastLoadTime = 0
  cachedCustomTranslations = { en: {}, ru: {} }
}

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }
  
  return typeof current === 'string' ? current : undefined
}

export function t(key: string, lang: Language, replacements?: Record<string, string | number>): string {
  const customTranslations = loadCustomTranslations()
  
  const customValue = getNestedValue(customTranslations[lang], key)
  if (customValue !== undefined && customValue !== '') {
    if (replacements) {
      return customValue.replace(/\{\{(\w+)\}\}/g, (_, key) => String(replacements[key] ?? ''))
    }
    return customValue
  }
  
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  if (typeof value !== 'string') {
    return key
  }
  
  if (replacements) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, key) => String(replacements[key] ?? ''))
  }
  
  return value
}
