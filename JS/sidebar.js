
  const menuToggleBtn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  menuToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-hidden');
  });

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");

  if (window.innerWidth <= 768) {
    sidebar.classList.add("sidebar-hidden");
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.add("sidebar-hidden");
    } else {
      sidebar.classList.remove("sidebar-hidden");
    }
  });
});
