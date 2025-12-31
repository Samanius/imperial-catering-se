# Bilingual Menu Import Guide

## Google Sheets Column Structure

The Google Sheets import now supports bilingual content (English and Russian). Each sheet in your Google Spreadsheet represents one restaurant.

### Column Layout

| Column | Field | Description | Required |
|--------|-------|-------------|----------|
| **A** | Item Name (English) | Menu item name in English | ✅ Yes |
| **B** | Description (English) | Item description in English | Optional |
| **C** | Price | Item price (numbers only) | ✅ Yes |
| **D** | Category (English) | Category name in English | Optional |
| **E** | Weight | Item weight in grams | Optional |
| **F** | Image URL | Full URL to item image | Optional |
| **G** | Item Name (Russian) | Menu item name in Russian | Optional |
| **H** | Description (Russian) | Item description in Russian | Optional |
| **I** | Category (Russian) | Category name in Russian | Optional |

### Example Row

```
A: Grilled Sea Bass
B: Fresh Mediterranean sea bass with lemon and herbs
C: 125
D: Main Courses
E: 350
F: https://example.com/images/seabass.jpg
G: Морской окунь на гриле
H: Свежий средиземноморский морской окунь с лемоном и травами
I: Основные блюда
```

### Important Notes

1. **Columns A and C are required** - Item Name (English) and Price must be filled for each item
2. **Russian translations are optional** - If not provided, only English will be displayed
3. **First row can be headers** - The import automatically skips header rows
4. **Empty rows are ignored** - You can use them to organize your menu
5. **Image URLs must be complete** - Must start with `http://` or `https://`
6. **Price format** - Can include currency symbols ($, Dh, etc.) - they will be stripped automatically
7. **Weight** - Should be in grams, any non-numeric characters will be removed

### Language Switching

Users can switch between English and Russian using the language switcher in the header (globe icon with language code). The selected language persists between sessions.

When Russian translations are available:
- Restaurant names, taglines, descriptions, and stories show in Russian
- Menu item names, descriptions, and categories show in Russian
- All UI elements (buttons, labels) display in Russian

When Russian translations are not available:
- Falls back to English content
- Ensures nothing appears blank

### Column Headers (Optional)

If you want to add headers to your spreadsheet for clarity, use row 1:

```
A: Item Name
B: Description  
C: Price
D: Category
E: Weight (g)
F: Image URL
G: Название (RU)
H: Описание (RU)
I: Категория (RU)
```

The import will automatically detect and skip this header row.
