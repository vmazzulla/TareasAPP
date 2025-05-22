//current-week.js

function obtenerSemanaActual() {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1)); // Asegura que siempre empiece en lunes

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6); // Termina en domingo

    return { inicio: inicioSemana, fin: finSemana };
}

function verificarCambioDeSemana() {
    const semanaActual = obtenerSemanaActual().inicio.toISOString().split("T")[0];
    const semanaGuardada = localStorage.getItem("ultimaSemana");

    if (semanaGuardada !== semanaActual) {
        const confirmacion = confirm("Ha comenzado una nueva semana. ¿Quieres borrar las mini-tareas completadas?");
        if (confirmacion) {
            localStorage.removeItem("completed-minitasks");
        }
        localStorage.setItem("ultimaSemana", semanaActual);
    }
}




function filtrarTareasSemanaActual() {
    const tareas = JSON.parse(localStorage.getItem("tasks")) || [];
    const { inicio, fin } = obtenerSemanaActual();

    const tareasSemana = tareas.filter(tarea => {
        if (tarea.date) {
            const fechaTarea = new Date(tarea.date);
            return fechaTarea >= inicio && fechaTarea <= fin;
        }
        return false;
    });

    return tareasSemana;
}

export function renderizarSemanaActual() {
    const tareasSemana = filtrarTareasSemanaActual();
    const miniTareas = JSON.parse(localStorage.getItem("minitasks")) || [];
    const miniTareasCompletadas = JSON.parse(localStorage.getItem("completed-minitasks")) || [];


    const listaTareas = document.getElementById("principaltasks-week-list");
    const listaMiniTareas = document.getElementById("minitasks-week");
    const listaMiniTareasCompletas = document.getElementById("completed-minitasks-week");

    listaTareas.innerHTML = tareasSemana.length > 0 
        ? tareasSemana.map(tarea => `<li>${tarea.name} - Vence el ${tarea.date}</li>`).join("")
        : `<p class="empty-message">No hay tareas programadas para esta semana</p>`;

    listaMiniTareas.innerHTML = miniTareas.map(tarea =>
        `<li><div>
            <input type="checkbox" onclick="completarMiniTarea('${tarea.id}')" />
            <span ondblclick="editarMiniTarea('${tarea.id}', this)">${tarea.name}</span></div>
            <button class="delete-minitask-btn" onclick="eliminarMiniTarea('${tarea.id}')">x</button>
        </li>`
    ).join("");

    listaMiniTareasCompletas.innerHTML = miniTareasCompletadas.map(tarea =>
        `<li>
            <div>
                <input type="checkbox" checked onclick="desmarcarMiniTarea('${tarea.id}')" />
                <span ondblclick="editarMiniTarea('${tarea.id}', this)">${tarea.name}</span>
            </div>
            <button class="delete-minitask-btn" onclick="eliminarMiniTarea('${tarea.id}')">x</button>
        </li>`).join("");
}

function agregarMiniTarea(nombre) {
    const miniTareas = JSON.parse(localStorage.getItem("minitasks")) || [];

    const nuevaMiniTarea = {
        id: Date.now().toString(36),
        name: nombre
    }

    miniTareas.push(nuevaMiniTarea);
    localStorage.setItem("minitasks", JSON.stringify(miniTareas));

    renderizarSemanaActual();
}

window. completarMiniTarea = function completarMiniTarea(id) {
    let miniTareas = JSON.parse(localStorage.getItem("minitasks")) || [];
    let miniTareasCompletadas = JSON.parse(localStorage.getItem("completed-minitasks")) || [];

    const tareaCompletada = miniTareas.find(tarea => tarea.id === id);
    if (!tareaCompletada) return;

    miniTareas = miniTareas.filter(tarea => tarea.id !== id);
    miniTareasCompletadas.push(tareaCompletada);

    localStorage.setItem("minitasks", JSON.stringify(miniTareas));
    localStorage.setItem("completed-minitasks", JSON.stringify(miniTareasCompletadas));

    renderizarSemanaActual();
}


window.eliminarMiniTarea = function eliminarMiniTarea(id) {
    let miniTareas = JSON.parse(localStorage.getItem("minitasks")) || [];
    let miniTareasCompletadas = JSON.parse(localStorage.getItem("completed-minitasks")) || [];

    const tareaAEliminar = [...miniTareas, ...miniTareasCompletadas].find(tarea => tarea.id === id);
    
    if (!tareaAEliminar) return;

    const confirmacion = confirm(`¿Seguro que deseas eliminar "${tareaAEliminar.name}"? Esta acción no se puede deshacer.`);
    
    if (!confirmacion) return; // Si el usuario cancela, no hacemos nada

    // Filtramos ambas listas
    miniTareas = miniTareas.filter(tarea => tarea.id !== id);
    miniTareasCompletadas = miniTareasCompletadas.filter(tarea => tarea.id !== id);

    // Guardamos los cambios en localStorage
    localStorage.setItem("minitasks", JSON.stringify(miniTareas));
    localStorage.setItem("completed-minitasks", JSON.stringify(miniTareasCompletadas));

    // Actualizamos la vista
    renderizarSemanaActual();
}

window.editarMiniTarea = function editarMiniTarea(id, elemento) {
    const miniTareas = JSON.parse(localStorage.getItem("minitasks")) || [];
    const tarea = miniTareas.find(t => t.id === id);
    if (!tarea) return;

    // Crear input para editar
    const input = document.createElement("input");
    input.type = "text";
    input.value = tarea.name;
    input.classList.add("edit-minitask");

    // Guardar cambios al salir del input
    input.addEventListener("blur", () => {
        tarea.name = input.value.trim() || tarea.name; // Evitar nombres vacíos
        localStorage.setItem("minitasks", JSON.stringify(miniTareas));
        renderizarSemanaActual();
    });

    // Reemplazar el `span` por el `input`
    elemento.replaceWith(input);
    input.focus();
}

window.desmarcarMiniTarea = function desmarcarMiniTarea(id) {
    let miniTareas = JSON.parse(localStorage.getItem("minitasks")) || [];
    let miniTareasCompletadas = JSON.parse(localStorage.getItem("completed-minitasks")) || [];

    const tareaDesmarcada = miniTareasCompletadas.find(tarea => tarea.id === id);
    if (!tareaDesmarcada) return;

    miniTareasCompletadas = miniTareasCompletadas.filter(tarea => tarea.id !== id);
    miniTareas.push(tareaDesmarcada);

    localStorage.setItem("minitasks", JSON.stringify(miniTareas));
    localStorage.setItem("completed-minitasks", JSON.stringify(miniTareasCompletadas));

    renderizarSemanaActual();
};



document.getElementById("miniTask-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const nombreMiniTarea = document.getElementById("miniTask-name").value.trim();
    if (!nombreMiniTarea) return;

    agregarMiniTarea(nombreMiniTarea);
    document.getElementById("miniTask-name").value = ""; // Limpia el campo después de agregar
});

document.getElementById("miniTask-name").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("miniTask-form").requestSubmit();
    }
});


document.addEventListener("DOMContentLoaded", () => {
    verificarCambioDeSemana();
    renderizarSemanaActual();
});
