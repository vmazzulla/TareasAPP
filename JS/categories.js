//categories.js

import { filterTasksByCategory } from './tasks.js';

const categoryForm = document.getElementById('category-form');
const categoryInput = categoryForm.querySelector('input');
const categoryColorInput = categoryForm.querySelector('input[type="color"]');
const categoryList = document.querySelector('.category-list');

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  categoryColorInput.value = '#1e90ff'
});

categoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newCategoryName = categoryInput.value.trim();
  const newCategoryColor = categoryColorInput.value;

  if (!newCategoryName) return;

  let categories = JSON.parse(localStorage.getItem('categories')) || [];

  const nameExists = categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase());
  if (nameExists) {
    alert('La categoría ya existe.');
    return;
  }

  const newCategory = {
    id: crypto.randomUUID(), // ← Genera un ID único
    name: newCategoryName,
    color: newCategoryColor
  };

  categories.push(newCategory);
  localStorage.setItem('categories', JSON.stringify(categories));

  categoryInput.value = '';
  categoryColorInput.value = '#1e90ff'; // reset color

  renderCategories();
});

function renderCategories() {
  const categories = JSON.parse(localStorage.getItem('categories')) || [];

  // Siempre incluimos "Todas"
  categoryList.innerHTML = `
    <li class="category-item active">
      <button class="category-button">Todas</button>
    </li>
  `;

  categories.forEach(({ name, color, id }) => {
    const li = document.createElement('li');
    li.classList.add('category-item');
    li.innerHTML = `
      <button class="category-button" data-id="${id}" style="color: ${color}">${name}</button>
      <button class="delete-category-btn">x</button>
    `;
    categoryList.appendChild(li);
  });

  renderCategoryOptions(); // ← importante
}

categoryList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-category-btn')) {
    const li = e.target.closest('.category-item');
    const categoryName = li.querySelector('.category-button').textContent;

    if (!confirm(`¿Eliminar la categoría "${categoryName}"?`)) return;

    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories = categories.filter(cat => cat.name !== categoryName);
    localStorage.setItem('categories', JSON.stringify(categories));

    renderCategories();
    return;
  }

  if (e.target.classList.contains('category-button')) {
    document.querySelectorAll('.category-item').forEach(item =>
      item.classList.remove('active')
    );

    const selectedItem = e.target.closest('.category-item');
    selectedItem.classList.add('active');

    const selectedCategory = e.target.dataset.id || 'Todas';
    filterTasksByCategory(selectedCategory); // Esta línea ya debería funcionar correctamente
  }
});



//función que renderice las categorías en el select
function renderCategoryOptions() {
  const categorySelect = document.getElementById('task-category');
  if (!categorySelect) return;

  const categories = JSON.parse(localStorage.getItem('categories')) || [];

  categorySelect.innerHTML = `
    <option value="Todas">Todas</option>
    ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
  `;
}

