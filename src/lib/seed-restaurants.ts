import type { Restaurant } from './types'

export const seedRestaurants: Restaurant[] = [
  {
    id: 'zuma-dubai',
    name: 'Zuma Dubai',
    tagline: 'Contemporary Japanese Izakaya',
    tags: ['Japanese', 'Sushi', 'Contemporary'],
    description: 'Sophisticated twist on the traditional Japanese izakaya style of dining. Award-winning restaurant featuring contemporary Japanese cuisine.',
    story: 'Zuma offers a sophisticated cuisine philosophy of flavorsome, modern Japanese food. The menu showcases the best of izakaya dining, with a selection of dishes that blend traditional and contemporary elements.',
    menuType: 'visual',
    coverImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=2000',
      'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=2000',
      'https://images.unsplash.com/photo-1563612116625-3012372fccce?q=80&w=2000'
    ],
    minimumOrderAmount: 2500,
    orderDeadlineHours: 48,
    chefServicePrice: 1500,
    waiterServicePrice: 300,
    categories: ['Sashimi & Sushi', 'Main Dishes', 'Signature Rolls', 'Desserts'],
    menuItems: [
      {
        id: 'zuma-1',
        name: 'Salmon Sashimi',
        description: 'Fresh Scottish salmon, wasabi, soy',
        price: 180,
        category: 'Sashimi & Sushi',
        weight: 120
      },
      {
        id: 'zuma-2',
        name: 'Spicy Tuna Roll',
        description: 'Yellowfin tuna, cucumber, chili mayo',
        price: 95,
        category: 'Signature Rolls',
        weight: 200
      },
      {
        id: 'zuma-3',
        name: 'Black Cod Miso',
        description: 'Marinated in sweet miso, 72 hours',
        price: 295,
        category: 'Main Dishes',
        weight: 180
      },
      {
        id: 'zuma-4',
        name: 'Wagyu Beef Tataki',
        description: 'Australian wagyu, ponzu, chili daikon',
        price: 320,
        category: 'Main Dishes',
        weight: 150
      },
      {
        id: 'zuma-5',
        name: 'Mochi Ice Cream',
        description: 'Selection of flavors',
        price: 65,
        category: 'Desserts',
        weight: 100
      }
    ]
  },
  {
    id: 'nobu-dubai',
    name: 'Nobu Dubai',
    tagline: 'Japanese Peruvian Fusion',
    tags: ['Japanese', 'Peruvian', 'Fusion'],
    description: 'World-renowned restaurant bringing Chef Nobu Matsuhisa\'s unique Japanese-Peruvian cuisine to your yacht.',
    story: 'Nobu has earned global recognition for pioneering a new style of Japanese cuisine. The menu features innovative dishes that blend Japanese traditions with South American ingredients.',
    menuType: 'visual',
    coverImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=2000',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000'
    ],
    minimumOrderAmount: 3000,
    orderDeadlineHours: 48,
    chefServicePrice: 1800,
    waiterServicePrice: 350,
    categories: ['Cold Dishes', 'Hot Dishes', 'Sushi & Sashimi', 'Signature'],
    menuItems: [
      {
        id: 'nobu-1',
        name: 'Yellowtail Jalapeño',
        description: 'Signature dish with yuzu soy',
        price: 165,
        category: 'Cold Dishes',
        weight: 100
      },
      {
        id: 'nobu-2',
        name: 'Black Cod with Miso',
        description: 'Marinated for 3 days',
        price: 350,
        category: 'Signature',
        weight: 200
      },
      {
        id: 'nobu-3',
        name: 'Rock Shrimp Tempura',
        description: 'Creamy spicy sauce',
        price: 145,
        category: 'Hot Dishes',
        weight: 180
      },
      {
        id: 'nobu-4',
        name: 'Wagyu Tacos',
        description: 'With crispy onions, salsa',
        price: 195,
        category: 'Signature',
        weight: 140
      }
    ]
  },
  {
    id: 'pierchic',
    name: 'Pierchic',
    tagline: 'Seafood Excellence Over Water',
    tags: ['Seafood', 'Mediterranean', 'Fine Dining'],
    description: 'Perched at the end of a pier with stunning views, Pierchic offers the finest seafood and Mediterranean cuisine.',
    story: 'An iconic over-water seafood restaurant offering breathtaking views of the Arabian Gulf. The menu celebrates the ocean\'s bounty with fresh catches and refined Mediterranean flavors.',
    menuType: 'visual',
    coverImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000',
      'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?q=80&w=2000'
    ],
    minimumOrderAmount: 2800,
    orderDeadlineHours: 36,
    chefServicePrice: 1600,
    waiterServicePrice: 320,
    categories: ['Starters', 'Fish & Shellfish', 'Lobster', 'Desserts'],
    menuItems: [
      {
        id: 'pier-1',
        name: 'Oysters Trio',
        description: 'Selection of 3 varieties',
        price: 220,
        category: 'Starters',
        weight: 150
      },
      {
        id: 'pier-2',
        name: 'Mediterranean Sea Bass',
        description: 'Grilled, lemon herb butter',
        price: 280,
        category: 'Fish & Shellfish',
        weight: 350
      },
      {
        id: 'pier-3',
        name: 'Boston Lobster',
        description: 'Thermidor or grilled',
        price: 480,
        category: 'Lobster',
        weight: 500
      },
      {
        id: 'pier-4',
        name: 'King Crab Legs',
        description: 'Alaskan, drawn butter',
        price: 420,
        category: 'Fish & Shellfish',
        weight: 400
      }
    ]
  },
  {
    id: 'coya-dubai',
    name: 'Coya Dubai',
    tagline: 'Vibrant Peruvian Cuisine',
    tags: ['Peruvian', 'Latin', 'Contemporary'],
    description: 'Authentic Peruvian cuisine with a contemporary twist, featuring ceviche, anticuchos, and vibrant flavors.',
    story: 'Inspired by Peruvian culture and cuisine, Coya brings the energy and spirit of Latin America to life. The menu celebrates traditional recipes with contemporary presentation.',
    menuType: 'visual',
    coverImage: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=2000',
      'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=2000'
    ],
    minimumOrderAmount: 2200,
    orderDeadlineHours: 24,
    chefServicePrice: 1400,
    waiterServicePrice: 280,
    categories: ['Ceviche', 'Anticuchos', 'Mains', 'Pisco Cocktails'],
    menuItems: [
      {
        id: 'coya-1',
        name: 'Sea Bass Ceviche',
        description: 'Tiger\'s milk, sweet potato, corn',
        price: 125,
        category: 'Ceviche',
        weight: 180
      },
      {
        id: 'coya-2',
        name: 'Wagyu Anticuchos',
        description: 'Grilled skewers, aji panca',
        price: 185,
        category: 'Anticuchos',
        weight: 200
      },
      {
        id: 'coya-3',
        name: 'Lobster Rice',
        description: 'Yellow chili, coriander',
        price: 295,
        category: 'Mains',
        weight: 400
      },
      {
        id: 'coya-4',
        name: 'Dulce de Leche Cheesecake',
        description: 'Passion fruit, meringue',
        price: 75,
        category: 'Desserts',
        weight: 150
      }
    ]
  },
  {
    id: 'amazonico-dubai',
    name: 'Amazónico Dubai',
    tagline: 'Latin American Rainforest Experience',
    tags: ['Latin American', 'Brazilian', 'Theatrical'],
    description: 'An immersive journey through the Amazon rainforest with bold Latin American flavors and theatrical presentation.',
    story: 'Amazónico celebrates the cultural diversity and gastronomic heritage of the Amazon region, bringing together flavors from Brazil, Peru, Colombia, and beyond.',
    menuType: 'visual',
    coverImage: 'https://images.unsplash.com/photo-1514326640560-7d063f2aad85?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1514326640560-7d063f2aad85?q=80&w=2000',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000'
    ],
    minimumOrderAmount: 2400,
    orderDeadlineHours: 36,
    chefServicePrice: 1500,
    waiterServicePrice: 300,
    categories: ['Robata', 'Sushi', 'Mains', 'Sharing'],
    menuItems: [
      {
        id: 'amaz-1',
        name: 'Tuna Tataki',
        description: 'Sesame crust, ponzu',
        price: 140,
        category: 'Robata',
        weight: 150
      },
      {
        id: 'amaz-2',
        name: 'Wagyu Picanha',
        description: 'Brazilian cut, chimichurri',
        price: 380,
        category: 'Mains',
        weight: 350
      },
      {
        id: 'amaz-3',
        name: 'Amazon Platter',
        description: 'Selection for 4 people',
        price: 650,
        category: 'Sharing',
        weight: 1200
      },
      {
        id: 'amaz-4',
        name: 'Tropical Ceviche',
        description: 'Mango, passion fruit, chili',
        price: 135,
        category: 'Sushi',
        weight: 180
      }
    ]
  },
  {
    id: 'dinner-by-heston',
    name: 'Dinner by Heston Blumenthal',
    tagline: 'Historic British Gastronomy',
    tags: ['British', 'Molecular', 'Michelin'],
    description: 'Historic British cuisine reimagined with modern techniques. Each dish tells a story from culinary history.',
    story: 'Inspired by historic British gastronomy dating back to the 1300s, Dinner showcases recipes from royal feasts and aristocratic tables, brought to life with contemporary flair.',
    menuType: 'tasting',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000'
    ],
    minimumOrderAmount: 3500,
    orderDeadlineHours: 72,
    chefServicePrice: 2000,
    waiterServicePrice: 400,
    tastingMenuDescription: 'Experience a journey through British culinary history with our 7-course tasting menu. Each dish is meticulously crafted using recipes dating from the 1300s to the 1900s, reimagined with modern techniques and presentation.\n\nMeat Fruit (c.1500)\nMandarin, chicken liver parfait\n\nPowdered Duck (c.1670)\nBreast and leg, blood orange, fennel\n\nLamb & Cucumber (c.1730)\nBest end, braised shoulder, pickled cucumber\n\nTipsy Cake (c.1810)\nSpit roast pineapple, brioche\n\nPrice: AED 850 per person',
    categories: [],
    menuItems: []
  },
  {
    id: 'ossiano',
    name: 'Ossiano',
    tagline: 'Underwater Dining Marvel',
    tags: ['Seafood', 'French', 'Michelin'],
    description: 'Subaquatic restaurant offering an immersive dining experience with views into The Ambassador Lagoon.',
    story: 'Ossiano takes guests on a culinary journey beneath the waves. Chef Grégoire Berger creates innovative dishes inspired by the ocean, served in a stunning underwater setting.',
    menuType: 'tasting',
    coverImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000',
      'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?q=80&w=2000'
    ],
    minimumOrderAmount: 4000,
    orderDeadlineHours: 72,
    chefServicePrice: 2200,
    waiterServicePrice: 450,
    tastingMenuDescription: '11-course journey through the ocean\'s depths. Chef Grégoire Berger\'s innovative cuisine celebrates marine biodiversity with sustainable ingredients and avant-garde techniques.\n\nAmuse Bouche\nOyster & Caviar\n\nLangoustine\nButtermilk & Herbs\n\nScallop\nYuzu & Sea Urchin\n\nTurbot\nBeurre Blanc & Samphire\n\nLobster\nBisque & Truffle\n\nWagyu\nJapanese Style\n\nDessert Progression\nOcean-inspired sweetness\n\nPrice: AED 1,200 per person',
    categories: [],
    menuItems: []
  },
  {
    id: 'la-petite-maison',
    name: 'La Petite Maison',
    tagline: 'Nice-Inspired Mediterranean',
    tags: ['French', 'Mediterranean', 'Riviera'],
    description: 'Celebrating the French Riviera with authentic Nice cuisine, fresh ingredients, and simple preparations.',
    story: 'La Petite Maison embodies the spirit of the South of France, offering rustic yet refined dishes that showcase the best of Mediterranean ingredients with traditional French technique.',
    menuType: 'visual',
    coverImage: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000'
    ],
    minimumOrderAmount: 2600,
    orderDeadlineHours: 48,
    chefServicePrice: 1600,
    waiterServicePrice: 320,
    categories: ['Starters', 'Mains', 'Vegetables', 'Desserts'],
    menuItems: [
      {
        id: 'lpm-1',
        name: 'Burrata Pugliese',
        description: 'Cherry tomatoes, basil, olive oil',
        price: 98,
        category: 'Starters',
        weight: 200
      },
      {
        id: 'lpm-2',
        name: 'Whole Grilled Sea Bream',
        description: 'Lemon, herbs de Provence',
        price: 265,
        category: 'Mains',
        weight: 400
      },
      {
        id: 'lpm-3',
        name: 'Côte de Boeuf',
        description: 'For two, sauce béarnaise',
        price: 495,
        category: 'Mains',
        weight: 800
      },
      {
        id: 'lpm-4',
        name: 'Lemon Tart',
        description: 'Classic French style',
        price: 68,
        category: 'Desserts',
        weight: 120
      }
    ]
  },
  {
    id: 'nusr-et',
    name: 'Nusr-Et Steakhouse',
    tagline: 'The Art of Meat',
    tags: ['Steakhouse', 'Turkish', 'Premium'],
    description: 'World-famous steakhouse offering premium cuts prepared with theatrical flair and exceptional quality.',
    story: 'Nusr-Et has become a global sensation, known for high-quality meat, unique preparation methods, and entertaining service. Every cut is carefully selected and aged to perfection.',
    menuType: 'visual',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2000',
      'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2000'
    ],
    minimumOrderAmount: 3000,
    orderDeadlineHours: 24,
    chefServicePrice: 1800,
    waiterServicePrice: 350,
    categories: ['Premium Cuts', 'Ottoman', 'Sides', 'Desserts'],
    menuItems: [
      {
        id: 'nusr-1',
        name: 'Golden Tomahawk',
        description: 'Wagyu, 24k gold leaf',
        price: 1800,
        category: 'Premium Cuts',
        weight: 1200
      },
      {
        id: 'nusr-2',
        name: 'Ottoman Steak',
        description: 'Signature thin sliced beef',
        price: 420,
        category: 'Ottoman',
        weight: 300
      },
      {
        id: 'nusr-3',
        name: 'Wagyu Striploin',
        description: 'Australian, grade 9+',
        price: 850,
        category: 'Premium Cuts',
        weight: 400
      },
      {
        id: 'nusr-4',
        name: 'Baklava',
        description: 'Traditional Turkish, pistachio',
        price: 85,
        category: 'Desserts',
        weight: 150
      }
    ]
  },
  {
    id: 'armani-ristorante',
    name: 'Armani/Ristorante',
    tagline: 'Italian Elegance at its Peak',
    tags: ['Italian', 'Fine Dining', 'Burj Khalifa'],
    description: 'Sophisticated Italian cuisine with breathtaking views, located in the iconic Burj Khalifa.',
    story: 'Armani/Ristorante reflects Giorgio Armani\'s aesthetic philosophy - understated elegance paired with exceptional quality. The menu showcases authentic Italian flavors with contemporary presentation.',
    menuType: 'both',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000',
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000'
    ],
    minimumOrderAmount: 3200,
    orderDeadlineHours: 48,
    chefServicePrice: 1900,
    waiterServicePrice: 380,
    tastingMenuDescription: 'Degustazione Menu - A celebration of Italian culinary artistry across 8 courses.\n\nAntipasti\nBuffalo mozzarella, heirloom tomatoes\n\nPrimo\nHomemade tagliolini, white truffle\n\nRisotto\nCarnaroli rice, saffron, ossobuco\n\nSecondo\nWagyu beef tenderloin, barolo reduction\n\nDolce\nTiramisu tradizionale\n\nPrice: AED 950 per person',
    categories: ['Antipasti', 'Pasta', 'Mains', 'Dolci'],
    menuItems: [
      {
        id: 'armani-1',
        name: 'Burrata di Andria',
        description: 'Cherry tomatoes, basil pesto',
        price: 115,
        category: 'Antipasti',
        weight: 180
      },
      {
        id: 'armani-2',
        name: 'Truffle Pasta',
        description: 'Fresh tagliolini, black truffle',
        price: 285,
        category: 'Pasta',
        weight: 250
      },
      {
        id: 'armani-3',
        name: 'Dover Sole',
        description: 'Grilled, lemon butter',
        price: 340,
        category: 'Mains',
        weight: 350
      },
      {
        id: 'armani-4',
        name: 'Panna Cotta',
        description: 'Berry compote, vanilla',
        price: 78,
        category: 'Dolci',
        weight: 120
      }
    ]
  },
  {
    id: 'tomo',
    name: 'TOMO',
    tagline: 'Authentic Japanese Kaiseki',
    tags: ['Japanese', 'Kaiseki', 'Traditional'],
    description: 'Traditional Japanese kaiseki dining experience with seasonal ingredients and meticulous preparation.',
    story: 'TOMO honors the centuries-old tradition of kaiseki cuisine, where each dish is a work of art showcasing seasonal ingredients prepared with precision and respect for Japanese culinary heritage.',
    menuType: 'tasting',
    coverImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=2000',
      'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=2000'
    ],
    minimumOrderAmount: 3800,
    orderDeadlineHours: 72,
    chefServicePrice: 2000,
    waiterServicePrice: 400,
    tastingMenuDescription: 'Omakase Kaiseki - 10-course seasonal journey following traditional Japanese culinary philosophy.\n\nSakizuke\nAppetizer setting the mood\n\nZensai\nAssorted seasonal delicacies\n\nOwan\nSeasonal soup with sea bream\n\nOtsukuri\nSelection of finest sashimi\n\nYakimono\nGrilled seasonal fish\n\nNimono\nBraised vegetables in dashi\n\nShokuji\nSeasonal rice dish\n\nMizumono\nSeasonal dessert\n\nPrice: AED 1,100 per person',
    categories: [],
    menuItems: []
  },
  {
    id: 'ninive',
    name: 'Ninive',
    tagline: 'Modern Middle Eastern Journey',
    tags: ['Middle Eastern', 'Lebanese', 'Contemporary'],
    description: 'Contemporary Middle Eastern cuisine celebrating the rich culinary heritage of the Levant with modern presentation.',
    story: 'Ninive takes diners on a journey through the flavors of ancient Mesopotamia, reimagining traditional Middle Eastern dishes with contemporary techniques while honoring authentic recipes.',
    menuType: 'visual',
    coverImage: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=2000',
    galleryImages: [
      'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=2000',
      'https://images.unsplash.com/photo-1514326640560-7d063f2aad85?q=80&w=2000'
    ],
    minimumOrderAmount: 2000,
    orderDeadlineHours: 36,
    chefServicePrice: 1300,
    waiterServicePrice: 260,
    categories: ['Cold Mezze', 'Hot Mezze', 'Grills', 'Desserts'],
    menuItems: [
      {
        id: 'ninive-1',
        name: 'Mezze Selection',
        description: 'Hummus, baba ghanoush, tabbouleh',
        price: 145,
        category: 'Cold Mezze',
        weight: 400
      },
      {
        id: 'ninive-2',
        name: 'Lamb Ouzi',
        description: 'Slow cooked, spiced rice, nuts',
        price: 265,
        category: 'Grills',
        weight: 350
      },
      {
        id: 'ninive-3',
        name: 'Mixed Grill Platter',
        description: 'Lamb, chicken, kafta',
        price: 320,
        category: 'Grills',
        weight: 600
      },
      {
        id: 'ninive-4',
        name: 'Knafeh',
        description: 'Sweet cheese, pistachio',
        price: 68,
        category: 'Desserts',
        weight: 180
      }
    ]
  }
]
