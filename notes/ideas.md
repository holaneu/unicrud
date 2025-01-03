# IDEAS


-----

Refactor the code:
- organize configurations and UI elements into logical groups for better structure and maintainability.
  - Group Configurations:
    - Identify configurations that serve similar purposes (e.g., app-wide settings, UI-related settings) and encapsulate them in separate objects.
    - Use descriptive object names to convey their purpose clearly (e.g., appConfigs for app-related settings, uiConfigs for UI-specific configurations).
  - Group DOM Element References:
    - Organize DOM element references into objects based on their functional or visual groupings (e.g., editor, flashcards, history, etc.).
    - Use nested objects to further group related elements under a common parent key.

- organize related standalone functions into logical groups for better structure and maintainability.
  - Analyze Existing Functions:
    - Review all standalone functions in the codebase.
    - Identify logical relationships or shared purposes among these functions.
  - Design Appropriate Groups:
    - Create meaningful and relevant groups based on the functionality, such as grouping related functions into objects that represent a specific module, feature, or utility.
  - Encapsulate Functions in Objects:
    - Wrap related functions into named objects using ES6 shorthand method definition syntax.
    - Ensure the grouping improves code organization and readability.
  - Refactor Function Calls:
    - Update all function calls to reference the new object-based structure.
    - For example, change calls from someFunction() to groupName.someFunction().
  - Follow Consistent Naming Conventions:
    - Use clear and descriptive object names that reflect the purpose of the grouped functions.
    - Ensure function names within each group are concise and relevant.

  - use vanilla js only. Dont use .ts and modules as files. Do this refactoring only within the app.js and index.html files. 
  - Note: Why I use vanilla js for my SPA web app - the app has to be:
    - possible to run the app locally from a file:/// URL, without any server on most devices (desktop, mobile phones etc.).
    - I dont want to use any framework, react, typescript etc. I just want the app to use the pure javascript.
    - Also I dont want to use any techniques leading to any issues / errors when running localy (errors like CORS related etc.).
-----

tags UX:

i need to improve the ux of how users add and edit tags within veiw item and add item. Now user can only write tags separated by a comma. Suggest me some improvements, be inspired by the world best solutions and common best practice for good tags maangemetn UI

the goal is to make it easier for users to add and edit tags within veiw item and add item.

My suggestions are:

- when user focus or start writin to the input suggestions of already existing tags appers
- when user clicks on some of suggested tags and tag is added, also it disappers from a suggestion list
- added tag has a small svg cross icon which allows to remove a tag. When tag is removed it appears again in a suggestion list
- added tag is visualy represented by a rectangle with rounded corners, text inside, and a small svg cross icon on the right side 
- user can add new tag, which is not in a suggestion list, by typing a new tag name and if no tag with such name exists, in the suggestion list above the existing tags, there appears such tag and button "add as new tag" 

But if you find some better solutions, please suggest them.
