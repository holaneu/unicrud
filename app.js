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
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
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
  const formTags = document.querySelector('#add-item-screen #add-item-tags');
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
    tags: formTags.value.trim() ? formTags.value.trim().split(',').map(tag => tag.trim()) : [],
    content: formContent.value.trim(),
  };
  
  db.addDataItem(newItem);
  renderItems();
  populateTagSelect();
  alert("Item added");
  // reset form
  formName.value = '';
  formTags.value = '';
  formContent.value = '';  
}

function viewItem(viewedItemId){
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
  const uiEditItemBtn = document.querySelector('#view-item-screen #view-item-edit-btn');   

  uiScreenTitle.innerText = item.name ? item.name : 'View item';
  uiItemName.innerText = item.name ? 'Name: ' + item.name : '';
  uiItemTags.innerText = item.tags ? 'Tags: ' + item.tags.join(', ') : '';
  uiItemContent.innerText = item.content ? 'Content: \n' + item.content : '';
  uiEditItemBtn.setAttribute("onclick", "editItem('" + item.id + "')");

  navigateToScreen("view-item-screen"); 
}

function editItem(editedItemId) {
  const items = db.getData();
  const item = items.find(i => i.id === editedItemId);

  if (!item) {
    alert("Item not found!");
    return;
  }

  const formName = document.querySelector('#edit-item-screen #edit-item-name');
  const formTags = document.querySelector('#edit-item-screen #edit-item-tags');
  const formContent = document.querySelector('#edit-item-screen #edit-item-content');

  formName.value = item.name || '';
  formTags.value = item.tags ? item.tags.join(', ') : '';
  formContent.value = item.content || '';

  const formSaveBtn = document.querySelector('#edit-item-screen #edit-item-save-btn');
  formSaveBtn.onclick = function () {
    saveEditedItem(editedItemId);
  };

  navigateToScreen("edit-item-screen");
}

function saveEditedItem(itemId) {
  const formName = document.querySelector('#edit-item-screen #edit-item-name');
  const formTags = document.querySelector('#edit-item-screen #edit-item-tags');
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
    tags: formTags.value.trim() ? formTags.value.trim().split(',').map(tag => tag.trim()) : [],
    content: formContent.value.trim(),
    modified: Date.now()
  };

  db.updateDataItem(updatedItem);

  populateTagSelect();
  document.getElementById('tag-select').value = currentSelectedTag; // Restore selected tag

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

});

