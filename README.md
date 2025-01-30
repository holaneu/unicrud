# CRUD app
## App Overview 
- **App Name:** Unicrud
- **App Description:** Unicrud is a simple CRUD-based application that allows users to create, edit, view, and delete items. It includes tag-based categorization, search functionality, and data import/export features, all stored in local storage.

## Core Functionality:

### Features:
- **Create, Read, Update, Delete (CRUD) Operations:** Users can add, edit, view, and delete items.
- **Tagging System:** Items can be categorized using tags.
- **Search and Sort:** Users can search for items and sort them based on name, creation date, or modification date.
- **Data Persistence:** All data is stored in the browser's local storage.
- **Data Import/Export:** Users can export their data as JSON and import it back when needed.

### User Actions (Stories)
**As a user** I want to:
- Create a new item with a name, content, and optional tags.
- Edit an existing item’s name, content, and tags.
- View the details of an item.
- Delete an item if I no longer need it.
- Search for an item by its name or content.
- Sort items by name, creation date, or modification date.
- Filter items based on tags.
- Export my data for backup or sharing.
- Import my data back into the application.

## App Layout and UI Elements

### **Home Screen:**  
- **Purpose:** Displays all items, allows searching, sorting, and navigating to add/edit/view screens.
- **Content:** List of items with their name and tags.
- **UI Elements**:
  - Search bar (`#search-input`)
  - Sort dropdown (`#sort-select`)
  - Tag filter dropdown (`#tag-select`)
  - Item list (`#item-list`)
  - "Add Item" button (`+ add` button)
- **Navigation:**  
  - Clicking an item navigates to the **View Item** screen.
  - Clicking the "Add" button navigates to the **Add Item** screen.
  - Clicking the settings button navigates to the **Settings** screen.

### **Add Item Screen:**  
- **Purpose:** Allows the user to create a new item.
- **Content:** Form fields for item name, tags, and content.
- **UI Elements**:
  - Name input (`#add-item-name`)
  - Tags input (`#add-item-tags`)
  - Content input (`#add-item-content`)
  - "Add Item" button to save the item
- **Navigation:**  
  - Clicking the back button navigates back to the **Home Screen**.

### **Edit Item Screen:**  
- **Purpose:** Allows users to edit an existing item.
- **Content:** Form fields populated with existing item data.
- **UI Elements**:
  - Name input (`#edit-item-name`)
  - Tags input (`#edit-item-tags`)
  - Content input (`#edit-item-content`)
  - "Save Item" button (`#edit-item-save-btn`)
- **Navigation:**  
  - Clicking the back button navigates back to the **Home Screen**.
  - Clicking "Save Item" updates the item and navigates to **View Item**.

### **View Item Screen:**  
- **Purpose:** Displays details of an item.
- **Content:** Shows the item's name, tags, and content.
- **UI Elements**:
  - Name display (`#view-item-name`)
  - Tags display (`#view-item-tags`)
  - Content display (`#view-item-content`)
  - "Edit" button (`.edit-btn`)
  - "Delete" button (`.delete-btn`)
- **Navigation:**  
  - Clicking "Edit" navigates to the **Edit Item** screen.
  - Clicking "Delete" removes the item and navigates back to **Home Screen**.

### **Settings Screen:**  
- **Purpose:** Provides options for data management.
- **Content:** Options for exporting and importing data.
- **UI Elements**:
  - "Export Data" button (`storage.exportData()`)
  - "Import Data" button (`storage.importData()`)
- **Navigation:**  
  - Clicking the back button navigates back to the **Home Screen**.

## Navigation Flow  
- **Home Screen** → **Add Item Screen** → **Home Screen**  
- **Home Screen** → **View Item Screen** → **Edit Item Screen** → **View Item Screen** → **Home Screen**  
- **Home Screen** → **Settings Screen** → **Home Screen**  

## Design and Style  
- **Minimalist UI:** The app follows a clean, modern, and user-friendly design with a simple layout.  
- **Consistent Color Palette:** Uses neutral colors with accent buttons for actions.  
- **Typography:** Clear, readable fonts ensuring accessibility.  
- **Spacing & Alignment:** Proper margins and padding for a structured layout.  
- **Button Design:** Clear call-to-action buttons with primary and secondary styles.  
- **Icons & Visual Cues:** Icons for actions like edit, delete, and navigation enhance usability.  
- **Responsiveness:** The app is designed to work across different screen sizes and resolutions.  

## Technical Specifications  
- **Frontend:** HTML, CSS, JavaScript (Vanilla JS)  
- **Storage:** LocalStorage (Persists data in the browser)  
- **Navigation:** SPA (Single Page Application) approach using JavaScript to handle screen transitions  
- **Data Handling:** CRUD operations managed with LocalStorage and JSON parsing  
- **Sorting & Filtering:** Dynamic search, sorting by name/date, and tag-based filtering  
- **Import/Export:** Data can be exported as JSON and imported back for backup/restore  
- **Event Handling:** Uses event listeners for UI interactions such as form submissions and navigation  
- **Modular Code Structure:** JavaScript is split into modules for storage, UI, navigation, and item management  
- **Security Considerations:** No external data exposure, but user data persistence relies on browser storage without encryption
