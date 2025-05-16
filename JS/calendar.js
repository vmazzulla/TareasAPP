// calendar.js

const calendarGrid = document.querySelector('.calendar-grid');
const calendarTitle = document.getElementById('calendar-title');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');

let currentDate = new Date();

export function getCurrentDate() {
    return currentDate;
}


function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

document.addEventListener('DOMContentLoaded', () => {

    // Navegación entre meses
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // Inicial
    renderCalendar(currentDate);
});

export function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        let startDay = firstDayOfMonth.getDay(); // 0 (domingo) - 6 (sábado)

        startDay = (startDay === 0) ? 6 : startDay - 1;

        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        calendarTitle.textContent = `${monthNames[month]} ${year}`;
        calendarGrid.innerHTML = ''; // Limpiar calendario previo

        const tasks = getTasks(); // 🔄 Asegúrate de tener esta función disponible

        // 🟠 Días del mes anterior
        for (let i = startDay - 1; i >= 0; i--) {
            const day = lastDayOfPrevMonth - i;
            const cell = document.createElement('div');
            cell.classList.add('day-cell', 'prev-month');
            cell.textContent = day;
            calendarGrid.appendChild(cell);
        }

        // 🟢 Días del mes actual
        for (let i = 1; i <= lastDayOfMonth; i++) {
            const cell = document.createElement('div');
            cell.classList.add('day-cell');

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            if (dateStr === todayStr) {
                cell.classList.add('today');
            }

            // Número del día
            const dayNumber = document.createElement('div');
            dayNumber.textContent = i;
            dayNumber.style.fontWeight = 'bold';
            cell.appendChild(dayNumber);

            // 📌 Tareas del día
            const dayTasks = tasks.filter(t => t.date === dateStr);
            dayTasks.forEach(t => {
                const taskDiv = document.createElement('div');
                taskDiv.classList.add('task-item-calendar');

                const nameEl = document.createElement('div');
                nameEl.textContent = '• ' + t.name;
                nameEl.classList.add('task-name')

                const categoryEl = document.createElement('div');
                categoryEl.textContent = '#' + t.category;
                categoryEl.classList.add('task-category');

                taskDiv.appendChild(nameEl);
                taskDiv.appendChild(categoryEl);
                cell.appendChild(taskDiv);
            });

            calendarGrid.appendChild(cell);
        }

        // 🔴 Días del mes siguiente
        const totalCells = startDay + lastDayOfMonth;
        const remainingCells = 7 - (totalCells % 7 === 0 ? 7 : totalCells % 7);

        for (let i = 1; i <= remainingCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('day-cell', 'next-month');
            cell.textContent = i;
            calendarGrid.appendChild(cell);
        }
    }
