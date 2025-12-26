# Google Sheets Import Setup Guide

This application allows you to import restaurant menus from Google Sheets. This guide will help you set up the Google Sheets API key and structure your spreadsheet correctly.

## 🔑 Step 1: Get Your Google Sheets API Key

### Create API Key in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name like "Imperial Delicious Menu"

3. **Enable Google Sheets API**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key (starts with "AIza...")
   - **Important**: Click "Restrict Key" to secure it:
     - Under "API restrictions", select "Restrict key"
     - Choose "Google Sheets API" from the dropdown
     - Click "Save"

5. **Store Your API Key**
   - Go to the Admin Panel in your application
   - Click "Import from Google Sheets"
   - Paste your API key in the "Google Sheets API Key" field
   - The key will be saved securely for future imports

---

## 📊 Step 2: Structure Your Google Spreadsheet

### Basic Structure

- **Each sheet tab = One restaurant**
- **Sheet name = Restaurant name**
- **First row = Headers (optional, will be skipped automatically)**

### Required Columns

Your spreadsheet must have these columns in this exact order:

| Column | Name | Required | Format | Example |
|--------|------|----------|--------|---------|
| A | Item Name | ✅ Yes | Text | "Grilled Salmon" |
| B | Description | ⭕ Optional | Text | "Fresh Atlantic salmon with herbs" |
| C | Price | ✅ Yes | Number | 45 or $45 or 45.00 |
| D | Category | ⭕ Optional | Text | "Main Course" |
| E | Weight | ⭕ Optional | Number (grams) | 300 or 300g |
| F | Image URL | ⭕ Optional | URL | https://example.com/image.jpg |

### Example Spreadsheet Structure

**Sheet Tab Name: "Le Bernardin"**

| Item Name | Description | Price | Category | Weight | Image URL |
|-----------|-------------|-------|----------|--------|-----------|
| Tuna Tartare | Yellowfin tuna with avocado | $32 | Appetizers | 150 | https://example.com/tuna.jpg |
| Lobster Bisque | Creamy lobster soup | 28 | Soups | 250 | https://example.com/bisque.jpg |
| Grilled Salmon | Atlantic salmon with herbs | 45 | Main Course | 300 | https://example.com/salmon.jpg |

**Sheet Tab Name: "Nobu"**

| Item Name | Description | Price | Category | Weight | Image URL |
|-----------|-------------|-------|----------|--------|-----------|
| Black Cod Miso | Marinated in sweet miso | 48 | Signature | 250 | https://example.com/cod.jpg |
| Yellowtail Jalapeño | Thinly sliced with ponzu | 26 | Appetizers | 120 | |

---

## 📋 Important Rules

### ✅ What Works

- **Empty rows** - Automatically skipped
- **Missing optional fields** - OK, will be left empty
- **Header row** - First row is automatically detected and skipped if it contains text like "Item Name", "Name", or "Item"
- **Price formats**: `25`, `$25`, `25.00`, `$25.50` - All work fine
- **Weight formats**: `300`, `300g`, `300 g` - All work fine
- **Multiple sheets** - Import as many restaurants as you want at once

### ❌ What Doesn't Work

- **Missing Item Name (Column A)** - Row will be skipped with error
- **Missing Price (Column C)** - Row will be skipped with error
- **Invalid prices** - Text in price column (except $ sign)
- **Invalid image URLs** - Must start with `http://` or `https://`
- **Wrong column order** - Columns must be in the order shown above

---

## 🔄 Step 3: Import Your Data

### Make Your Spreadsheet Public

1. Open your Google Sheet
2. Click "Share" (top right)
3. Click "Change to anyone with the link"
4. Set to "Viewer" access
5. Click "Done"
6. Copy the spreadsheet URL from your browser

### Import Process

1. **Go to Admin Panel** in your application
2. **Click "Import from Google Sheets"**
3. **Enter your API Key** (if not already saved)
4. **Paste your spreadsheet URL**
5. **Click "Import Data"**

### What Happens During Import

- **New restaurants**: Created with all menu items
- **Existing restaurants**: Updated with new items, existing items updated if prices/details changed
- **Automatic backup**: All changes are backed up before import
- **Error reporting**: Detailed console logs show any issues

---

## 🐛 Troubleshooting

### Error: "API key not valid"

**Solution**: 
- Verify your API key is correct
- Make sure Google Sheets API is enabled in Google Cloud Console
- Check that API key restrictions allow Google Sheets API

### Error: "Failed to fetch spreadsheet"

**Solution**:
- Make sure spreadsheet is shared as "Anyone with the link can view"
- Verify the URL is correct
- Check your internet connection

### Error: "No valid menu items found"

**Solution**:
- Check that Column A has item names
- Check that Column C has valid prices (numbers)
- Make sure you have at least one data row (besides headers)

### Items are skipped

**Solution**:
- Check browser console (F12) for detailed error messages
- Verify required fields (Item Name, Price) are filled
- Check price format (must be a number, $ signs are OK)

### Import says "No changes detected"

**Explanation**: This means:
- Restaurant already exists
- All menu items are identical to what's already saved
- No new items found in the sheet

**Solution**: This is normal if nothing has changed. Add new items or modify existing ones to see updates.

---

## 💡 Tips for Best Results

1. **Use clear, descriptive names** for sheet tabs (restaurant names)
2. **Keep price formats consistent** (either all with $ or all without)
3. **Test with one restaurant first** before importing many
4. **Review console logs** (F12) to see what was imported
5. **Check the Backups tab** to see change history
6. **Use high-quality image URLs** that won't expire
7. **Add categories** to organize menu sections nicely

---

## 📞 Getting Help

If you encounter issues:

1. **Open browser console** (Press F12)
2. **Click the "Console" tab**
3. **Look for detailed error messages** with specific row numbers
4. **Check the error dialog** that appears after failed import
5. **Copy error details** to troubleshoot

The system provides detailed feedback about:
- Which rows were processed successfully
- Which rows were skipped and why
- What changes were made to each restaurant
- Total number of items imported

---

## 🔒 Security Notes

- Your API key is stored securely in browser storage
- API key is only used for importing data
- Spreadsheet must be public (view-only is fine)
- No data is sent to external servers except Google Sheets API
- All imports are logged in the Backups tab for audit trail
