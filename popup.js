document.addEventListener('DOMContentLoaded', function() {
  const mainContent = document.getElementById('mainContent');
  const bookmarksView = document.getElementById('bookmarksView');
  const formsView = document.getElementById('formsView');
  const addButton = document.getElementById('addButton');
  const categoriesContainer = document.getElementById('categoriesContainer');
  const categoryForm = document.getElementById('categoryForm');
  const linkForm = document.getElementById('linkForm');
  const categorySelect = document.getElementById('categorySelect');
  const editLinkModal = document.getElementById('editLinkModal');
  const editLinkForm = document.getElementById('editLinkForm');
  const cancelEditLink = document.getElementById('cancelEditLink');
  const deleteLinkBtn = document.getElementById('deleteLinkBtn');
  const editCategoryModal = document.getElementById('editCategoryModal');
  const editCategoryForm = document.getElementById('editCategoryForm');
  const cancelEditCategory = document.getElementById('cancelEditCategory');
  const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');

  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const searchInput = document.getElementById('searchInput');
 
  let currentView = 'bookmarks';
  let currentLinkId = null;
  let currentCategoryId = null;
 
  loadBookmarks();
  updateCategorySelect();

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    
    chrome.storage.sync.get(['categories', 'bookmarks'], function(result) {
      const categories = result.categories || [];
      const bookmarks = result.bookmarks || [];
      
      categories.forEach(category => {
        const categoryEl = document.querySelector(`[data-category-id="${category.id}"]`);
        const categoryBookmarks = bookmarks.filter(b => b.categoryId === category.id);
        
        const visibleBookmarks = categoryBookmarks.filter(b => 
          b.name.toLowerCase().includes(searchTerm) ||
          b.url.toLowerCase().includes(searchTerm)
        );
  
        if (categoryEl) {
          const linksGrid = categoryEl.querySelector('.links-grid');
          const links = categoryEl.querySelectorAll('.link-item');
          
          links.forEach(link => {
            const linkText = link.querySelector('.link-name').textContent.toLowerCase();
            const linkUrl = link.querySelector('a').href.toLowerCase();
            link.style.display = (linkText.includes(searchTerm) || linkUrl.includes(searchTerm)) ? 'flex' : 'none';
          });
  
          categoryEl.style.display = visibleBookmarks.length > 0 ? 'block' : 'none';
        }
      });
    });
  });
 
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

  exportBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['categories', 'bookmarks'], function(result) {
      const data = JSON.stringify(result);
      const blob = new Blob([data], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookmark-manager-backup.json';
      a.click();
    });
  });
  
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          chrome.storage.sync.set(data, function() {
            loadBookmarks();
            updateCategorySelect();
            alert('Đã import thành công!');
          });
        } catch (err) {
          alert('File không hợp lệ!');
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
 
  editLinkForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('editLinkName').value;
    const url = document.getElementById('editLinkUrl').value;
    const iconUrl = document.getElementById('editLinkIcon').value;
 
    chrome.storage.sync.get(['bookmarks'], function(result) {
      const bookmarks = result.bookmarks || [];
      const index = bookmarks.findIndex(b => b.id === currentLinkId);
      
      if (index !== -1) {
        bookmarks[index] = {
          ...bookmarks[index],
          name: name,
          url: url,
          icon: iconUrl
        };
        
        chrome.storage.sync.set({ bookmarks }, function() {
          editLinkModal.classList.remove('active');
          loadBookmarks();
        });
      }
    });
  });
 
  editCategoryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('editCategoryName').value;
    const iconUrl = document.getElementById('editCategoryIcon').value;
 
    chrome.storage.sync.get(['categories'], function(result) {
      const categories = result.categories || [];
      const index = categories.findIndex(c => c.id === currentCategoryId);
      
      if (index !== -1) {
        categories[index] = {
          ...categories[index],
          name: name,
          icon: iconUrl
        };
        
        chrome.storage.sync.set({ categories }, function() {
          editCategoryModal.classList.remove('active');
          loadBookmarks();
          updateCategorySelect();
        });
      }
    });
  });
 
  cancelEditLink.addEventListener('click', () => {
    editLinkModal.classList.remove('active');
  });
 
  cancelEditCategory.addEventListener('click', () => {
    editCategoryModal.classList.remove('active');
  });
 
  deleteLinkBtn.addEventListener('click', () => {
    if (currentLinkId && confirm('Bạn có chắc muốn xóa liên kết này?')) {
      chrome.storage.sync.get(['bookmarks'], function(result) {
        const bookmarks = result.bookmarks.filter(b => b.id !== currentLinkId);
        chrome.storage.sync.set({ bookmarks }, function() {
          editLinkModal.classList.remove('active');
          loadBookmarks();
        });
      });
    }
  });
 
  deleteCategoryBtn.addEventListener('click', () => {
    if (currentCategoryId && confirm('Bạn có chắc muốn xóa danh mục này?')) {
      chrome.storage.sync.get(['categories', 'bookmarks'], function(result) {
        const categories = result.categories.filter(c => c.id !== currentCategoryId);
        const bookmarks = result.bookmarks.filter(b => b.categoryId !== currentCategoryId);
        
        chrome.storage.sync.set({ categories, bookmarks }, function() {
          editCategoryModal.classList.remove('active');
          loadBookmarks();
          updateCategorySelect();
        });
      });
    }
  });
 
  function editBookmark(bookmark) {
    currentLinkId = bookmark.id;
    document.getElementById('editLinkName').value = bookmark.name;
    document.getElementById('editLinkUrl').value = bookmark.url;
    document.getElementById('editLinkIcon').value = bookmark.icon;
    editLinkModal.classList.add('active');
  }
 
  function editCategory(category) {
    currentCategoryId = category.id;
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryIcon').value = category.icon;
    editCategoryModal.classList.add('active');
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
        categoryCard.setAttribute('data-category-id', category.id);
        
        const header = document.createElement('div');
        header.className = 'category-header';
        
        const icon = document.createElement('img');
        icon.src = category.icon;
        icon.className = 'category-icon';
        
        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category.name;
 
        const editBtn = document.createElement('button');
        editBtn.className = 'category-edit-button edit-button';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = () => editCategory(category);
        
        header.appendChild(icon);
        header.appendChild(title);
        header.appendChild(editBtn);
        
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