const formulario = document.querySelector(".formulario");
const incidencias = document.getElementById("incidencias");

const mapa = document.getElementById("mapa");
const marcadores = document.getElementById("marcadores");

const tipo = document.getElementById("tipo");
const zona = document.getElementById("zona");
const descripcion = document.getElementById("descripcion");

let puntoSeleccionado = null;

mapa.addEventListener("click", function(e){

    const rect = mapa.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    puntoSeleccionado = { x, y };

    zona.value = `Punto marcado (${x.toFixed(1)}%, ${y.toFixed(1)}%)`;

    crearMarcadorTemporal(x, y);

});

function crearMarcadorTemporal(x, y){

    const viejo = document.querySelector(".marcador-temporal");

    if(viejo){
        viejo.remove();
    }

    const marcador = document.createElement("div");

    marcador.className = "marcador marcador-temporal";

    marcador.innerHTML = "X";

    marcador.style.left = `${x}%`;
    marcador.style.top = `${y}%`;

    marcadores.appendChild(marcador);

}

formulario.addEventListener("submit", function(e){

    e.preventDefault();

    if(!puntoSeleccionado){
        alert("Primero debes marcar un punto en el plano");
        return;
    }

    if(tipo.value === ""){
        alert("Selecciona un tipo de incidencia");
        return;
    }

    const temporal = document.querySelector(".marcador-temporal");

    let color = "#dc2626";
    let icono = "⚠️";

    if(tipo.value === "Prevención Violencia"){
        color = "#dc2626";
        icono = "⚠️";
    }

    if(tipo.value === "Cánticos"){
        color = "#ea580c";
        icono = "📢";
    }

    if(tipo.value === "Lanzamientos"){
        color = "#ca8a04";
        icono = "🟡";
    }

    if(tipo.value === "Asistencia Sanitaria"){
        color = "#2563eb";
        icono = "🚑";
    }

    if(tipo.value === "Evacuación"){
        color = "#16a34a";
        icono = "🚪";
    }

    if(temporal){

        temporal.classList.remove("marcador-temporal");

        temporal.innerHTML = icono;

        temporal.style.background = color;
    }

    const hora = new Date().toLocaleTimeString([], {
        hour:'2-digit',
        minute:'2-digit'
    });

    const tarjeta = document.createElement("div");

    tarjeta.className = "tarjeta-incidencia";

    tarjeta.style.borderLeft = `6px solid ${color}`;

    tarjeta.innerHTML = `
        <div class="hora">${hora}</div>

        <h4>${icono} ${tipo.value}</h4>

        <p><strong>Zona:</strong> ${zona.value}</p>

        <p>${descripcion.value}</p>
    `;

    incidencias.prepend(tarjeta);

    formulario.reset();

    puntoSeleccionado = null;

});