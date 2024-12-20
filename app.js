// configs
const appConfigs = {
  app_id: "unicrud",
  app_name: "Unicrud",
  test_key: this.app_id + "_test",
  get db_data_key() {
    return this.app_id + "_data";
  },
  get db_settings_key() {
    return this.app_id + "_settings";
  },
  get db_user_profile_key() {
    return this.app_id + "_user_profile";
  },
};

const uiConfigs = {
  labels: {
    not_saved_doc: "untitled document"
  },
};  

const db = {
  getData: function() {
    const data = localStorage.getItem(appConfigs.db_data_key);
    return data ? JSON.parse(data) : [];
  },
  saveData: function(items) {
    localStorage.setItem(appConfigs.db_data_key, JSON.stringify(items));
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
    localStorage.setItem(appConfigs.db_data_key, "");
  }
};


// global vars
let currentSelectedTag = ""; // Keeps track of the selected tag
let currentTagInput = null; // Will store the current tag input instance


// Event listeners for UI elements
document.getElementById('search-input').addEventListener('input', renderItems);
document.getElementById('sort-select').addEventListener('change', renderItems);
document.getElementById('tag-select').addEventListener('change', (event) => {
  currentSelectedTag = event.target.value; // Update global state
  renderItems();
});



// components
function renderItemCard(id,name,tags){
  return `
    <div class="card-item" data-id="${id}" onclick="viewItem('${id}')">
      <div class="card-content">
        <span class="card-title">${name}</span>
        <span class="card-badge">${tags.join(', ')}</span>
      </div>
    </div>
  `;
}


// functions
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
  if (screenId === 'add-item-screen') {
    currentTagInput = initializeTagInput(
      document.querySelector('#add-item-screen #add-item-tags')
    );
  }
}

function renderItems() {
  const searchQuery = document.getElementById('search-input').value.toLowerCase();
  const sortCriteria = document.getElementById('sort-select').value;
  const selectedTag = document.getElementById('tag-select').value;

  let items = db.getData();

  // Ensure the dropdown reflects the selected filter
  const tagSelect = document.getElementById('tag-select');
  tagSelect.value = selectedTag;

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

  const itemList = document.getElementById('item-list');
  itemList.innerHTML = '';

  items.forEach(item => {
    const listItem = document.createElement('li');
    listItem.innerHTML = renderItemCard(item.id, item.name, item.tags);
    itemList.appendChild(listItem);
  });
}




function createItem() {
  const formName = document.querySelector('#add-item-screen #add-item-name');
  const formContent = document.querySelector('#add-item-screen #add-item-content');
  
  if (formName.value.trim() === '') {
    alert('Item name cannot be empty');
    return;
  }
  
  const newItem = {
    id: generateId(),
    name: formName.value.trim(),
    created: Date.now(),
    modified: Date.now(),
    tags: currentTagInput.getTags(), // Use currentTagInput instead of tagInput
    content: formContent.value.trim(),
  };
  
  db.addDataItem(newItem);
  renderItems();
  populateTagSelect();

  // Ask user about their next action
  const createAnother = confirm("Item added successfully. Would you like to create another item?");
  
  if (!createAnother) {
    navigateToScreen('home-screen');
  } else {
    // Clear form for next item
    formName.value = '';
    formContent.value = '';
    currentTagInput = initializeTagInput(document.querySelector('#add-item-screen #add-item-tags')); // Reinitialize tags
    formName.focus();
  }
}

function viewItem(viewedItemId) {
  const items = db.getData();
  const item = items.find(i => i.id === viewedItemId);

  if(!item) {
    alert("Item not found!");
    return;
  }

  const uiScreenTitle = document.querySelector('#view-item-screen .screen-title');
  const uiItemName = document.querySelector('#view-item-screen #view-item-name'); 
  const uiItemTags = document.querySelector('#view-item-screen #view-item-tags'); 
  const uiItemContent = document.querySelector('#view-item-screen #view-item-content'); 
  const uiEditBtn = document.querySelector('#view-item-screen .edit-btn');
  const uiDeleteBtn = document.querySelector('#view-item-screen .delete-btn');

  uiScreenTitle.innerText = item.name ? item.name : 'View item';
  uiItemName.innerText = item.name ? 'Name: ' + item.name : '';
  uiItemTags.innerText = item.tags ? 'Tags: ' + item.tags.join(', ') : '';
  uiItemContent.innerText = item.content ? 'Content: \n' + item.content : '';
  
  uiEditBtn.onclick = () => editItem(item.id);
  uiDeleteBtn.onclick = () => deleteItem(item.id);

  navigateToScreen("view-item-screen"); 
}

function deleteItem(itemId) {
  if (confirm("Do you really want to delete this item?")) {
    db.deleteDataItem(itemId);
    renderItems();
    navigateToScreen("home-screen");
  }
}

// Update the back button in edit screen to return to view screen
function editItem(editedItemId) {
  const items = db.getData();
  const item = items.find(i => i.id === editedItemId);

  if (!item) {
    alert("Item not found!");
    return;
  }

  // First navigate to edit screen
  navigateToScreen("edit-item-screen");

  // Then initialize the form
  const formName = document.querySelector('#edit-item-screen #edit-item-name');
  const formContent = document.querySelector('#edit-item-screen #edit-item-content');
  const formTags = document.querySelector('#edit-item-screen #edit-item-tags');
  
  formName.value = item.name || '';
  formContent.value = item.content || '';

  // Initialize tag input with existing tags
  currentTagInput = initializeTagInput(formTags, item.tags || []);
  
  const backBtn = document.querySelector('#edit-item-screen .back-btn');
  backBtn.onclick = () => viewItem(editedItemId);

  const formSaveBtn = document.querySelector('#edit-item-screen #edit-item-save-btn');
  formSaveBtn.onclick = function () {
    saveEditedItem(editedItemId);
    viewItem(editedItemId);
  };
}

function saveEditedItem(itemId) {
  const formName = document.querySelector('#edit-item-screen #edit-item-name');
  const formContent = document.querySelector('#edit-item-screen #edit-item-content');

  if (formName.value.trim() === '') {
    alert("Item name cannot be empty");
    return;
  }

  const items = db.getData();
  const originalItem = items.find(item => item.id === itemId);

  if (!originalItem) {
    alert("Item not found!");
    return;
  }

  const updatedItem = {
    ...originalItem,
    name: formName.value.trim(),
    tags: currentTagInput.getTags(), // Add tags from currentTagInput
    content: formContent.value.trim(),
    modified: Date.now()
  };

  db.updateDataItem(updatedItem);
  populateTagSelect();
  document.getElementById('tag-select').value = currentSelectedTag;
  renderItems();

  alert("Item updated successfully!");
  navigateToScreen("home-screen");
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
  const tagSelect = document.getElementById('tag-select');

  // Preserve the currently selected tag
  const previousSelection = currentSelectedTag || tagSelect.value;

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
  currentSelectedTag = previousSelection; // Update global state
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
  input.placeholder = 'Type tag and press Enter or comma';
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
      .slice(0, 5); // Show max 5 suggestions
    
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

// page initialization      
window.addEventListener('DOMContentLoaded', () => {
  
  populateTagSelect();
  currentSelectedTag = document.getElementById('tag-select').value; // Initialize selected tag
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
  currentTagInput = initializeTagInput(
    document.querySelector('#add-item-screen #add-item-tags')
  );

});

