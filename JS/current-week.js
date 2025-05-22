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

    listaTareas.innerHTML = tareasSemana.map(tarea => `<li>${tarea.name} - Vence el ${tarea.date}</li>`).join("");
    listaMiniTareas.innerHTML = miniTareas.map(tarea =>
        `<li><div>
            <button id="complete-minitask-btn" onclick="completarMiniTarea('${tarea.id}')">▢</button>
            ${tarea.name}</div>
            <button class="delete-minitask-btn" onclick="eliminarMiniTarea('${tarea.id}')">x</button>
        </li>`
    ).join("");
    listaMiniTareasCompletas.innerHTML = miniTareasCompletadas.map(tarea =>
        `<li>${tarea.name} <button class="delete-minitask-btn" onclick="eliminarMiniTarea('${tarea.id}')">x</button></li>`).join("");
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



//cambiar a vista de Semana actual





document.addEventListener("DOMContentLoaded", () => {
    verificarCambioDeSemana();
    renderizarSemanaActual();
});
