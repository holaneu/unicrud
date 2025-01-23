# Changelog

All notable changes to this project will be documented in this file.

## [0.0.6] - 2024-01-10

### Added
- Clear button functionality for input fields
  - Shows only when input contains text
  - Clears input on click
  - Preserves focus after clearing
  - Proper event handling for search updates
- Memory efficient event listener management for input clear buttons
  - WeakMap storage for listeners
  - Cleanup of old listeners before adding new ones
  - Prevention of listener duplication


## [0.0.5] - 2024-01-08

### Added
- Settings screen accessible via gear icon in top navigation
- Data export functionality allowing users to save their data as JSON file
- Data import functionality with conflict resolution for duplicate items
- Improved icon button styling with consistent spacing and hover effects


## [0.0.4] - 2024-01-07

### Refactored
- Reorganized JavaScript into logical modules:
  - `storage` - Local storage operations
  - `uiComponents` - UI rendering components
  - `utils` - Common utility functions
  - `navigation` - Screen management
  - `itemManager` - CRUD operations
  - `listManager` - List rendering and filtering
  - `tagManager` - Tag operations and UI

### Changed
- Updated HTML onclick handlers to use module-based method calls
  - Changed `navigateToScreen()` to `navigation.toScreen()`
  - Changed `createItem()` to `itemManager.create()`
  - Removed redundant onclick handlers from edit/delete buttons
- Improved code maintainability through structured organization
- Enhanced function reusability via modular grouping
- Reduced global namespace pollution



## [0.0.3] - 2024-01-03

### Refactored
- Reorganized code structure for better maintainability (see DEVELOPMENT.md)
  - Created structured configuration system
    - Split app configurations into `appConfigs` and `uiConfigs`
    - Moved storage keys into `appConfigs.storage` namespace
    - Centralized UI labels and messages in `uiConfigs.labels`
  - Added DOM element organization
    - Created `domElements` object to group element selectors by screen
    - Implemented getter functions for DOM elements to ensure fresh retrieval
    - Organized selectors into logical groups (home, add, edit, view)
  - Added global state management
    - Created `state` object to manage application state
    - Moved global variables into structured state object
  
### Changed
- Updated all functions to use new configuration and DOM structures
- Improved error message handling through centralized UI labels
- Enhanced tag input configuration with dedicated settings in uiConfigs
- Streamlined screen navigation with new DOM element references

### Technical Debt
- Removed hard-coded strings in favor of configuration objects
- Improved code maintainability through structured organization
- Reduced selector duplication across codebase



## [0.0.2] - 2024-12-20

### Added
- Interactive tag management system with modern UI/UX
  - Visual tag pills with remove buttons
  - Tag suggestions dropdown
  - Auto-complete for existing tags
  - Keyboard navigation support (Enter, Comma, Backspace)
  - Focus-based tag suggestions
  - Prevention of duplicate tags

### Changed
- Replaced simple comma-separated tag input with interactive component
- Enhanced tag input UX in both Add and Edit screens
- Improved tag suggestions visibility - now shows on input focus
- Modernized tag display with pill-style visual design

### Technical
- Added tag input component initialization system
- Implemented proper cleanup for tag input components
- Added state management for current tag input instance
- Enhanced error handling for tag-related operations



## [0.0.1] - 2024-12-19

- **View Screen Enhancements:**
  - Added edit and delete icon buttons to the top-right corner of the navigation bar.
  - Adjusted icon size to `24x24px`, removed background color, and applied text-like color `#e0e0e0`.
  - Implemented opacity hover effect for icons.
  - Correctly aligned icons with back button using margins and padding.
  - Added `margin-bottom` to the top navigation bar for better spacing.

- **JavaScript Functionality Updates:**
  - Added navigation to edit screen when clicking the edit button.
  - Implemented save functionality to return to the view screen after edits.
  - Included delete confirmation prompt before deletion.
  - Adjusted edit screen's back button to return to the view screen instead of the list.
