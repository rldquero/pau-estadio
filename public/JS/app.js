const formulario = document.querySelector(".formulario");
const incidencias = document.getElementById("incidencias");
const cronologia = document.getElementById("cronologia");

const mapa = document.getElementById("mapa");
const marcadores = document.getElementById("marcadores");

const tipo = document.getElementById("tipo");
const zona = document.getElementById("zona");
const estado = document.getElementById("estado");
const descripcion = document.getElementById("descripcion");

const camposPci = document.getElementById("camposPci");
const fechaRevision = document.getElementById("fechaRevision");
const proximaRevision = document.getElementById("proximaRevision");
const empresa = document.getElementById("empresa");

const modoSafety = document.getElementById("modoSafety");
const modoPci = document.getElementById("modoPci");

const botonesOperativa = document.getElementById("botonesOperativa");
const tituloOperativa = document.getElementById("tituloOperativa");
const tituloFormulario = document.getElementById("tituloFormulario");
const tituloLista = document.getElementById("tituloLista");
const avisoModo = document.getElementById("avisoModo");
const leyenda = document.getElementById("leyenda");

let puntoSeleccionado = null;
let modoActual = "safety";

const tiposSafety = [
    {
        nombre:"Prevención Violencia",
        color:"#dc2626",
        clase:"rojo",
        icono:`<i class="fa-solid fa-shield-halved"></i>`
    },
    {
        nombre:"Cánticos",
        color:"#ea580c",
        clase:"naranja",
        icono:`<i class="fa-solid fa-bullhorn"></i>`
    },
    {
        nombre:"Lanzamientos",
        color:"#ca8a04",
        clase:"amarillo",
        icono:`<i class="fa-solid fa-baseball"></i>`
    },
    {
        nombre:"Asistencia Sanitaria",
        color:"#2563eb",
        clase:"azul",
        icono:`<i class="fa-solid fa-truck-medical"></i>`
    },
    {
        nombre:"Evacuación",
        color:"#16a34a",
        clase:"verde",
        icono:`<i class="fa-solid fa-person-running"></i>`
    }
];

const tiposPci = [
    {
        nombre:"Extintor",
        color:"#dc2626",
        clase:"rojo",
        icono:`<i class="fa-solid fa-fire-extinguisher"></i>`
    },
    {
        nombre:"BIE",
        color:"#2563eb",
        clase:"azul",
        icono:`<i class="fa-solid fa-droplet"></i>`
    },
    {
        nombre:"Alumbrado emergencia",
        color:"#f59e0b",
        clase:"amarillo",
        icono:`<i class="fa-solid fa-lightbulb"></i>`
    },
    {
        nombre:"Señalización evacuación",
        color:"#16a34a",
        clase:"verde",
        icono:`<i class="fa-solid fa-signs-post"></i>`
    },
    {
        nombre:"Pulsador alarma",
        color:"#7c3aed",
        clase:"morado",
        icono:`<i class="fa-solid fa-bell"></i>`
    },
    {
        nombre:"Central incendios",
        color:"#111827",
        clase:"negro",
        icono:`<i class="fa-solid fa-server"></i>`
    },
    {
        nombre:"DEA",
        color:"#2563eb",
        clase:"azul",
        icono:`<i class="fa-solid fa-heart-pulse"></i>`
    },
    {
        nombre:"Salida emergencia",
        color:"#16a34a",
        clase:"verde",
        icono:`<i class="fa-solid fa-door-open"></i>`
    },
    {
        nombre:"Incidencia técnica",
        color:"#64748b",
        clase:"gris",
        icono:`<i class="fa-solid fa-screwdriver-wrench"></i>`
    }
];

function cargarModo(modo){
    modoActual = modo;

    puntoSeleccionado = null;
    formulario.reset();

    marcadores.innerHTML = "";
    incidencias.innerHTML = "";
    cronologia.innerHTML = "";

    modoSafety.classList.remove("activo");
    modoPci.classList.remove("activo");

    if(modo === "safety"){
        modoSafety.classList.add("activo");
        camposPci.classList.add("oculto");

        tituloOperativa.textContent = "Operativa Safety";
        tituloFormulario.textContent = "Nueva incidencia Safety";
        tituloLista.textContent = "Incidencias registradas";
        avisoModo.textContent = "1. Selecciona tipo · 2. Pulsa sobre el plano · 3. Describe · 4. Guarda";

        pintarOpciones(tiposSafety);
    }

    if(modo === "pci"){
        modoPci.classList.add("activo");
        camposPci.classList.remove("oculto");

        tituloOperativa.textContent = "PAU / PCI / Mantenimiento";
        tituloFormulario.textContent = "Nuevo registro PAU / PCI";
        tituloLista.textContent = "Libro registro / mantenimiento";
        avisoModo.textContent = "Marca en el plano el elemento o incidencia técnica y registra revisión, estado, empresa y próxima fecha.";

        pintarOpciones(tiposPci);
    }
}

function pintarOpciones(lista){
    tipo.innerHTML = `<option value="">Tipo de registro</option>`;
    botonesOperativa.innerHTML = "";
    leyenda.innerHTML = "";

    lista.forEach(item => {
        const opcion = document.createElement("option");
        opcion.value = item.nombre;
        opcion.textContent = item.nombre;
        tipo.appendChild(opcion);

        const boton = document.createElement("button");
        boton.className = `btn ${item.clase}`;
        boton.dataset.tipo = item.nombre;
        boton.innerHTML = `${item.icono} ${item.nombre}`;
        botonesOperativa.appendChild(boton);

        boton.addEventListener("click", () => {
            tipo.value = item.nombre;
        });

        const leyendaItem = document.createElement("span");
        leyendaItem.innerHTML = `<b class="dot" style="background:${item.color}"></b> ${item.nombre}`;
        leyenda.appendChild(leyendaItem);
    });
}

function datosTipo(nombre){
    const lista = modoActual === "safety" ? tiposSafety : tiposPci;
    return lista.find(item => item.nombre === nombre) || {
        color:"#64748b",
        icono:`<i class="fa-solid fa-location-dot"></i>`
    };
}

modoSafety.addEventListener("click", () => cargarModo("safety"));
modoPci.addEventListener("click", () => cargarModo("pci"));

mapa.addEventListener("click", function(e){
    const rect = mapa.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    puntoSeleccionado = { x, y };

    zona.value = `Punto marcado (${x.toFixed(1)}%, ${y.toFixed(1)}%)`;

    crearMarcadorTemporal(x, y);
    descripcion.focus();
});

function crearMarcadorTemporal(x, y){
    const viejo = document.querySelector(".marcador-temporal");

    if(viejo){
        viejo.remove();
    }

    const marcador = document.createElement("div");
    marcador.className = "marcador marcador-temporal";
    marcador.innerHTML = `<i class="fa-solid fa-location-dot"></i>`;
    marcador.style.left = `${x}%`;
    marcador.style.top = `${y}%`;

    marcadores.appendChild(marcador);
}

formulario.addEventListener("submit", function(e){
    e.preventDefault();

    if(tipo.value === ""){
        alert("Selecciona un tipo de registro.");
        return;
    }

    if(!puntoSeleccionado){
        alert("Primero debes marcar un punto en el plano.");
        return;
    }

    const datos = datosTipo(tipo.value);

    const temporal = document.querySelector(".marcador-temporal");

    if(temporal){
        temporal.classList.remove("marcador-temporal");
        temporal.innerHTML = datos.icono;
        temporal.style.background = datos.color;
    }

    const hora = new Date().toLocaleTimeString([], {
        hour:"2-digit",
        minute:"2-digit"
    });

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-incidencia";
    tarjeta.style.borderLeft = `6px solid ${datos.color}`;

    let extraPci = "";

    if(modoActual === "pci"){
        extraPci = `
            <p><strong>Fecha revisión:</strong> ${fechaRevision.value || "No indicada"}</p>
            <p><strong>Próxima revisión:</strong> ${proximaRevision.value || "No indicada"}</p>
            <p><strong>Empresa / responsable:</strong> ${empresa.value || "No indicado"}</p>
        `;
    }

    tarjeta.innerHTML = `
        <div class="hora">${hora}</div>
        <h4>${datos.icono} ${tipo.value}</h4>
        <p><strong>Modo:</strong> ${modoActual === "safety" ? "Safety / Emergencias" : "PAU / PCI / Mantenimiento"}</p>
        <p><strong>Estado:</strong> <span class="etiqueta" style="background:${datos.color}">${estado.value}</span></p>
        <p><strong>Zona:</strong> ${zona.value}</p>
        ${extraPci}
        <p><strong>Observaciones:</strong> ${descripcion.value || "Sin observaciones."}</p>
    `;

    incidencias.prepend(tarjeta);

    const itemCrono = document.createElement("div");
    itemCrono.className = "item-crono";
    itemCrono.style.borderLeftColor = datos.color;

    itemCrono.innerHTML = `
        <strong>${hora}</strong> · ${datos.icono} ${tipo.value} · ${estado.value}
    `;

    cronologia.prepend(itemCrono);

    formulario.reset();
    puntoSeleccionado = null;
});

cargarModo("safety");