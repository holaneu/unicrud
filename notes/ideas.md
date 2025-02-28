# IDEAS

## automated testing
- use ai to write test scenarios
- use ai to write a python sellenium script runing the sequence of testing scenarios

-----

## status messages
- item added
- item updated
- data imported

-----

## better tags UX:

I need to improve the ux of how users add and edit tags within veiw item and add item screen. 
I need to review and update the current code, see bellow my suggestions of how it should work. 
Make a code as simple and straight-forward as possible.

My suggestions:
- the tags UI element has the same border and background style as name/title input field.

- the tags UI element consists of these parts (divs):
  - **tag-list**: 
    - This part shows already added tags.
    - Added tag is visualy represented by a rectangle with rounded corners, text inside, and a small svg cross icon on the right side.
    - If there is no tag added yet, this part is not visible for users.
    - When some tag is added, it disappears from a tag-suggestions list.
    - When user clicks on a small svg cross icon it removes the tag from tag-list.
    - When tag is removed from tag-list it appears again in a tag-suggestions list.
  - **tag-input**:
    - This part users can use to add tags - they can click into it and start writing.
  - **tag-suggestions**:
    - This part becomes visible immediately when user clicks to the tag-input. 
    - It disappers when user clicks outside of the tag-input or tag-suggestions. 
    - It contains the full list of all available tags sorted alphabetically within the scrollable UI element
    - Only 5 rows of tags are visible, to see more tags user needs to scroll it.
    - Tags already added are not shown in the list.
    - When user clicks on some of suggested tags, the tag is added and it disappers from a tag-suggestions list. tag-suggestions UI element remains visible as user can continue selecting and adding more tags from a list.
    - User can start writing, then the tag-suggestions list is filtered (searched) accordingly.
    - User also can add tag which is not existing yet - as the last row of visible rows in the tag-suggestions list (fifth row) there is a special item which contains text what user has written yet into the tag-input (it is real-time updated when user writes). When user clicks this item (row), it creates a brand new tag from the text and adds it to the tag-list.
    - important: users can add tags only selecting them from a tag-suggestions list.


