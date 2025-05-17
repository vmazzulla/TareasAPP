
  const menuToggleBtn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  menuToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-hidden');
  });

