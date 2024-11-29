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

/*
let allDataItems = [];
let filteredDataItems = [];
*/
let currentDataItem = null;

// Event listeners for UI elements
document.getElementById('search-input').addEventListener('input', filterAndRender);
document.getElementById('sort-select').addEventListener('change', filterAndRender);


// components
function renderItemCard(id,name,tags){
  return `
    <div class="card-item" data-id="${id}" onclick="viewItem('${id}')">
      <div class="card-content">
        <span class="card-title">${name}</span>
        <span class="card-badge">${name}</span>
        <div class="card-label">${tags.join(', ')}</div>
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

function renderItems(itemsToRender) {
  const itemList = document.getElementById('item-list');
  const items = itemsToRender ? itemsToRender : db.getData();  
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
  alert("Item added");
  // reset form
  formName.value = '';
  formTags.value = '';
  formContent.value = '';  
}

function viewItem(viewedItemId){
  const uiScreenTitle = document.querySelector('#view-item-screen .screen-title');
  const uiItemName = document.querySelector('#view-item-screen #view-item-name'); //.getElementById('item-detail-name');
  const uiItemTags = document.querySelector('#view-item-screen #view-item-tags'); //.getElementById('item-detail-tags');
  const uiItemContent = document.querySelector('#view-item-screen #view-item-content'); //.getElementById('item-detail-content');
  const uiEditItemBtn = document.querySelector('#view-item-screen #view-item-edit-btn'); //.getElementById('item-detail-edit-btn');
  
  const items = db.getData();
  const item = items.find(i => i.id === viewedItemId);

  uiScreenTitle.innerText = item && item.name ? item.name : 'View item';
  uiItemName.innerText = item && item.name ? 'Name: ' + item.name : '';
  uiItemTags.innerText = item && item.tags ? 'Tags: ' + item.tags.join(', ') : '';
  uiItemContent.innerText = item && item.content ? 'Content: \n' + item.content : '';
  //uiEditItemBtn.addEventListener('click', () => editItem(item.id), { once: true });
  uiEditItemBtn.setAttribute("onclick", "editItem('" + item.id + "')");
  navigateToScreen("view-item-screen"); 
}

function editItem(itemId){
  alert(`Attempt to edit item "${itemId}"`);
}

// Function to search and filter items
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
  }
  return sortedItems;
}

function filterAndRender() {
  const searchQuery = document.getElementById('search-input').value;
  const sortCriteria = document.getElementById('sort-select').value;
  let items = searchItems(searchQuery, db.getData());
  items = sortItems(sortCriteria, items);
  renderItems(items);
}

// page initialization      
window.addEventListener('DOMContentLoaded', () => {
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

