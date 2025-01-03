// App configurations
const appConfigs = {
  app_id: "unicrud",
  app_name: "Unicrud",
  storage: {
    test_key: "unicrud_test",
    get data_key() { return appConfigs.app_id + "_data"; },
    get settings_key() { return appConfigs.app_id + "_settings"; },
    get user_profile_key() { return appConfigs.app_id + "_user_profile"; }
  }
};

// UI-related configurations
const uiConfigs = {
  labels: {
    not_saved_doc: "untitled document",
    empty_name_error: "Item name cannot be empty",
    item_not_found: "Item not found!",
    delete_confirm: "Do you really want to delete this item?",
    update_success: "Item updated successfully!"
  },
  tagInput: {
    maxSuggestions: 5,
    placeholder: "Type tag and press Enter or comma"
  },
  screens: {
    home: "home-screen",
    add: "add-item-screen",
    edit: "edit-item-screen",
    view: "view-item-screen"
  }
};

// DOM element references organized by screen
const domElements = {
  home: {
    screen: () => document.getElementById(uiConfigs.screens.home),
    searchInput: () => document.getElementById('search-input'),
    sortSelect: () => document.getElementById('sort-select'),
    tagSelect: () => document.getElementById('tag-select'),
    itemList: () => document.getElementById('item-list')
  },
  add: {
    screen: () => document.getElementById(uiConfigs.screens.add),
    nameInput: () => document.querySelector('#add-item-screen #add-item-name'),
    contentInput: () => document.querySelector('#add-item-screen #add-item-content'),
    tagsInput: () => document.querySelector('#add-item-screen #add-item-tags')
  },
  edit: {
    screen: () => document.getElementById(uiConfigs.screens.edit),
    nameInput: () => document.querySelector('#edit-item-screen #edit-item-name'),
    contentInput: () => document.querySelector('#edit-item-screen #edit-item-content'),
    tagsInput: () => document.querySelector('#edit-item-screen #edit-item-tags'),
    saveButton: () => document.querySelector('#edit-item-screen #edit-item-save-btn'),
    backButton: () => document.querySelector('#edit-item-screen .back-btn')
  },
  view: {
    screen: () => document.getElementById(uiConfigs.screens.view),
    screenTitle: () => document.querySelector('#view-item-screen .screen-title'),
    nameField: () => document.querySelector('#view-item-screen #view-item-name'),
    tagsField: () => document.querySelector('#view-item-screen #view-item-tags'),
    contentField: () => document.querySelector('#view-item-screen #view-item-content'),
    editButton: () => document.querySelector('#view-item-screen .edit-btn'),
    deleteButton: () => document.querySelector('#view-item-screen .delete-btn')
  }
};

// Storage service
const db = {
  getData: function() {
    const data = localStorage.getItem(appConfigs.storage.data_key);
    return data ? JSON.parse(data) : [];
  },
  saveData: function(items) {
    localStorage.setItem(appConfigs.storage.data_key, JSON.stringify(items));
  },
  addDataItem: function(item) {
    const items = this.getData();
    items.push(item);
    this.saveData(items);
  },
  deleteDataItem: function(itemId) {
    let items = this.getData();
    items = items.filter(item => item.id !== itemId);
    this.saveData(items);
  },
  updateDataItem: function(updatedItem) {
    let items = this.getData();
    items = items.map(item => item.id === updatedItem.id ? updatedItem : item);
    this.saveData(items);
  },
  clearData: function(){
    localStorage.setItem(appConfigs.storage.data_key, "");
  }
};

// Global state
const state = {
  currentSelectedTag: "",
  currentTagInput: null
};

// Event listeners for UI elements
domElements.home.searchInput().addEventListener('input', renderItems);
domElements.home.sortSelect().addEventListener('change', renderItems);
domElements.home.tagSelect().addEventListener('change', (event) => {
  state.currentSelectedTag = event.target.value; // Update global state
  renderItems();
});

// Components
function renderItemCard(id, name, tags) {
  return `
    <div class="card-item" data-id="${id}" onclick="viewItem('${id}')">
      <div class="card-content">
        <span class="card-title">${name}</span>
        <span class="card-badge">${tags.join(', ')}</span>
      </div>
    </div>
  `;
}

// Functions
function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

function navigateToScreen(screenId) {
  // Clean up any existing tag inputs
  cleanupTagInputs();
  
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.add('hidden'));
  
  // Show target screen
  const targetScreen = document.getElementById(screenId);
  targetScreen.classList.remove('hidden');
  
  // Initialize tag inputs for the new screen if needed
  if (screenId === uiConfigs.screens.add) {
    state.currentTagInput = initializeTagInput(domElements.add.tagsInput());
  }
}

function renderItems() {
  const searchQuery = domElements.home.searchInput().value.toLowerCase();
  const sortCriteria = domElements.home.sortSelect().value;
  const selectedTag = domElements.home.tagSelect().value;

  let items = db.getData();

  // Ensure the dropdown reflects the selected filter
  domElements.home.tagSelect().value = selectedTag;

  if (searchQuery) {
    items = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery) || 
      (item.content && item.content.toLowerCase().includes(searchQuery))
    );
  }

  if (selectedTag) {
    if (selectedTag === "__no_tags__") {
      items = items.filter(item => !item.tags || item.tags.length === 0);
    } else {
      items = items.filter(item => item.tags && item.tags.includes(selectedTag));
    }
  }

  if (sortCriteria === 'name-asc') {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortCriteria === 'name-desc') {
    items.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortCriteria === 'created-asc') {
    items.sort((a, b) => a.created - b.created);
  } else if (sortCriteria === 'created-desc') {
    items.sort((a, b) => b.created - a.created);
  }

  const itemList = domElements.home.itemList();
  itemList.innerHTML = '';

  items.forEach(item => {
    const listItem = document.createElement('li');
    listItem.innerHTML = renderItemCard(item.id, item.name, item.tags);
    itemList.appendChild(listItem);
  });
}

function createItem() {
  const formName = domElements.add.nameInput();
  const formContent = domElements.add.contentInput();
  
  if (formName.value.trim() === '') {
    alert(uiConfigs.labels.empty_name_error);
    return;
  }
  
  const newItem = {
    id: generateId(),
    name: formName.value.trim(),
    created: Date.now(),
    modified: Date.now(),
    tags: state.currentTagInput.getTags(), // Use currentTagInput instead of tagInput
    content: formContent.value.trim(),
  };
  
  db.addDataItem(newItem);
  renderItems();
  populateTagSelect();

  // Ask user about their next action
  const createAnother = confirm("Item added successfully. Would you like to create another item?");
  
  if (!createAnother) {
    navigateToScreen(uiConfigs.screens.home);
  } else {
    // Clear form for next item
    formName.value = '';
    formContent.value = '';
    state.currentTagInput = initializeTagInput(domElements.add.tagsInput()); // Reinitialize tags
    formName.focus();
  }
}

function viewItem(viewedItemId) {
  const items = db.getData();
  const item = items.find(i => i.id === viewedItemId);

  if(!item) {
    alert(uiConfigs.labels.item_not_found);
    return;
  }

  const elements = domElements.view;
  elements.screenTitle().innerText = item.name || 'View item';
  elements.nameField().innerText = item.name ? 'Name: ' + item.name : '';
  elements.tagsField().innerText = item.tags ? 'Tags: ' + item.tags.join(', ') : '';
  elements.contentField().innerText = item.content ? 'Content: \n' + item.content : '';
  
  elements.editButton().onclick = () => editItem(item.id);
  elements.deleteButton().onclick = () => deleteItem(item.id);

  navigateToScreen(uiConfigs.screens.view);
}

function deleteItem(itemId) {
  if (confirm(uiConfigs.labels.delete_confirm)) {
    db.deleteDataItem(itemId);
    renderItems();
    navigateToScreen(uiConfigs.screens.home);
  }
}

// Update the back button in edit screen to return to view screen
function editItem(editedItemId) {
  const items = db.getData();
  const item = items.find(i => i.id === editedItemId);

  if (!item) {
    alert(uiConfigs.labels.item_not_found);
    return;
  }

  // First navigate to edit screen
  navigateToScreen(uiConfigs.screens.edit);

  // Then initialize the form
  const formName = domElements.edit.nameInput();
  const formContent = domElements.edit.contentInput();
  const formTags = domElements.edit.tagsInput();
  
  formName.value = item.name || '';
  formContent.value = item.content || '';

  // Initialize tag input with existing tags
  state.currentTagInput = initializeTagInput(formTags, item.tags || []);
  
  const backBtn = domElements.edit.backButton();
  backBtn.onclick = () => viewItem(editedItemId);

  const formSaveBtn = domElements.edit.saveButton();
  formSaveBtn.onclick = function () {
    saveEditedItem(editedItemId);
    viewItem(editedItemId);
  };
}

function saveEditedItem(itemId) {
  const formName = domElements.edit.nameInput();
  const formContent = domElements.edit.contentInput();

  if (formName.value.trim() === '') {
    alert(uiConfigs.labels.empty_name_error);
    return;
  }

  const items = db.getData();
  const originalItem = items.find(item => item.id === itemId);

  if (!originalItem) {
    alert(uiConfigs.labels.item_not_found);
    return;
  }

  const updatedItem = {
    ...originalItem,
    name: formName.value.trim(),
    tags: state.currentTagInput.getTags(), // Add tags from currentTagInput
    content: formContent.value.trim(),
    modified: Date.now()
  };

  db.updateDataItem(updatedItem);
  populateTagSelect();
  domElements.home.tagSelect().value = state.currentSelectedTag;
  renderItems();

  alert(uiConfigs.labels.update_success);
  navigateToScreen(uiConfigs.screens.home);
}

function searchItems(query, items) {
  return items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
}

function sortItems(criteria, items) {
  const sortedItems = [...items];
  if (criteria === 'name-asc') {
    sortedItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (criteria === 'name-desc') {
    sortedItems.sort((a, b) => b.name.localeCompare(a.name));
  } else if (criteria === 'created-asc') {
    sortedItems.sort((a, b) => a.created - b.created);
  } else if (criteria === 'created-desc') {
    sortedItems.sort((a, b) => b.created - a.created);
  } else if (criteria === 'modified-asc') {
    sortedItems.sort((a, b) => a.modified - b.modified);
  } else if (criteria === 'modified-desc') {
    sortedItems.sort((a, b) => b.modified - a.modified);
  }
  return sortedItems;
}

function getUniqueTags(items) {
  const tags = new Set();
  items.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
}

function populateTagSelect() {
  const items = db.getData();
  const uniqueTags = getUniqueTags(items);
  const tagSelect = domElements.home.tagSelect();

  // Preserve the currently selected tag
  const previousSelection = state.currentSelectedTag || tagSelect.value;

  tagSelect.innerHTML = `
    <option value="">All Tags</option>
    <option value="__no_tags__">No Tags</option>
  `;

  uniqueTags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagSelect.appendChild(option);
  });

  // Restore the previous selection
  tagSelect.value = previousSelection;
  state.currentSelectedTag = previousSelection; // Update global state
}

// Add this new function for tag input component
function initializeTagInput(inputElement, initialTags = []) {
  // Check if input element exists
  if (!inputElement || !inputElement.parentNode) {
    console.error('Invalid input element for tag initialization');
    return {
      getTags: () => [] // Return empty array if initialization fails
    };
  }

  const container = document.createElement('div');
  container.className = 'tag-input-container';
  
  const tagList = document.createElement('div');
  tagList.className = 'tag-list';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = uiConfigs.tagInput.placeholder;
  input.className = 'tag-input';
  
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'tag-suggestions hidden';
  
  container.appendChild(tagList);
  container.appendChild(input);
  container.appendChild(suggestionsContainer);
  
  // Replace original input with our container
  inputElement.parentNode.replaceChild(container, inputElement);
  
  // Keep track of current tags
  let tags = [...initialTags];
  
  // Function to render tags
  function renderTags() {
    tagList.innerHTML = tags.map(tag => `
      <span class="tag-pill">
        ${tag}
        <button class="tag-remove" data-tag="${tag}">×</button>
      </span>
    `).join('');
    
    // Add click handlers for remove buttons
    tagList.querySelectorAll('.tag-remove').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const tagToRemove = btn.dataset.tag;
        tags = tags.filter(t => t !== tagToRemove);
        renderTags();
      };
    });
  }
  
  // Function to add a new tag
  function addTag(tagName) {
    tagName = tagName.trim().toLowerCase();
    if (tagName && !tags.includes(tagName)) {
      tags.push(tagName);
      renderTags();
      input.value = '';
      updateSuggestions('');
    }
  }
  
  // Function to show tag suggestions
  function updateSuggestions(query) {
    const allTags = getUniqueTags(db.getData());
    const matchingTags = allTags
      .filter(tag => 
        tag.toLowerCase().includes(query.toLowerCase()) && 
        !tags.includes(tag)
      )
      .slice(0, uiConfigs.tagInput.maxSuggestions); // Show max suggestions
    
    if (matchingTags.length && query) {
      suggestionsContainer.innerHTML = matchingTags
        .map(tag => `<div class="tag-suggestion">${tag}</div>`)
        .join('');
      suggestionsContainer.classList.remove('hidden');
    } else {
      suggestionsContainer.classList.add('hidden');
    }
  }
  
  // Event Listeners
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.value);
    } else if (e.key === 'Backspace' && input.value === '' && tags.length > 0) {
      tags.pop();
      renderTags();
    }
  });
  
  input.addEventListener('input', (e) => {
    updateSuggestions(e.target.value);
  });
  
  // Add focus event listener to show all suggestions when focused
  input.addEventListener('focus', () => {
    updateSuggestions(''); // Show all suggestions by passing empty query
  });
  
  input.addEventListener('blur', () => {
    // Small delay to allow clicking suggestions
    setTimeout(() => {
      suggestionsContainer.classList.add('hidden');
    }, 200);
  });
  
  suggestionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-suggestion')) {
      addTag(e.target.textContent);
      input.focus();
    }
  });
  
  // Initialize with any existing tags
  renderTags();
  
  // Return method to get current tags
  return {
    getTags: () => tags
  };
}

// Add this cleanup function
function cleanupTagInputs() {
  // Restore original input elements
  const containers = document.querySelectorAll('.tag-input-container');
  containers.forEach(container => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter tags (comma separated)';
    
    // Set appropriate ID based on the screen
    if (container.closest('#add-item-screen')) {
      input.id = 'add-item-tags';
    } else if (container.closest('#edit-item-screen')) {
      input.id = 'edit-item-tags';
    }
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    inputContainer.appendChild(input);
    
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-input';
    inputContainer.appendChild(clearBtn);
    
    container.parentNode.replaceChild(inputContainer, container);
  });
}

// Page initialization      
window.addEventListener('DOMContentLoaded', () => {
  populateTagSelect();
  state.currentSelectedTag = domElements.home.tagSelect().value; // Initialize selected tag
  renderItems();

  const clearButtons = document.querySelectorAll(".clear-input");    
  clearButtons.forEach(button => {
    button.addEventListener("click", () => {
      const inputContainer = button.closest(".input-container");
      const inputField = inputContainer && inputContainer.querySelector("input");
      if (inputField) {
        inputField.value = "";
        if (inputField.id === 'search-input') {
          // Trigger an 'input' event programmatically to invoke the listener
          const event = new Event('input', { bubbles: true });
          inputField.dispatchEvent(event);
        }
      }         
    });
  });

  // Initialize empty tag input for add screen
  state.currentTagInput = initializeTagInput(domElements.add.tagsInput());
});

