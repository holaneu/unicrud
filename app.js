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

          // Process current data first
          currentData.forEach(item => {
            seenIds.add(item.id);
            mergedData.push(item);
          });

          // Process imported data, handling duplicates
          importedData.forEach(importedItem => {
            if (seenIds.has(importedItem.id)) {
              // Handle duplicate ID - find existing item
              const existingItem = mergedData.find(item => item.id === importedItem.id);
              
              // Update if imported is newer
              if (existingItem && importedItem.modified > existingItem.modified) {
                Object.assign(existingItem, importedItem);
              }
            } else {
              // New item
              seenIds.add(importedItem.id);
              mergedData.push(importedItem);
            }
          });

          // Save merged data
          this.saveData(mergedData);
          
          // Refresh UI
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
      <div class="card-item" data-id="${id}" onclick="itemManager.view('${id}')">
        <div class="card-content">
          <span class="card-title">${name}</span>
          <span class="card-badge">${tags.join(', ')}</span>
        </div>
      </div>
    `;
  }
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
    
    if (screenId === uiConfigs.screens.add) {
      state.currentTagInput = tagManager.initializeTagInput(domElements.add.tagsInput());
    }
  }
};

// Item Manager Module
const itemManager = {
  create() {
    const formName = domElements.add.nameInput();
    const formContent = domElements.add.contentInput();
    
    if (formName.value.trim() === '') {
      alert(uiConfigs.labels.empty_name_error);
      return;
    }
    
    const newItem = {
      id: utils.generateId(),
      name: formName.value.trim(),
      created: Date.now(),
      modified: Date.now(),
      tags: state.currentTagInput.getTags(),
      content: formContent.value.trim(),
    };
    
    storage.addDataItem(newItem);
    listManager.renderItems();
    tagManager.populateTagSelect();
  
    const createAnother = confirm("Item added successfully. Would you like to create another item?");
    
    if (!createAnother) {
      navigation.toScreen(uiConfigs.screens.home);
    } else {
      formName.value = '';
      formContent.value = '';
      state.currentTagInput = tagManager.initializeTagInput(domElements.add.tagsInput());
      formName.focus();
    }
  },
  
  view(viewedItemId) {
    const items = storage.getData();
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
    
    elements.editButton().onclick = () => itemManager.edit(item.id);
    elements.deleteButton().onclick = () => itemManager.delete(item.id);
  
    navigation.toScreen(uiConfigs.screens.view);
  },
  
  delete(itemId) {
    if (confirm(uiConfigs.labels.delete_confirm)) {
      storage.deleteDataItem(itemId);
      listManager.renderItems();
      navigation.toScreen(uiConfigs.screens.home);
    }
  },
  
  edit(editedItemId) {
    const items = storage.getData();
    const item = items.find(i => i.id === editedItemId);
  
    if (!item) {
      alert(uiConfigs.labels.item_not_found);
      return;
    }
  
    navigation.toScreen(uiConfigs.screens.edit);
  
    const formName = domElements.edit.nameInput();
    const formContent = domElements.edit.contentInput();
    const formTags = domElements.edit.tagsInput();
    
    formName.value = item.name || '';
    formContent.value = item.content || '';
  
    state.currentTagInput = tagManager.initializeTagInput(formTags, item.tags || []);
    
    const backBtn = domElements.edit.backButton();
    backBtn.onclick = () => itemManager.view(editedItemId);
  
    const formSaveBtn = domElements.edit.saveButton();
    formSaveBtn.onclick = function () {
      itemManager.saveEdited(editedItemId);
      itemManager.view(editedItemId);
    };
  },
  
  saveEdited(itemId) {
    const formName = domElements.edit.nameInput();
    const formContent = domElements.edit.contentInput();
  
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
    domElements.home.tagSelect().value = state.currentSelectedTag;
    listManager.renderItems();
  
    alert(uiConfigs.labels.update_success);
    navigation.toScreen(uiConfigs.screens.home);
  }
};

// List Management Module
const listManager = {
  renderItems() {
    const searchQuery = domElements.home.searchInput().value.toLowerCase();
    const sortCriteria = domElements.home.sortSelect().value;
    const selectedTag = domElements.home.tagSelect().value;
  
    let items = storage.getData();
  
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
      listItem.innerHTML = uiComponents.renderItemCard(item.id, item.name, item.tags);
      itemList.appendChild(listItem);
    });
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
    const tagSelect = domElements.home.tagSelect();
  
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
      return {
        getTags: () => []
      };
    }

    // Store reference to tagManager.getUniqueTags
    const getUniqueTags = this.getUniqueTags;
    
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
    
    inputElement.parentNode.replaceChild(container, inputElement);
    
    let tags = [...initialTags];
    
    function renderTags() {
      tagList.innerHTML = tags.map(tag => `
        <span class="tag-pill">
          ${tag}
          <button class="tag-remove" data-tag="${tag}">×</button>
        </span>
      `).join('');
      
      tagList.querySelectorAll('.tag-remove').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const tagToRemove = btn.dataset.tag;
          tags = tags.filter(t => t !== tagToRemove);
          renderTags();
        };
      });
    }
    
    function addTag(tagName) {
      tagName = tagName.trim().toLowerCase();
      if (tagName && !tags.includes(tagName)) {
        tags.push(tagName);
        renderTags();
        input.value = '';
        updateSuggestions('');
      }
    }
    
    function updateSuggestions(query) {
      const allTags = getUniqueTags(storage.getData()); // Use stored reference
      const matchingTags = allTags
        .filter(tag => 
          tag.toLowerCase().includes(query.toLowerCase()) && 
          !tags.includes(tag)
        )
        .slice(0, uiConfigs.tagInput.maxSuggestions);
      
      if (matchingTags.length && query) {
        suggestionsContainer.innerHTML = matchingTags
          .map(tag => `<div class="tag-suggestion">${tag}</div>`)
          .join('');
        suggestionsContainer.classList.remove('hidden');
      } else {
        suggestionsContainer.classList.add('hidden');
      }
    }
    
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
    
    input.addEventListener('focus', () => {
      updateSuggestions('');
    });
    
    input.addEventListener('blur', () => {
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

// Global state
const state = {
  currentSelectedTag: "",
  currentTagInput: null
};

// Event listeners for UI elements
domElements.home.searchInput().addEventListener('input', listManager.renderItems);
domElements.home.sortSelect().addEventListener('change', listManager.renderItems);
domElements.home.tagSelect().addEventListener('change', (event) => {
  state.currentSelectedTag = event.target.value;
  listManager.renderItems();
});

// Page initialization      
window.addEventListener('DOMContentLoaded', () => {
  tagManager.populateTagSelect();
  state.currentSelectedTag = domElements.home.tagSelect().value;
  listManager.renderItems();

  const clearButtons = document.querySelectorAll(".clear-input");    
  clearButtons.forEach(button => {
    button.addEventListener("click", () => {
      const inputContainer = button.closest(".input-container");
      const inputField = inputContainer && inputContainer.querySelector("input");
      if (inputField) {
        inputField.value = "";
        if (inputField.id === 'search-input') {
          const event = new Event('input', { bubbles: true });
          inputField.dispatchEvent(event);
        }
      }         
    });
  });

  state.currentTagInput = tagManager.initializeTagInput(domElements.add.tagsInput());
});

