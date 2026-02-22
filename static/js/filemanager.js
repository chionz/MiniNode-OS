// Highlight sidebar selection
/* document.querySelectorAll('.sidebar ul li').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
    item.classList.add('active');
    const section = item.textContent.trim();
    document.querySelector('.path-bar span').textContent = section;
  });
}); */


document.addEventListener("DOMContentLoaded", () => {
  const categoryTitle = document.getElementById("categoryTitle");
  const fileList = document.getElementById("fileList");
  const listViewBtn = document.getElementById("listViewBtn");
  const gridViewBtn = document.getElementById("gridViewBtn");

  // 🔹 Mock file data per category
  const files = {
    Videos: [
      { name: "Vacation.mp4", size: "45 MB", icon: "🎞️" },
      { name: "Tutorial.mov", size: "120 MB", icon: "🎬" },
      { name: "MusicVideo.mp4", size: "87 MB", icon: "📹" }
    ],
    Music: [
      { name: "Chill.wav", size: "10 MB", icon: "🎧" },
      { name: "Beats.mp3", size: "8 MB", icon: "🎵" },
      { name: "Song.flac", size: "32 MB", icon: "🎶" }
    ],
    Photos: [
      { name: "Beach.png", size: "4 MB", icon: "🖼️" },
      { name: "Portrait.jpg", size: "2.3 MB", icon: "📷" },
      { name: "Logo.svg", size: "600 KB", icon: "🪶" }
    ],
    Documents: [
      { name: "Invoice.pdf", size: "500 KB", icon: "📄" },
      { name: "Resume.docx", size: "1.2 MB", icon: "📝" },
      { name: "Notes.txt", size: "40 KB", icon:
  /* const categoryView = document.getElementById("categoryView");
  const categoryPage = document.getElementById("categoryPage"); */ "📘" }
    ]
  };

  // 🔹 When user clicks a category
  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      openCategory(category);
    });
  });

  // 🔹 Toggle between list/grid view
  listViewBtn.addEventListener("click", () => {
    fileList.classList.remove("grid");
  });
  gridViewBtn.addEventListener("click", () => {
    fileList.classList.add("grid");
  });

  // 🔹 Open a category
  function openCategory(category) {
    categoryTitle.textContent = category;
    categoryPage.style.display = "flex";
    populateFiles(category);
  }

  // 🔹 Populate file list dynamically
  function populateFiles(category) {
    const categoryFiles = files[category] || [];
    fileList.innerHTML = categoryFiles.map(file => `
      <div class="file-item">
        <div class="file-info">
          <div class="thumbnail">${file.icon}</div>
          <div class="file-list-detail">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${file.size}</div>
          </div>
        </div>
        <div class="more-options">
          ⋮
          <div class="options-menu">
            <button class="opt-btn">Rename</button>
            <button class="opt-btn">Delete</button>
            <button class="opt-btn">Download</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  // 🔹 3-dot dropdown logic
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".options-menu.active")
      .forEach(m => m.classList.remove("active"));
    const more = e.target.closest(".more-options");
    if (more) {
      const menu = more.querySelector(".options-menu");
      if (menu) menu.classList.toggle("active");
      e.stopPropagation();
    }
  });
});
