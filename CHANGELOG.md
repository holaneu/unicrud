# CHANGELOG

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



