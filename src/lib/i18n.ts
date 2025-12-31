export type Language = 'en' | 'ru'

export const translations = {
  en: {
    header: {
      title: 'Imperial delicious menu',
      subtitle: 'Curated Dining for the High Seas',
    },
    catalog: {
      heading: 'Explore Our Curated Selection',
      description: 'Each restaurant brings its own unique culinary perspective.',
      noRestaurants: 'No restaurants available. Please check back later.',
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
    },
    concierge: {
      placeOrder: 'Place Order',
      orderNow: 'Order Now',
      selectItems: 'Select items from our restaurants to place an order.',
    },
    services: {
      chefService: 'Chef Service',
      waiterService: 'Waiter Service ({{count}})',
    },
    admin: {
      title: 'Admin Panel',
      restaurants: 'Restaurants',
      database: 'Database',
      addRestaurant: 'Add Restaurant',
      importFromSheets: 'Import from Google Sheets',
      refreshData: 'Refresh Data',
      noRestaurants: 'No restaurants yet. Add one to get started.',
      hide: 'Hide',
      show: 'Show',
      edit: 'Edit',
      delete: 'Delete',
      visible: 'Visible',
      hidden: 'Hidden',
    },
    footer: {
      copyright: '© {{year}} Imperial Delicious Menu. Curated dining for the high seas.',
      documentation: 'Updates & Documentation',
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
    },
  },
  ru: {
    header: {
      title: 'Imperial delicious menu',
      subtitle: 'Изысканная кухня для морских путешествий',
    },
    catalog: {
      heading: 'Наша Тщательно Подобранная Коллекция',
      description: 'Каждый ресторан предлагает свою уникальную кулинарную концепцию.',
      noRestaurants: 'Рестораны временно недоступны. Пожалуйста, вернитесь позже.',
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
    },
    concierge: {
      placeOrder: 'Оформить заказ',
      orderNow: 'Заказать сейчас',
      selectItems: 'Выберите блюда из наших ресторанов, чтобы оформить заказ.',
    },
    services: {
      chefService: 'Услуга шеф-повара',
      waiterService: 'Услуга официанта ({{count}})',
    },
    admin: {
      title: 'Панель администратора',
      restaurants: 'Рестораны',
      database: 'База данных',
      addRestaurant: 'Добавить ресторан',
      importFromSheets: 'Импорт из Google Таблиц',
      refreshData: 'Обновить данные',
      noRestaurants: 'Рестораны отсутствуют. Добавьте первый ресторан.',
      hide: 'Скрыть',
      show: 'Показать',
      edit: 'Редактировать',
      delete: 'Удалить',
      visible: 'Видимый',
      hidden: 'Скрытый',
    },
    footer: {
      copyright: '© {{year}} Imperial Delicious Menu. Изысканная кухня для морских путешествий.',
      documentation: 'Обновления и документация',
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
    },
  },
}

export function t(key: string, lang: Language, replacements?: Record<string, string | number>): string {
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
