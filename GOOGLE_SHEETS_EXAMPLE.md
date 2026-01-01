# Google Sheets Import - Column Structure Example

## Required Columns (Must Be Filled)

- **Column A:** Item Name (English) - e.g., "Grilled Sea Bass"
- **Column C:** Price - e.g., "125" or "$125" or "125.50"

## Optional English Columns

- **Column B:** Description (English) - e.g., "Fresh Mediterranean sea bass with lemon and herbs"
- **Column D:** Category (English) - e.g., "Main Courses" or "Appetizers"
- **Column E:** Weight - e.g., "350" (in grams)
- **Column F:** Image URL - e.g., "https://example.com/images/seabass.jpg"

## Optional Russian Columns (Translations)

- **Column G:** Item Name (Russian) - e.g., "Морской окунь на гриле"
- **Column H:** Description (Russian) - e.g., "Свежий средиземноморский морской окунь с лемоном и травами"
- **Column I:** Category (Russian) - e.g., "Основные блюда"

## Example Spreadsheet Layout

### Header Row (Optional - Row 1)

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Item Name (EN) | Description (EN) | Price | Category (EN) | Weight | Image URL | Item Name (RU) | Description (RU) | Category (RU) |

### Data Rows (Start from Row 2)

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Grilled Sea Bass | Fresh Mediterranean sea bass with lemon and herbs | 125 | Main Courses | 350 | https://example.com/seabass.jpg | Морской окунь на гриле | Свежий средиземноморский морской окунь с лемоном и травами | Основные блюда |
| Caesar Salad | Classic Caesar salad with parmesan and croutons | 45 | Appetizers | 200 | https://example.com/caesar.jpg | Салат Цезарь | Классический салат Цезарь с пармезаном и гренками | Закуски |
| Tiramisu | Traditional Italian dessert with mascarpone | 35 | Desserts | 150 | https://example.com/tiramisu.jpg | Тирамису | Традиционный итальянский десерт с маскарпоне | Десерты |

## Important Notes

1. **Columns B and D are specifically for ENGLISH text**, not a generic description/category that could be in any language
2. **Columns H and I are specifically for RUSSIAN translations** of the English text from columns B and D
3. If you don't provide Russian translations (columns G, H, I), the site will only show English text
4. The first row can be headers - the import will automatically detect and skip it
5. Empty rows are automatically skipped
6. Price can include currency symbols ($, Dh, etc.) - they will be stripped automatically
7. Image URLs must be complete and start with `http://` or `https://`
8. Weight should be in grams - any non-numeric characters will be removed

## Multiple Sheets = Multiple Restaurants

Each sheet in your Google Spreadsheet represents ONE restaurant. The sheet name becomes the restaurant name.

**Example:**
- Sheet 1: "La Bella Vista" → Restaurant name: "La Bella Vista"
- Sheet 2: "Sakura Sushi" → Restaurant name: "Sakura Sushi"
- Sheet 3: "The Burger Joint" → Restaurant name: "The Burger Joint"

## Minimal Valid Example (Only Required Fields)

If you want to import quickly with minimal data:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Item Name | | Price | | | | | | |
| Margherita Pizza | | 55 | | | | | | |
| Spaghetti Carbonara | | 65 | | | | | | |
| Tiramisu | | 35 | | | | | | |

This will import 3 items with just names and prices. All optional fields will be empty.

## Full Example with All Fields

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Item Name | Description | Price | Category | Weight | Image | Название | Описание | Категория |
| Wagyu Steak | Premium Japanese wagyu beef grilled to perfection | 250 | Main Courses | 400 | https://cdn.example.com/wagyu.jpg | Стейк Вагю | Премиальная японская говядина вагю, приготовленная на гриле | Основные блюда |
| Truffle Risotto | Creamy Italian risotto with black truffle | 125 | Main Courses | 320 | https://cdn.example.com/risotto.jpg | Ризотто с трюфелем | Сливочное итальянское ризотто с черным трюфелем | Основные блюда |
| Caprese Salad | Fresh mozzarella, tomatoes and basil | 45 | Appetizers | 200 | https://cdn.example.com/caprese.jpg | Салат Капрезе | Свежая моцарелла, помидоры и базилик | Закуски |

This will import 3 items with complete information in both English and Russian.
