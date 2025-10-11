// Highlight sidebar selection
document.querySelectorAll('.sidebar ul li').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
    item.classList.add('active');
    const section = item.textContent.trim();
    document.querySelector('.path-bar span').textContent = section;
  });
});
