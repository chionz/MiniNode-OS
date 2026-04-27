// File Manager JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const fileList = document.getElementById("fileList");
  const listViewBtn = document.getElementById("listViewBtn");
  const gridViewBtn = document.getElementById("gridViewBtn");

  // Mock file system data
  const fileSystem = {
    desktop: [
      { name: "My Computer", type: "folder", icon: "🖥️", size: "", modified: "Today" },
      { name: "Recycle Bin", type: "folder", icon: "🗑️", size: "", modified: "Yesterday" },
      { name: "Welcome.txt", type: "file", icon: "📄", size: "2 KB", modified: "2 days ago" },
      { name: "Screenshot.png", type: "file", icon: "🖼️", size: "1.2 MB", modified: "1 week ago" }
    ],
    documents: [
      { name: "Resume.pdf", type: "file", icon: "📄", size: "245 KB", modified: "3 days ago" },
      { name: "Project.docx", type: "file", icon: "📝", size: "1.8 MB", modified: "1 day ago" },
      { name: "Notes.txt", type: "file", icon: "📘", size: "15 KB", modified: "Today" },
      { name: "Spreadsheet.xlsx", type: "file", icon: "📊", size: "892 KB", modified: "5 days ago" }
    ],
    pictures: [
      { name: "Vacation", type: "folder", icon: "📁", size: "", modified: "2 weeks ago" },
      { name: "Family.jpg", type: "file", icon: "🖼️", size: "3.2 MB", modified: "1 week ago" },
      { name: "Pet.png", type: "file", icon: "🐾", size: "1.5 MB", modified: "3 days ago" },
      { name: "Wallpaper.bmp", type: "file", icon: "🎨", size: "4.1 MB", modified: "1 month ago" }
    ],
    music: [
      { name: "Favorites", type: "folder", icon: "📁", size: "", modified: "1 week ago" },
      { name: "Song1.mp3", type: "file", icon: "🎵", size: "8.5 MB", modified: "2 days ago" },
      { name: "Song2.wav", type: "file", icon: "🎶", size: "45 MB", modified: "1 week ago" },
      { name: "Playlist.m3u", type: "file", icon: "📋", size: "2 KB", modified: "Today" }
    ],
    videos: [
      { name: "Movies", type: "folder", icon: "📁", size: "", modified: "3 weeks ago" },
      { name: "Tutorial.mp4", type: "file", icon: "🎬", size: "120 MB", modified: "5 days ago" },
      { name: "Vacation.avi", type: "file", icon: "📹", size: "850 MB", modified: "2 weeks ago" },
      { name: "ScreenRecord.webm", type: "file", icon: "📺", size: "45 MB", modified: "Yesterday" }
    ],
    downloads: [
      { name: "installer.exe", type: "file", icon: "⚙️", size: "25 MB", modified: "Today" },
      { name: "archive.zip", type: "file", icon: "📦", size: "150 MB", modified: "2 days ago" },
      { name: "document.pdf", type: "file", icon: "📄", size: "2.1 MB", modified: "1 week ago" }
    ],
    "c-drive": [
      { name: "Program Files", type: "folder", icon: "📁", size: "", modified: "" },
      { name: "Program Files (x86)", type: "folder", icon: "📁", size: "", modified: "" },
      { name: "Users", type: "folder", icon: "📁", size: "", modified: "" },
      { name: "Windows", type: "folder", icon: "📁", size: "", modified: "" },
      { name: "System32", type: "folder", icon: "📁", size: "", modified: "" }
    ],
    "d-drive": [
      { name: "Backup", type: "folder", icon: "📁", size: "", modified: "" },
      { name: "Games", type: "folder", icon: "📁", size: "", modified: "" },
      { name: "Movies", type: "folder", icon: "📁", size: "", modified: "" }
    ]
  };

  let currentPath = "desktop";
  let isGridView = true;

  // Initialize
  loadFiles(currentPath);

  // Sidebar navigation
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      const path = item.dataset.path;
      navigateTo(path);
    });
  });

  // View toggle
  listViewBtn.addEventListener("click", () => {
    isGridView = false;
    fileList.classList.remove("grid-view");
    fileList.classList.add("list-view");
    loadFiles(currentPath);
  });

  gridViewBtn.addEventListener("click", () => {
    isGridView = true;
    fileList.classList.remove("list-view");
    fileList.classList.add("grid-view");
    loadFiles(currentPath);
  });

  function navigateTo(path) {
    currentPath = path;
    updateAddressBar(path);
    loadFiles(path);
  }

  function updateAddressBar(path) {
    const pathMap = {
      desktop: "This PC > Local Disk (C:) > Users > Guest > Desktop",
      documents: "This PC > Local Disk (C:) > Users > Guest > Documents",
      pictures: "This PC > Local Disk (C:) > Users > Guest > Pictures",
      music: "This PC > Local Disk (C:) > Users > Guest > Music",
      videos: "This PC > Local Disk (C:) > Users > Guest > Videos",
      downloads: "This PC > Local Disk (C:) > Users > Guest > Downloads",
      "c-drive": "This PC > Local Disk (C:)",
      "d-drive": "This PC > Local Disk (D:)"
    };
    document.querySelector(".address-path").textContent = pathMap[path] || path;
  }

  function loadFiles(path) {
    const files = fileSystem[path] || [];
    fileList.innerHTML = files.map(file => {
      if (isGridView) {
        return `
          <div class="file-item grid-item" data-type="${file.type}" data-name="${file.name}">
            <div class="file-icon">${file.icon}</div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${file.size}</div>
          </div>
        `;
      } else {
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
      }
    }).join("");

    // Add click handlers
    document.querySelectorAll(".file-item").forEach(item => {
      item.addEventListener("dblclick", () => {
        const type = item.dataset.type;
        const name = item.dataset.name;
        if (type === "folder") {
          // Navigate to folder (simplified)
          console.log(`Opening folder: ${name}`);
        } else {
          // Open file (simplified)
          console.log(`Opening file: ${name}`);
        }
      });
    });
  }
});
  });
});
