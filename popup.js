document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('mainContent');
    const bookmarksView = document.getElementById('bookmarksView');
    const formsView = document.getElementById('formsView');
    const addButton = document.getElementById('addButton');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const categoryForm = document.getElementById('categoryForm');
    const linkForm = document.getElementById('linkForm');
    const categorySelect = document.getElementById('categorySelect');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const cancelEdit = document.getElementById('cancelEdit');
  
    let currentView = 'bookmarks';
  
    loadBookmarks();
    updateCategorySelect();
  
    addButton.addEventListener('click', () => {
      if (currentView === 'bookmarks') {
        bookmarksView.classList.remove('active');
        formsView.classList.add('active');
        addButton.innerHTML = '<i class="fas fa-arrow-left"></i> Quay lại';
        currentView = 'forms';
      } else {
        formsView.classList.remove('active');
        bookmarksView.classList.add('active');
        addButton.innerHTML = '<i class="fas fa-plus"></i> Bổ sung';
        currentView = 'bookmarks';
      }
    });
  
    categoryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('categoryName').value;
      const iconUrl = document.getElementById('categoryIcon').value;
      
      chrome.storage.sync.get(['categories'], function(result) {
        const categories = result.categories || [];
        categories.push({
          id: Date.now().toString(),
          name: name,
          icon: iconUrl
        });
        
        chrome.storage.sync.set({ categories }, function() {
          categoryForm.reset();
          updateCategorySelect();
          loadBookmarks();
        });
      });
    });
  
    linkForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const categoryId = categorySelect.value;
      const name = document.getElementById('linkName').value;
      const url = document.getElementById('linkUrl').value;
      const iconUrl = document.getElementById('linkIcon').value;
      
      chrome.storage.sync.get(['bookmarks'], function(result) {
        const bookmarks = result.bookmarks || [];
        bookmarks.push({
          id: Date.now().toString(),
          categoryId: categoryId,
          name: name,
          url: url,
          icon: iconUrl
        });
        
        chrome.storage.sync.set({ bookmarks }, function() {
          linkForm.reset();
          loadBookmarks();
        });
      });
    });
  
    editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const linkId = document.getElementById('editLinkId').value;
      const name = document.getElementById('editLinkName').value;
      const url = document.getElementById('editLinkUrl').value;
      const iconUrl = document.getElementById('editLinkIcon').value;
  
      chrome.storage.sync.get(['bookmarks'], function(result) {
        const bookmarks = result.bookmarks || [];
        const index = bookmarks.findIndex(b => b.id === linkId);
        
        if (index !== -1) {
          bookmarks[index] = {
            ...bookmarks[index],
            name: name,
            url: url,
            icon: iconUrl
          };
          
          chrome.storage.sync.set({ bookmarks }, function() {
            editModal.classList.remove('active');
            loadBookmarks();
          });
        }
      });
    });
  
    cancelEdit.addEventListener('click', () => {
      editModal.classList.remove('active');
    });
  
    function editBookmark(bookmark) {
      document.getElementById('editLinkId').value = bookmark.id;
      document.getElementById('editLinkName').value = bookmark.name;
      document.getElementById('editLinkUrl').value = bookmark.url;
      document.getElementById('editLinkIcon').value = bookmark.icon;
      editModal.classList.add('active');
    }
  
    function updateCategorySelect() {
      chrome.storage.sync.get(['categories'], function(result) {
        const categories = result.categories || [];
        categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
        
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          categorySelect.appendChild(option);
        });
      });
    }
  
    function loadBookmarks() {
      chrome.storage.sync.get(['categories', 'bookmarks'], function(result) {
        const categories = result.categories || [];
        const bookmarks = result.bookmarks || [];
        
        categoriesContainer.innerHTML = '';
        
        categories.forEach(category => {
          const categoryBookmarks = bookmarks.filter(b => b.categoryId === category.id);
          
          const categoryCard = document.createElement('div');
          categoryCard.className = 'category-card';
          
          const header = document.createElement('div');
          header.className = 'category-header';
          
          const icon = document.createElement('img');
          icon.src = category.icon;
          icon.className = 'category-icon';
          
          const title = document.createElement('h2');
          title.className = 'category-title';
          title.textContent = category.name;
          
          header.appendChild(icon);
          header.appendChild(title);
          
          const linksGrid = document.createElement('div');
          linksGrid.className = 'links-grid';
          
          categoryBookmarks.forEach(bookmark => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            
            const linkAnchor = document.createElement('a');
            linkAnchor.href = bookmark.url;
            linkAnchor.target = '_blank';
            linkAnchor.style.textDecoration = 'none';
            linkAnchor.style.color = 'inherit';
            
            const linkIcon = document.createElement('img');
            linkIcon.src = bookmark.icon;
            linkIcon.className = 'link-icon';
            
            const linkName = document.createElement('span');
            linkName.className = 'link-name';
            linkName.textContent = bookmark.name;
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-button';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              editBookmark(bookmark);
            };
            
            linkAnchor.appendChild(linkIcon);
            linkAnchor.appendChild(linkName);
            linkItem.appendChild(linkAnchor);
            linkItem.appendChild(editBtn);
            linksGrid.appendChild(linkItem);
          });
          
          categoryCard.appendChild(header);
          categoryCard.appendChild(linksGrid);
          categoriesContainer.appendChild(categoryCard);
        });
      });
    }
  });