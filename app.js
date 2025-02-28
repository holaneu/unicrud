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
    placeholder: "Click or write to add tags ..."
  },
  screenIds: {
    homeScreenId: "home-screen",
    addItemScreenId: "add-item-screen",
    editItemScreenId: "edit-item-screen",
    viewItemScreenId: "view-item-screen",
    settingsScreenId: "settings-screen"
  }
};

// DOM element references organized by screen
const domElements = {
  homeScreen: {
    screen: () => document.getElementById(uiConfigs.screenIds.homeScreenId),
    searchInput: () => document.getElementById('search-input'),
    sortSelect: () => document.getElementById('sort-select'),
    tagSelect: () => document.getElementById('tag-select'),
    itemList: () => document.getElementById('item-list')
  },
  addItemScreen: {
    screen: () => document.getElementById(uiConfigs.screenIds.addItemScreenId),
    nameInput: () => document.querySelector(`#${uiConfigs.screenIds.addItemScreenId} #add-item-name`),
    contentInput: () => document.querySelector(`#${uiConfigs.screenIds.addItemScreenId} #add-item-content`),
    tagsInput: () => document.querySelector(`#${uiConfigs.screenIds.addItemScreenId} #add-item-tags`)
  },
  editItemScreen: {
    screen: () => document.getElementById(uiConfigs.screenIds.editItemScreenId),
    nameInput: () => document.querySelector('#edit-item-screen #edit-item-name'),
    contentInput: () => document.querySelector('#edit-item-screen #edit-item-content'),
    tagsInput: () => document.querySelector('#edit-item-screen #edit-item-tags'),
    saveButton: () => document.querySelector('#edit-item-screen #edit-item-save-btn'),
    backButton: () => document.querySelector('#edit-item-screen .back-btn')
  },
  viewItemScreen: {
    screen: () => document.getElementById(uiConfigs.screenIds.viewItemScreenId),
    screenTitle: () => document.querySelector('#view-item-screen .screen-title'),
    nameField: () => document.querySelector('#view-item-screen #view-item-name'),
    tagsField: () => document.querySelector('#view-item-screen #view-item-tags'),
    contentField: () => document.querySelector('#view-item-screen #view-item-content'),
    editButton: () => document.querySelector('#view-item-screen .edit-btn'),
    deleteButton: () => document.querySelector('#view-item-screen .delete-btn')
  }
};

// Storage Module
const storage = {
  getData() {
    const data = localStorage.getItem(appConfigs.storage.data_key);
    return data ? JSON.parse(data) : [];
  },

  saveData(items) {
    localStorage.setItem(appConfigs.storage.data_key, JSON.stringify(items));
  },

  addDataItem(item) {
    const items = this.getData();
    items.push(item);
    this.saveData(items);
  },

  deleteDataItem(itemId) {
    let items = this.getData();
    items = items.filter(item => item.id !== itemId);
    this.saveData(items);
  },

  updateDataItem(updatedItem) {
    let items = this.getData();
    items = items.map(item => item.id === updatedItem.id ? updatedItem : item);
    this.saveData(items);
  },

  clearData() {
    localStorage.setItem(appConfigs.storage.data_key, "");
  },

  exportData() {
    const data = this.getData();
    const exportData = JSON.stringify(data, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.download = `${appConfigs.app_id}_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  importData() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    
    fileInput.addEventListener('change', event => {
      const file = event.target.files[0];
      if (!file) {
        alert('No file selected');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (!Array.isArray(importedData)) {
            throw new Error('Invalid format');
          }

          const confirmation = confirm(
            'Importing data may overwrite existing items. Do you want to continue?'
          );
          
          if (!confirmation) return;

          const currentData = this.getData();
          const mergedData = [];
          const seenIds = new Set();

          currentData.forEach(item => {
            seenIds.add(item.id);
            mergedData.push(item);
          });

          importedData.forEach(importedItem => {
            if (seenIds.has(importedItem.id)) {
              const existingItem = mergedData.find(item => item.id === importedItem.id);
              
              if (existingItem && importedItem.modified > existingItem.modified) {
                Object.assign(existingItem, importedItem);
              }
            } else {
              seenIds.add(importedItem.id);
              mergedData.push(importedItem);
            }
          });

          this.saveData(mergedData);
          
          listManager.renderItems();
          tagManager.populateTagSelect();
          
          alert('Data successfully imported');
        } catch (error) {
          console.error('Import error:', error);
          alert('Failed to import data. Invalid format.');
        }
      };

      reader.readAsText(file);
    });

    fileInput.click();
  }
};

// UI Components Module
const uiComponents = {
  renderItemCard(id, name, tags) {
    return `
      <div class="card-item" data-id="${id}">
        <div class="card-content">
          <span class="card-title">${name}</span>
          <span class="card-badge">${tags.join(', ')}</span>
        </div>
      </div>
    `;
  },
  /*
  attachEventListeners() {
    document.querySelectorAll('.card-item').forEach(item => {
      item.addEventListener('click', function () {
        const itemId = this.getAttribute('data-id');
        itemManager.viewItem(itemId); 
      });
    });
  }*/
};

// Utility Module
const utils = {
  generateId(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }
};

// Navigation Module
const navigation = {
  toScreen(screenId) {
    tagManager.cleanupTagInputs();
    
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('hidden'));
    
    const targetScreen = document.getElementById(screenId);
    targetScreen.classList.remove('hidden');
    
    if (screenId === uiConfigs.screenIds.addItemScreenId) {
      // Clear form when navigating to add screen
      const formName = domElements.addItemScreen.nameInput();
      const formContent = domElements.addItemScreen.contentInput();
      formName.value = '';
      formContent.value = '';
      state.currentTagInput = tagManager.initializeTagInput(domElements.addItemScreen.tagsInput());
    }

    // Re-initialize clear buttons when screen changes
    uiManager.initializeClearButtons();
  }
};

// Item Manager Module
const itemManager = {
  createItem() {
    //const formName = domElements.addItemScreen.nameInput();
    //const formContent = domElements.addItemScreen.contentInput();
    
    if (domElements.addItemScreen.nameInput().value.trim() === '') {
      alert(uiConfigs.labels.empty_name_error);
      return;
    }
    
    const newItem = {
      id: utils.generateId(),
      name: domElements.addItemScreen.nameInput().value.trim(),
      created: Date.now(),
      modified: Date.now(),
      tags: state.currentTagInput.getTags(),
      content: domElements.addItemScreen.contentInput().value.trim(),
    };
    
    storage.addDataItem(newItem);
    listManager.renderItems();
    tagManager.populateTagSelect();

    navigation.toScreen(uiConfigs.screenIds.homeScreenId);
  },
  
  viewItem(viewedItemId) {
    const items = storage.getData();
    const item = items.find(i => i.id === viewedItemId);
  
    if(!item) {
      alert(uiConfigs.labels.item_not_found);
      return;
    }
  
    const elements = domElements.viewItemScreen;
    elements.screenTitle().innerText = item.name || 'View item';
    elements.nameField().innerText = item.name ? 'Name: ' + item.name : '';
    elements.tagsField().innerText = item.tags ? 'Tags: ' + item.tags.join(', ') : '';
    elements.contentField().innerText = item.content ? 'Content: \n' + item.content : '';
    
    elements.editButton().onclick = () => itemManager.editItem(item.id);
    elements.deleteButton().onclick = () => itemManager.deleteItem(item.id);
  
    navigation.toScreen(uiConfigs.screenIds.viewItemScreenId);
  },
  
  deleteItem(itemId) {
    if (confirm(uiConfigs.labels.delete_confirm)) {
      storage.deleteDataItem(itemId);
      listManager.renderItems();
      navigation.toScreen(uiConfigs.screenIds.homeScreenId);
    }
  },
  
  editItem(editedItemId) {
    const items = storage.getData();
    const item = items.find(i => i.id === editedItemId);
  
    if (!item) {
      alert(uiConfigs.labels.item_not_found);
      return;
    }
  
    navigation.toScreen(uiConfigs.screenIds.editItemScreenId);
  
    const formName = domElements.editItemScreen.nameInput();
    const formContent = domElements.editItemScreen.contentInput();
    const formTags = domElements.editItemScreen.tagsInput();
    
    formName.value = item.name || '';
    formContent.value = item.content || '';
  
    state.currentTagInput = tagManager.initializeTagInput(formTags, item.tags || []);
    
    const backBtn = domElements.editItemScreen.backButton();
    backBtn.onclick = () => itemManager.viewItem(editedItemId);
  
    const formSaveBtn = domElements.editItemScreen.saveButton();
    formSaveBtn.onclick = function () {
      itemManager.saveEditedItem(editedItemId);
      itemManager.viewItem(editedItemId);
    };
  },
  
  saveEditedItem(itemId) {
    const formName = domElements.editItemScreen.nameInput();
    const formContent = domElements.editItemScreen.contentInput();
  
    if (formName.value.trim() === '') {
      alert(uiConfigs.labels.empty_name_error);
      return;
    }
  
    const items = storage.getData();
    const originalItem = items.find(item => item.id === itemId);
  
    if (!originalItem) {
      alert(uiConfigs.labels.item_not_found);
      return;
    }
  
    const updatedItem = {
      ...originalItem,
      name: formName.value.trim(),
      tags: state.currentTagInput.getTags(),
      content: formContent.value.trim(),
      modified: Date.now()
    };
  
    storage.updateDataItem(updatedItem);
    tagManager.populateTagSelect();
    domElements.homeScreen.tagSelect().value = state.currentSelectedTag;
    listManager.renderItems();
  
    navigation.toScreen(uiConfigs.screenIds.homeScreenId);
  }
};

// List Management Module
const listManager = {
  renderItems() {
    const searchQuery = domElements.homeScreen.searchInput().value.toLowerCase();
    const sortCriteria = domElements.homeScreen.sortSelect().value;
    const selectedTag = domElements.homeScreen.tagSelect().value;
  
    let items = storage.getData();
  
    domElements.homeScreen.tagSelect().value = selectedTag;
  
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
    } else if (sortCriteria === 'modified-asc') {
      items.sort((a, b) => a.modified - b.modified);
    } else if (sortCriteria === 'modified-desc') {
      items.sort((a, b) => b.modified - a.modified);
    }
  
    const itemList = domElements.homeScreen.itemList();
    itemList.innerHTML = '';
  
    items.forEach(item => {
      const singleListItem = document.createElement('li');
      singleListItem.innerHTML = uiComponents.renderItemCard(item.id, item.name, item.tags);
      singleListItem.onclick = () => itemManager.viewItem(item.id);
      itemList.appendChild(singleListItem);
    });

    //uiComponents.attachEventListeners();
  },
  
  search(query, items) {
    return items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  },
  
  sort(criteria, items) {
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
};

// Tag Management Module
const tagManager = {
  getUniqueTags(items) {
    const tags = new Set();
    items.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  },
  
  populateTagSelect() {
    const items = storage.getData();
    const uniqueTags = this.getUniqueTags(items);
    const tagSelect = domElements.homeScreen.tagSelect();
  
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
  
    tagSelect.value = previousSelection;
    state.currentSelectedTag = previousSelection;
  },
  
  initializeTagInput(inputElement, initialTags = []) {
    if (!inputElement || !inputElement.parentNode) {
      console.error('Invalid input element for tag initialization');
      return { getTags: () => [] };
    }

    // Bind getUniqueTags to use in updateSuggestions
    const getUniqueTags = this.getUniqueTags.bind(this);
    
    const tagInputContainer = document.createElement('div');
    tagInputContainer.className = 'tag-input-container';
    
    const tagList = document.createElement('div');
    tagList.className = 'tag-list';
    
    const tagInput = document.createElement('input');
    tagInput.className = 'tag-input';
    tagInput.type = 'text';
    tagInput.placeholder = uiConfigs.tagInput.placeholder;    
    
    const tagSuggestions = document.createElement('div');
    tagSuggestions.className = 'tag-suggestions hidden';
    
    tagInputContainer.appendChild(tagList);
    tagInputContainer.appendChild(tagInput);
    tagInputContainer.appendChild(tagSuggestions);
    
    inputElement.parentNode.replaceChild(tagInputContainer, inputElement);
    
    let tags = [...initialTags];
    
    function renderTagPill(tag) {
      return `
        <span class="tag-pill">
          ${tag}
          <button class="tag-remove" data-tag="${tag}">
            <svg viewBox="0 0 16 16">
              <path fill="currentColor" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </button>
        </span>
      `;
    }
    
    function renderTags() {
      tagList.innerHTML = tags.map(renderTagPill).join('');
      
      tagList.querySelectorAll('.tag-remove').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const tagToRemove = btn.dataset.tag;
          tags = tags.filter(t => t !== tagToRemove);
          renderTags();
          updateSuggestions(tagInput.value);
        };
      });
    }
    
    function addTag(tagName) {
      tagName = tagName.trim().toLowerCase();
      if (tagName && !tags.includes(tagName)) {
        tags.push(tagName);
        renderTags();
        tagInput.value = '';
        updateSuggestions('');
      }
    }
    
    function updateSuggestions(query) {
      const allTags = getUniqueTags(storage.getData()); // Use the bound method
      const availableTags = allTags.filter(tag => !tags.includes(tag));
      
      let matchingTags = availableTags
        .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
        .sort()
        .slice(0, 4);  // Show max 4 existing tags to leave room for the "new tag" option
      
      const queryTrimmed = query.trim().toLowerCase();
      const showNewTag = queryTrimmed && !tags.includes(queryTrimmed) && !matchingTags.includes(queryTrimmed);
      
      if (matchingTags.length || showNewTag) {
        tagSuggestions.innerHTML = `
          ${matchingTags.map(tag => `
            <div class="tag-suggestion">${tag}</div>
          `).join('')}
          ${showNewTag ? `
            <div class="tag-suggestion new-tag">${queryTrimmed}</div>
          ` : ''}
        `;
        tagSuggestions.classList.remove('hidden');
      } else {
        tagSuggestions.classList.add('hidden');
      }
    }
    
    tagInput.addEventListener('focus', () => {
      updateSuggestions(tagInput.value);
    });
    
    tagInput.addEventListener('input', (e) => {
      updateSuggestions(e.target.value);
    });
    
    document.addEventListener('click', (e) => {
      if (!tagInputContainer.contains(e.target)) {
        tagSuggestions.classList.add('hidden');
      }
    });
    
    tagSuggestions.addEventListener('click', (e) => {
      const suggestion = e.target.closest('.tag-suggestion');
      if (suggestion) {
        addTag(suggestion.textContent);
        tagInput.focus();
        updateSuggestions('');
      }
    });
    
    renderTags();
    
    return {
      getTags: () => tags
    };
  },

  cleanupTagInputs() {
    const containers = document.querySelectorAll('.tag-input-container');
    containers.forEach(container => {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter tags (comma separated)';
      
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
};

// UI Manager Module
const uiManager = {
  clearInputListeners: new WeakMap(), // Store listeners for cleanup

  initializeClearButtons() {
    const inputsWithClear = [
      domElements.homeScreen.searchInput(),
      domElements.addItemScreen.nameInput(),
      domElements.editItemScreen.nameInput()
    ];

    inputsWithClear.forEach(input => {
      if (!input) return;
      
      const clearButton = input.parentElement.querySelector('.clear-input');
      if (!clearButton) return;

      // Clean up existing listeners
      const oldListeners = this.clearInputListeners.get(input);
      if (oldListeners) {
        input.removeEventListener('input', oldListeners.input);
        clearButton.removeEventListener('click', oldListeners.click);
      }

      // Create new listeners
      const inputListener = () => {
        clearButton.style.display = input.value.length > 0 ? 'flex' : 'none';
      };

      const clickListener = () => {
        input.value = '';
        clearButton.style.display = 'none';
        input.focus();
        input.dispatchEvent(new Event('input'));
      };

      // Store listeners for future cleanup
      this.clearInputListeners.set(input, {
        input: inputListener,
        click: clickListener
      });

      // Add new listeners
      input.addEventListener('input', inputListener);
      clearButton.addEventListener('click', clickListener);

      // Initial state
      clearButton.style.display = input.value.length > 0 ? 'flex' : 'none';
    });
  }
};

// Global state
const state = {
  currentSelectedTag: "",
  currentTagInput: null
};

// Event listeners for UI elements - Move these into a separate initialization function
function initializeEventListeners() {
  // Remove existing listeners first
  const searchInput = domElements.homeScreen.searchInput();
  const sortSelect = domElements.homeScreen.sortSelect();
  const tagSelect = domElements.homeScreen.tagSelect();
  
  searchInput.removeEventListener('input', listManager.renderItems);
  sortSelect.removeEventListener('change', listManager.renderItems);
  
  // Add new listeners
  searchInput.addEventListener('input', listManager.renderItems);
  sortSelect.addEventListener('change', listManager.renderItems);
  tagSelect.addEventListener('change', (event) => {
    state.currentSelectedTag = event.target.value;
    listManager.renderItems();
  });
}

// Page initialization      
window.addEventListener('DOMContentLoaded', () => {
  uiManager.initializeClearButtons();
  tagManager.populateTagSelect();
  state.currentSelectedTag = domElements.homeScreen.tagSelect().value;
  listManager.renderItems();
  state.currentTagInput = tagManager.initializeTagInput(domElements.addItemScreen.tagsInput());
  initializeEventListeners();
});

