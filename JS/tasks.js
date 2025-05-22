//tasks.js

import { getCurrentDate, renderCalendar } from './calendar.js';
import { renderizarSemanaActual } from './current-week.js';

const currentDate = getCurrentDate();
let editingTaskId = null;

// Generador de IDs únicos
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const modalHTML = `
  <div id="modal" class="modal hidden task-modal">
    <div class="modal-content">
      <h2>Nueva Tarea</h2>
      <form id="task-form">
        <label>Nombre:</label>
        <input type="text" id="task-name" required>
        
        <label>Descripción:</label>
        <textarea id="task-desc"></textarea>
        
        <label>Fecha:</label>
        <input type="date" id="task-date">
        
        <label>Recordatorio:</label>
        <input type="datetime-local" id="task-reminder">
        
        <label>Categoría:</label>
        <select id="task-category"></select>
        
        <div class="modal-buttons">
          <button type="submit">Guardar</button>
          <button type="button" id="cancel-modal">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById('modal');
const newTaskBtn = document.getElementById('newTask-btn');
const cancelModalBtn = document.getElementById('cancel-modal');
const taskForm = document.getElementById('task-form');
const taskCategorySelect = document.getElementById('task-category');

//cargar categorias en el modal
function loadCategories() {
  const categories = JSON.parse(localStorage.getItem('categories')) || [];
  taskCategorySelect.innerHTML = categories.map(cat => `
    <option value="${cat.id}">${cat.name}</option>
    `).join('');
}

// Abrir modal para nueva tarea
newTaskBtn.addEventListener('click', () => {
  editingTaskId = null;
  document.querySelector('.modal-content h2').textContent = 'Nueva Tarea';
  taskForm.reset();
  loadCategories();
  modal.classList.remove('hidden');
});

// Cerrar modal
cancelModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Guardar tarea en localStorage
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const taskName = document.getElementById('task-name').value;
  const taskDesc = document.getElementById('task-desc').value;
  const taskDate = document.getElementById('task-date').value;
  const taskReminder = document.getElementById('task-reminder').value;
  const taskCategory = taskCategorySelect.value;
  
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  const newTask = {
    id: editingTaskId || generateId(),
    name: taskName,
    description: taskDesc,
    date: taskDate,
    reminder: taskReminder,
    category: taskCategory,
    completed: false
  };
  
  if (editingTaskId) {
    // Editar tarea existente
    const index = tasks.findIndex(task => task.id === editingTaskId);
    if (index !== -1) {
      newTask.completed = tasks[index].completed; // Mantener el estado completado
      tasks[index] = newTask;
    }
  } else {
    // Crear nueva tarea
    tasks.push(newTask);
  }
  
  localStorage.setItem('tasks', JSON.stringify(tasks));
  taskForm.reset();
  modal.classList.add('hidden');
  renderTasks();
  renderCalendar(currentDate);
});

export function filterTasksByCategory(categoryId) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const filteredTasks = categoryId === 'Todas' 
    ? tasks 
    : tasks.filter(task => task.category === categoryId);
  renderTasks(filteredTasks);
}

function renderTasks(filtered = null) {
  const taskList = document.getElementById('task-list');
  const completedTaskList = document.getElementById('completed-task-list');
  
  taskList.innerHTML = '';
  completedTaskList.innerHTML = '';
  
  const tasks = filtered || JSON.parse(localStorage.getItem('tasks')) || [];
  const categories = JSON.parse(localStorage.getItem('categories')) || [];

  const sortedTasks = sortTasksByDate(tasks);
  
  sortedTasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');
    
    if (task.completed) taskItem.classList.add('completed-task');

    const category = categories.find(cat => cat.id === task.category);
    const categoryName = category ? category.name : 'Sin categoria';
    const categoryColor = category ? category.color : '#aaa';
    
    taskItem.innerHTML = `
      <div class="task-content">
        <div class="complete-btn" data-id="${task.id}">◉</div>
        <div class="task-text">
          <strong>${task.name} <span id="category-tag" style="color: ${categoryColor}">#${categoryName}</span></strong>
          <p>${task.description}</p>
          <small>Fecha: ${task.date} | Recordatorio: ${task.reminder}</small>
        </div>
      </div>
      <button class="delete-task" data-id="${task.id}">x</button>
    `;
    
    if (task.completed) {
      completedTaskList.appendChild(taskItem);
    } else {
      taskList.appendChild(taskItem);
    }
    
    // Evento para editar tarea
    taskItem.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-task') || e.target.classList.contains('complete-btn')) return;
      
      editingTaskId = task.id;
      document.getElementById('task-name').value = task.name;
      document.getElementById('task-desc').value = task.description;
      document.getElementById('task-date').value = task.date;
      document.getElementById('task-reminder').value = task.reminder;
      
      loadCategories();
      taskCategorySelect.value = task.category;
      
      document.querySelector('.modal-content h2').textContent = 'Editar Tarea';
      modal.classList.remove('hidden');
    });
  });
  
  // Eventos para botones de completar
  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.getAttribute('data-id');
      toggleTaskComplete(taskId);
    });
  });
  
  // Eventos para botones de eliminar
  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.getAttribute('data-id');
      deleteTask(taskId);
    });
  });
}

// Completar/descompletar tarea
function toggleTaskComplete(taskId) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    renderCalendar(currentDate);
  }
}

// Eliminar tarea
function deleteTask(taskId) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) return;
  
  const taskName = tasks[taskIndex]?.name || "esta tarea";
  const confirmed = confirm(`¿Estás seguro de que deseas eliminar "${taskName}"? Esta acción no se puede deshacer.`);
  
  if (!confirmed) return;
  
  tasks = tasks.filter(task => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
  renderCalendar(currentDate);
}

// Ordenar tareas por fecha
function sortTasksByDate(tasks) {
  return tasks.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  loadCategories();
  
  const tabButtons = document.querySelectorAll('.tab-button');
  const taskList = document.getElementById('task-list');
  const completedList = document.getElementById('completed-task-list');
  const viewButtons = document.querySelectorAll('.cal-list');
  const tasksSection = document.querySelector('.tasks-section');
  const calendarSection = document.getElementById('calendar-section');
  
  // Cambio de pestañas (Pendientes/Completas)
  tabButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      if (idx === 0) {
        taskList.style.display = 'block';
        completedList.style.display = 'none';
      } else {
        taskList.style.display = 'none';
        completedList.style.display = 'block';
      }
    });
  });
  
  // Cambio de vista (Lista / Calendario / Semana actual)
  document.querySelectorAll(".view-btn.cal-list").forEach((btn, idx) => {
      btn.addEventListener("click", () => {
          const tasksSection = document.querySelector(".tasks-section");
          const calendarSection = document.getElementById("calendar-section");
          const semanaActualSection = document.getElementById("current-week-section");

          // Ocultar todas las vistas antes de activar la correcta
          tasksSection.style.display = "none";
          calendarSection.style.display = "none";
          semanaActualSection.style.display = "none"; // Oculta semana actual al cambiar de vista

          if (idx === 0) {
              tasksSection.style.display = "block"; // Mostrar Lista
          } else {
              calendarSection.style.display = "block"; // Mostrar Calendario
          }
      });
  });

  document.getElementById("current-week-btn").addEventListener("click", () => {
      const semanaActualSection = document.getElementById("current-week-section");
      const tasksSection = document.querySelector(".tasks-section");
      const calendarSection = document.getElementById("calendar-section");

      // Ocultar otras vistas
      tasksSection.style.display = "none";
      calendarSection.style.display = "none";

      // Alternar la visibilidad de la sección Semana Actual
      if (semanaActualSection.style.display === "none" || !semanaActualSection.style.display) {
          semanaActualSection.style.display = "flex";
          renderizarSemanaActual(); // Asegura que se actualicen las mini-tareas y tareas semanales
      } else {
          semanaActualSection.style.display = "none";
          tasksSection.style.display = "block"; // Volver a mostrar la vista de tareas por defecto
      }
  });

  
  // Vista inicial
  tasksSection.style.display = 'block';
  calendarSection.style.display = 'none';
});