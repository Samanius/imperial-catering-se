# Planning Guide

A luxury yacht catering platform that connects discerning clients with exclusive restaurants, embodying the refined elegance of Old Money and Quiet Luxury through sophisticated design and seamless ordering experience.

**Experience Qualities**: 
1. **Understated Elegance** - Every element exudes quiet sophistication without ostentation, letting quality speak for itself
2. **Effortless Refinement** - Interactions feel natural and intuitive, as if guided by an invisible concierge
3. **Timeless Serenity** - The design creates a calm, unhurried atmosphere that feels both classic and contemporary

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This platform requires restaurant management, menu systems (both visual and PDF), administrative controls, shopping cart functionality, order composition, and WhatsApp integration - demanding a sophisticated multi-view architecture.

## Essential Features

**Restaurant Catalog (The Marina)**
- Functionality: Browse curated collection of exclusive restaurants with filtering capabilities
- Purpose: Create desire through storytelling and atmosphere rather than transactional browsing
- Trigger: User lands on homepage or navigates from header
- Progression: Hero video loads → User scrolls to masonry grid → Hovers over restaurant card → Photo zooms subtly → "Explore Menu" button fades in → Clicks to enter restaurant
- Success criteria: Smooth animations, elegant card interactions, zero visual clutter, images load progressively

**Restaurant Detail & Menu Display**
- Functionality: Present restaurant story with dual menu system (visual catalog or elegant PDF-style)
- Purpose: Differentiate premium tasting menus from à la carte ordering while maintaining sophistication
- Trigger: User clicks "Explore Menu" from catalog
- Progression: Page loads with hero slider → User reads restaurant story → Toggles between "A la Carte" and "Chef's Tasting Menu" → Views appropriate menu format → Interacts with items
- Success criteria: Seamless tab switching, elegant typography hierarchy, slider performs smoothly

**Visual Menu Ordering (A la Carte)**
- Functionality: Browse dishes with high-quality photos, add items to cart with quantity control
- Purpose: Allow precise selection for restaurants where visual presentation matters
- Trigger: User selects "A la Carte" tab on restaurant page
- Progression: Grid displays → User hovers over dish → Add button appears → Clicks to add → Counter appears for quantity adjustment → Running total updates
- Success criteria: Butter-smooth hover states, instant cart updates, persistent cart across navigation

**PDF-Style Premium Menu**
- Functionality: Display elegant text-based menu mimicking fine dining paper menu experience
- Purpose: Convey exclusivity for tasting menus and high-end offerings without transactional elements
- Trigger: User selects "Chef's Tasting Menu" tab
- Progression: Virtual paper menu displays with linen texture → User scrolls through sections → Reads descriptions → Clicks sticky "Concierge Order" bar → Form opens for custom request
- Success criteria: Typography feels like printed menu, scrolling is smooth, texture is subtle

**Shopping Cart & Order Summary**
- Functionality: Accumulate selected items, show running total, allow modifications
- Purpose: Provide clarity on order before submission while maintaining elegant aesthetic
- Trigger: User adds first item or clicks cart icon
- Progression: Item added → Cart count badge updates → User clicks cart → Drawer slides open → Shows itemized list → User adjusts quantities → Reviews total → Proceeds to checkout
- Success criteria: Cart persists across sessions, calculations are instant, drawer animation is fluid

**WhatsApp Order Submission**
- Functionality: Compose formatted order message and send via WhatsApp to +971 52 835 5939
- Purpose: Complete transaction through personal communication channel preferred by luxury clientele
- Trigger: User clicks "Send Order" from cart
- Progression: User reviews final order → Clicks send → WhatsApp opens with pre-formatted message containing restaurant names, items, quantities, total → User sends message
- Success criteria: Message is perfectly formatted, includes all details, opens WhatsApp correctly on all devices

**Admin Panel (Concierge Dashboard)**
- Functionality: Add/edit/delete restaurants, manage menu items, upload images, set menu types
- Purpose: Allow platform owner to curate restaurant collection without technical knowledge
- Trigger: Owner navigates to /admin (protected by password or owner check)
- Progression: Login verification → Dashboard displays → Owner selects restaurant or creates new → Fills form with details → Uploads images → Adds menu items or PDF info → Saves → Content appears on public site
- Success criteria: All fields save correctly, images upload smoothly, changes reflect immediately, interface remains elegant

## Edge Case Handling

**Empty States** - Show elegant prompts: empty cart displays "Your voyage begins here", no restaurants shows "Curated experiences arriving soon"

**Image Loading** - Progressive blur-up loading with skeleton screens in brand colors, never broken image icons

**Mobile Experience** - Masonry grid becomes single column, hero videos replaced with static images, sticky elements adjust appropriately

**WhatsApp Unavailable** - Fallback to mailto or display formatted order for manual copying

**Concierge Order Form** - Handle free-text input gracefully, validate minimum message length, provide elegant character count

**Cart Persistence** - Cart saves to KV storage, survives page refresh, shows gentle notification if items were restored

**Menu Type Switching** - Smooth tab transition, preserve scroll position where logical, cart items specific to visual menu only

## Design Direction

The design should evoke the feeling of stepping aboard a pristine yacht - where every detail is considered, nothing is rushed, and quality is assumed rather than announced. Think warm candlelight on polished teak, crisp linen napkins, the subtle clink of crystal, and the quiet confidence of true luxury that never needs to prove itself.

## Color Selection

A sophisticated nautical palette grounded in timeless materials - navy depths, sun-bleached canvas, and whispers of precious metals.

- **Primary Color**: Deep Navy (oklch(0.25 0.05 250)) - Evokes maritime heritage and understated authority, used for key text and primary actions
- **Secondary Colors**: 
  - Cream/Eggshell (oklch(0.96 0.01 85)) - Main background, suggesting sailcloth and fine linen
  - Charcoal (oklch(0.35 0.01 250)) - Secondary text, subtle depth without harshness
- **Accent Color**: Champagne Gold (oklch(0.75 0.08 85)) - Sparingly used for delicate borders, hover states, and premium indicators
- **Foreground/Background Pairings**: 
  - Deep Navy on Cream (oklch(0.25 0.05 250) on oklch(0.96 0.01 85)) - Ratio 10.2:1 ✓
  - Charcoal on Cream (oklch(0.35 0.01 250) on oklch(0.96 0.01 85)) - Ratio 6.8:1 ✓
  - Cream on Deep Navy (oklch(0.96 0.01 85) on oklch(0.25 0.05 250)) - Ratio 10.2:1 ✓
  - Champagne Gold (oklch(0.75 0.08 85)) for accents only, not critical text

## Font Selection

Typography should whisper elegance - Bodoni's dramatic contrast for moments of impact, paired with Montserrat's geometric clarity for effortless reading.

- **Typographic Hierarchy**: 
  - H1 (Hero Headlines): Bodoni Moda Bold/56px/tight leading/wide letter spacing - Commands attention with Old Money gravitas
  - H2 (Restaurant Names): Bodoni Moda Semibold/36px/tight leading - Elegant but approachable
  - H3 (Section Headers): Bodoni Moda Medium/24px/normal leading - Structured sophistication
  - Body (Descriptions): Montserrat Regular/16px/relaxed leading (1.7) - Maximum readability
  - Small (Tags, Metadata): Montserrat Light/13px/normal leading/tracked - Delicate details
  - Prices: Montserrat Medium/18px - Clear without being crass

## Animations

Animations should feel like the gentle motion of a yacht at anchor - present but never jarring, purposeful but never performative. Use subtle zoom-ins on images (1.05x scale over 800ms ease-out), fade-ins for elements (300ms), smooth drawer slides (400ms cubic-bezier), and delicate hover elevations. Every movement should feel weighted and considered, never snappy or mechanical.

## Component Selection

**Components**: 
- Dialog - Admin forms and concierge order composition
- Drawer - Shopping cart sidebar
- Card - Restaurant and menu item presentation  
- Tabs - Menu type switching (A la Carte / Tasting Menu)
- Button - Primary actions with ghost variants for subtlety
- Input/Textarea - Admin panel and concierge forms
- Label - Form field identification
- Separator - Delicate gold dividing lines
- Badge - Cart count indicator
- Scroll Area - Menu item lists

**Customizations**: 
- Custom masonry grid layout for restaurant catalog
- Custom video hero component with overlay gradients
- Custom "paper menu" component with linen texture for PDF-style display
- Custom sticky concierge bar for tasting menu ordering
- Hover-reveal add buttons that fade in elegantly
- Custom WhatsApp integration button

**States**: 
- Buttons have subtle gold underline on hover, no background color change
- Cards lift 2px with soft shadow on hover
- Images zoom 1.05x on hover over 800ms
- Active tabs show delicate gold bottom border
- Inputs show gold ring on focus

**Icon Selection**: 
- Plus/Minus - For quantity controls (delicate weight)
- ShoppingBag - For cart (sophisticated, not cartoon)
- X - For removal and closing
- UserCircle - For admin access
- ArrowRight - For navigation hints
- WhatsApp logo - For order submission

**Spacing**: 
- Generous white space throughout: sections separated by 96px (24 spacing units)
- Cards have 32px internal padding
- Grid gaps of 24px for visual breathing room
- Text line height of 1.7 for body copy

**Mobile**: 
- Masonry becomes single column with full-width cards
- Hero reduces to 50vh with static image
- Tabs become full-width buttons
- Sticky cart button floats at bottom
- Touch targets minimum 48px
- Drawer becomes full-screen on mobile
- Admin panel stacks form fields vertically
