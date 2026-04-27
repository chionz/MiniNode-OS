document.addEventListener('DOMContentLoaded', () => {
  const fileList = document.getElementById('fileList');
  const listViewBtn = document.getElementById('listViewBtn');
  const gridViewBtn = document.getElementById('gridViewBtn');
  const addressPath = document.querySelector('.address-path');
  const searchBox = document.querySelector('.search-box');
  const sidebarItems = document.querySelectorAll('.sidebar-item');

  if (!fileList || !listViewBtn || !gridViewBtn || !addressPath) return;

  const fileSystem = {
    desktop: [
      { name: 'My Computer', type: 'folder', icon: '🖥️', size: '', modified: 'Today' },
      { name: 'Recycle Bin', type: 'folder', icon: '🗑️', size: '', modified: 'Yesterday' },
      { name: 'Welcome.txt', type: 'file', icon: '📄', size: '2 KB', modified: '2 days ago' },
      { name: 'Screenshot.png', type: 'file', icon: '🖼️', size: '1.2 MB', modified: '1 week ago' }
    ],
    documents: [
      { name: 'Resume.pdf', type: 'file', icon: '📄', size: '245 KB', modified: '3 days ago' },
      { name: 'Project.docx', type: 'file', icon: '📝', size: '1.8 MB', modified: '1 day ago' },
      { name: 'Notes.txt', type: 'file', icon: '📘', size: '15 KB', modified: 'Today' },
      { name: 'Spreadsheet.xlsx', type: 'file', icon: '📊', size: '892 KB', modified: '5 days ago' }
    ],
    pictures: [
      { name: 'Vacation', type: 'folder', icon: '📁', size: '', modified: '2 weeks ago' },
      { name: 'Family.jpg', type: 'file', icon: '🖼️', size: '3.2 MB', modified: '1 week ago' },
      { name: 'Pet.png', type: 'file', icon: '🐾', size: '1.5 MB', modified: '3 days ago' },
      { name: 'Wallpaper.bmp', type: 'file', icon: '🎨', size: '4.1 MB', modified: '1 month ago' }
    ],
    music: [
      { name: 'Favorites', type: 'folder', icon: '📁', size: '', modified: '1 week ago' },
      { name: 'Song1.mp3', type: 'file', icon: '🎵', size: '8.5 MB', modified: '2 days ago' },
      { name: 'Song2.wav', type: 'file', icon: '🎶', size: '45 MB', modified: '1 week ago' },
      { name: 'Playlist.m3u', type: 'file', icon: '📋', size: '2 KB', modified: 'Today' }
    ],
    videos: [
      { name: 'Movies', type: 'folder', icon: '📁', size: '', modified: '3 weeks ago' },
      { name: 'Tutorial.mp4', type: 'file', icon: '🎬', size: '120 MB', modified: '5 days ago' },
      { name: 'Vacation.avi', type: 'file', icon: '📹', size: '850 MB', modified: '2 weeks ago' },
      { name: 'ScreenRecord.webm', type: 'file', icon: '📺', size: '45 MB', modified: 'Yesterday' }
    ],
    downloads: [
      { name: 'installer.exe', type: 'file', icon: '⚙️', size: '25 MB', modified: 'Today' },
      { name: 'archive.zip', type: 'file', icon: '📦', size: '150 MB', modified: '2 days ago' },
      { name: 'document.pdf', type: 'file', icon: '📄', size: '2.1 MB', modified: '1 week ago' }
    ],
    'c-drive': [
      { name: 'Program Files', type: 'folder', icon: '📁', size: '', modified: '' },
      { name: 'Program Files (x86)', type: 'folder', icon: '📁', size: '', modified: '' },
      { name: 'Users', type: 'folder', icon: '📁', size: '', modified: '' },
      { name: 'Windows', type: 'folder', icon: '📁', size: '', modified: '' },
      { name: 'System32', type: 'folder', icon: '📁', size: '', modified: '' }
    ],
    'd-drive': [
      { name: 'Backup', type: 'folder', icon: '📁', size: '', modified: '' },
      { name: 'Games', type: 'folder', icon: '📁', size: '', modified: '' },
      { name: 'Movies', type: 'folder', icon: '📁', size: '', modified: '' }
    ]
  };

  const pathMap = {
    desktop: 'This PC > Local Disk (C:) > Users > Guest > Desktop',
    documents: 'This PC > Local Disk (C:) > Users > Guest > Documents',
    pictures: 'This PC > Local Disk (C:) > Users > Guest > Pictures',
    music: 'This PC > Local Disk (C:) > Users > Guest > Music',
    videos: 'This PC > Local Disk (C:) > Users > Guest > Videos',
    downloads: 'This PC > Local Disk (C:) > Users > Guest > Downloads',
    'c-drive': 'This PC > Local Disk (C:)',
    'd-drive': 'This PC > Local Disk (D:)'
  };

  const folderTargets = {
    'My Computer': 'c-drive',
    'Recycle Bin': 'recycleBinWindow'
  };

  let currentPath = 'desktop';
  let isGridView = true;

  function updateAddressBar(path) {
    addressPath.textContent = pathMap[path] || path;
  }

  function setActiveSidebar(path) {
    sidebarItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.path === path);
    });
  }

  function renderEmptyState(query) {
    fileList.innerHTML = `
      <div class="file-empty-state">
        <div>
          <strong>No files found</strong>
          <p>${query ? `Nothing in this folder matches "${query}".` : 'This folder is empty.'}</p>
        </div>
      </div>
    `;
  }

  function renderFiles(files) {
    if (!files.length) {
      renderEmptyState(searchBox?.value.trim());
      return;
    }

    fileList.classList.toggle('grid-view', isGridView);
    fileList.classList.toggle('list-view', !isGridView);

    fileList.innerHTML = files.map((file) => {
      if (isGridView) {
        return `
          <div class="file-item grid-item" data-type="${file.type}" data-name="${file.name}">
            <div class="file-icon">${file.icon}</div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${file.size}</div>
          </div>
        `;
      }

      return `
        <div class="file-item list-item" data-type="${file.type}" data-name="${file.name}">
          <div class="file-icon">${file.icon}</div>
          <div class="file-details">
            <div class="file-name">${file.name}</div>
            <div class="file-modified">${file.modified}</div>
          </div>
          <div class="file-type">${file.type === 'folder' ? 'File folder' : 'File'}</div>
          <div class="file-size">${file.size}</div>
        </div>
      `;
    }).join('');

    fileList.querySelectorAll('.file-item').forEach((item) => {
      item.addEventListener('dblclick', () => {
        const type = item.dataset.type;
        const name = item.dataset.name;

        if (type === 'folder') {
          const target = folderTargets[name] || name.toLowerCase();
          if (fileSystem[target]) {
            navigateTo(target);
            return;
          }

          if (target === 'recycleBinWindow' && typeof openWindow === 'function') {
            openWindow(target);
          }
          return;
        }

        if (typeof openWindow === 'function' && name.endsWith('.txt')) {
          openWindow('editorWindow');
        }
      });
    });
  }

  function loadFiles(path) {
    const files = fileSystem[path] || [];
    const query = searchBox?.value.toLowerCase().trim() || '';
    const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(query));
    renderFiles(filteredFiles);
  }

  function navigateTo(path) {
    currentPath = path;
    updateAddressBar(path);
    setActiveSidebar(path);
    loadFiles(path);
  }

  listViewBtn.addEventListener('click', () => {
    isGridView = false;
    loadFiles(currentPath);
  });

  gridViewBtn.addEventListener('click', () => {
    isGridView = true;
    loadFiles(currentPath);
  });

  sidebarItems.forEach((item) => {
    item.addEventListener('click', () => navigateTo(item.dataset.path));
  });

  searchBox?.addEventListener('input', () => loadFiles(currentPath));

  navigateTo(currentPath);
});
