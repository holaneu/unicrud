(function() {
  const APP_PREFIX = "testApp_";
  const DB_KEY = `${APP_PREFIX}items`;

  // Utility function to generate a random ID
  function generateId(length = 10) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  // Wrapper functions for localStorage (can be swapped for Firebase later)
  const storageWrapper = {
      getData: function() {
          const data = localStorage.getItem(DB_KEY);
          return data ? JSON.parse(data) : [];
      },
      saveData: function(items) {
          localStorage.setItem(DB_KEY, JSON.stringify(items));
      },
      createData: function(item) {
          const items = this.getData();
          items.push(item);
          this.saveData(items);
      },
      deleteData: function(id) {
          let items = this.getData();
          items = items.filter(item => item.id !== id);
          this.saveData(items);
      },
      updateData: function(updatedItem) {
          let items = this.getData();
          items = items.map(item => item.id === updatedItem.id ? updatedItem : item);
          this.saveData(items);
      }
  };

  // Function to reset form inputs
  function resetForm() {
      document.getElementById('item-name').value = '';
      document.getElementById('item-tags').value = '';
  }

  // Function to create a new item
  function createItem() {
      const nameInput = document.getElementById('item-name');
      const tagsInput = document.getElementById('item-tags');

      if (nameInput.value.trim() === '') {
          alert('Item name cannot be empty');
          return;
      }

      const newItem = {
          id: generateId(),
          name: nameInput.value.trim(),
          created: Date.now(),
          tags: tagsInput.value.trim() ? tagsInput.value.trim().split(',').map(tag => tag.trim()) : [],
          subItems: [] // Placeholder for sub-items functionality
      };

      storageWrapper.createData(newItem);
      renderItems();
      resetForm();
  }

  // Function to render the item list
  function renderItems() {
      const itemList = document.getElementById('item-list');
      const items = storageWrapper.getData();
      itemList.innerHTML = '';

      items.forEach(item => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `
              <span>${item.name}</span>
              <span class="tags">${item.tags.join(', ')}</span>
              <button class="delete-button" data-id="${item.id}">Delete</button>
          `;
          itemList.appendChild(listItem);
      });
  }

  // Function to search and filter items
  function searchItems(query) {
      const items = storageWrapper.getData();
      return items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  }

  // Function to sort items based on user selection
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

  // Function to filter and render the items based on search and sort criteria
  function filterAndRender() {
      const searchQuery = document.getElementById('search-input').value;
      const sortCriteria = document.getElementById('sort-select').value;
      let items = searchItems(searchQuery);
      items = sortItems(sortCriteria, items);
      renderFilteredItems(items);
  }

  // Function to render the filtered items
  function renderFilteredItems(items) {
      const itemList = document.getElementById('item-list');
      itemList.innerHTML = '';

      items.forEach(item => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `
              <span>${item.name}</span>
              <span class="tags">${item.tags.join(', ')}</span>
              <button class="delete-button" data-id="${item.id}">Delete</button>
          `;
          itemList.appendChild(listItem);
      });
  }

  // Event listener for creating items
  document.getElementById('create-button').addEventListener('click', createItem);

  // Event listener for deleting items (using event delegation)
  document.getElementById('item-list').addEventListener('click', function(event) {
      if (event.target.classList.contains('delete-button')) {
          const id = event.target.getAttribute('data-id');
          storageWrapper.deleteData(id);
          renderItems();
      }
  });

  // Event listeners for search and sort inputs
  document.getElementById('search-input').addEventListener('input', filterAndRender);
  document.getElementById('sort-select').addEventListener('change', filterAndRender);

  // Initial render
  renderItems();
})();
