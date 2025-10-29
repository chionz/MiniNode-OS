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

  /* category pages */
  /* const categoryView = document.getElementById("categoryView");
  const categoryPage = document.getElementById("categoryPage");
  const categoryTitle = document.getElementById("categoryTitle");
  const fileList = document.getElementById("fileList"); */
  const backButton = document.getElementById("backButton");

  // Mock file data per category
  const files = {
    Videos: ["Vacation.mp4", "Tutorial.mov", "MusicVideo.mp4"],
    Music: ["Chill.wav", "Beats.mp3", "Song.flac"],
    Photos: ["Beach.png", "Portrait.jpg", "Logo.svg"],
    Documents: ["Invoice.pdf", "Resume.docx", "Notes.txt"]
  };

  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      openCategory(category);
    });
  });

  /* backButton.addEventListener("click", () => {
    categoryPage.style.display = "none";
    categoryView.style.display = "grid";
  }); */

  function openCategory(category) {
    categoryTitle.textContent = category;
    /* categoryView.style.display = "none"; */
    categoryPage.style.display = "flex"; 

    // Populate file list
    fileList.innerHTML = "";
    files[category].forEach(file => {
      const ext = file.split('.').pop().toLowerCase();
      const icon = getFileIcon(ext);
      fileList.innerHTML += `
        <div class="file-item">
          <div class="thumbnail">${icon}</div>
          <div class="file-name">${file}</div>
        </div>`;
    });
  }

  function getFileIcon(ext) {
    const map = {
      mp4: "🎞️", mov: "🎬", wav: "🎧", mp3: "🎵",
      png: "🖼️", jpg: "📷", svg: "🪶",
      pdf: "📄", docx: "📝", txt: "📘", flac: "🎶"
    };
    return map[ext] || "📁";
  }
 // your existing JS code here
}); 
