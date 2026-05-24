let modo = "vigilante"

let elementosGuardados =
  JSON.parse(localStorage.getItem("elementos")) || []

let mensajesGuardados =
  JSON.parse(localStorage.getItem("mensajes")) || []

let cronologiaGuardada =
  JSON.parse(localStorage.getItem("cronologia")) || []

const mapa = L.map("map", {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 2
})

const ancho = 1200
const alto = 800
const bounds = [[0, 0], [alto, ancho]]

L.imageOverlay("/planos/plano-general.jpg", bounds).addTo(mapa)
mapa.fitBounds(bounds)

const iconos = {
  vigilante: "👮",
  auxiliar: "🦺",
  sanitario: "🚑",
  puerta: "🚪",
  extintor: "🧯",
  salida: "🟩",
  incidencia: "⚠️"
}

mapa.on("click", function(e){
  const tipo = modo
  const nombre = prompt(`Nombre o descripción para ${tipo}:`)
  if(!nombre) return

  const datos = {
    id: Date.now(),
    tipo,
    nombre,
    lat: e.latlng.lat,
    lng: e.latlng.lng
  }

  elementosGuardados.push(datos)
  guardarElementos()
  crearMarker(datos)
  registrarMensajeTexto(`Añadido ${tipo}: ${nombre}`)
})

function crearMarker(datos){
  const icono = L.divIcon({
    html: `<div class="punto">${iconos[datos.tipo]}</div>`,
    className:"",
    iconSize:[34,34]
  })

  const marker = L.marker([datos.lat, datos.lng], {
    icon:icono,
    draggable:true
  }).addTo(mapa)

  marker.bindPopup(`
    <b>${datos.tipo.toUpperCase()}</b><br>
    ${datos.nombre}<br><br>

    <button onclick="enviarMensajePunto('${datos.nombre}')">Mensaje</button>
    <button onclick="editarElemento(${datos.id})">Editar</button>
    <button onclick="eliminarElemento(${datos.id})">Eliminar</button>
  `)

  marker.on("dragend", function(e){
    datos.lat = e.target.getLatLng().lat
    datos.lng = e.target.getLatLng().lng
    guardarElementos()
  })
}

function guardarElementos(){
  localStorage.setItem("elementos", JSON.stringify(elementosGuardados))
}

function cargarElementos(){
  elementosGuardados.forEach(el => crearMarker(el))
}

function eliminarElemento(id){
  if(!confirm("¿Eliminar elemento?")) return

  elementosGuardados = elementosGuardados.filter(el => el.id !== id)
  guardarElementos()
  registrarMensajeTexto("Elemento eliminado")
  location.reload()
}

function editarElemento(id){
  const el = elementosGuardados.find(e => e.id === id)
  if(!el) return

  const nuevoNombre = prompt("Nuevo nombre:", el.nombre)
  if(!nuevoNombre) return

  el.nombre = nuevoNombre
  guardarElementos()
  location.reload()
}

function enviarMensaje(){
  const input = document.getElementById("mensajeInput")
  if(!input.value) return

  registrarMensajeTexto("Puesto de control: " + input.value)
  input.value = ""
}

function enviarMensajePunto(nombre){
  const texto = prompt("Mensaje para " + nombre)
  if(texto){
    registrarMensajeTexto("Mensaje a " + nombre + ": " + texto)
  }
}

function enviarProtocolo(tipo){
  registrarMensajeTexto("PROTOCOLO ACTIVADO: " + tipo)
}

function registrarMensajeTexto(texto){
  const mensaje = {
    id: Date.now(),
    tipo: "texto",
    hora: new Date().toLocaleTimeString(),
    contenido: texto
  }

  mensajesGuardados.push(mensaje)
  guardarMensajes()
  pintarMensaje(mensaje)
}

function enviarArchivo(event, tipo){
  const archivo = event.target.files[0]
  if(!archivo) return

  const reader = new FileReader()

  reader.onload = function(e){
    const mensaje = {
      id: Date.now(),
      tipo: tipo,
      hora: new Date().toLocaleTimeString(),
      nombre: archivo.name,
      contenido: e.target.result
    }

    mensajesGuardados.push(mensaje)
    guardarMensajes()
    pintarMensaje(mensaje)
  }

  reader.readAsDataURL(archivo)
  event.target.value = ""
}

function guardarMensajes(){
  localStorage.setItem("mensajes", JSON.stringify(mensajesGuardados))
}

function cargarMensajes(){
  mensajesGuardados.forEach(m => pintarMensaje(m))
}

function pintarMensaje(mensaje){
  const mensajes = document.getElementById("mensajes")
  const div = document.createElement("div")
  div.className = "msg"

  if(mensaje.tipo === "texto"){
    div.innerHTML = `
      <b>${mensaje.hora}</b><br>
      ${mensaje.contenido}
    `
  }

  if(mensaje.tipo === "foto"){
    div.innerHTML = `
      <b>${mensaje.hora}</b><br>
      FOTO: ${mensaje.nombre}<br>
      <img src="${mensaje.contenido}" class="media">
    `
  }

  if(mensaje.tipo === "video"){
    div.innerHTML = `
      <b>${mensaje.hora}</b><br>
      VÍDEO: ${mensaje.nombre}<br>
      <video src="${mensaje.contenido}" class="media" controls></video>
    `
  }

  mensajes.prepend(div)
}

function agregarCronologia(){
  const hora = document.getElementById("horaCronologia").value
  const texto = document.getElementById("textoCronologia").value

  if(!hora || !texto){
    alert("Introduce hora y actuación")
    return
  }

  const item = {
    id: Date.now(),
    hora,
    texto
  }

  cronologiaGuardada.push(item)
  guardarCronologia()
  pintarCronologia()

  document.getElementById("horaCronologia").value = ""
  document.getElementById("textoCronologia").value = ""
}

function guardarCronologia(){
  localStorage.setItem("cronologia", JSON.stringify(cronologiaGuardada))
}

function pintarCronologia(){
  const contenedor = document.getElementById("cronologia")
  contenedor.innerHTML = ""

  cronologiaGuardada.forEach(item => {
    const div = document.createElement("div")
    div.className = "msg"
    div.innerHTML = `
      <b>${item.hora}</b><br>
      ${item.texto}
      <br>
      <button onclick="eliminarCronologia(${item.id})">Eliminar</button>
    `
    contenedor.appendChild(div)
  })
}

function eliminarCronologia(id){
  cronologiaGuardada = cronologiaGuardada.filter(item => item.id !== id)
  guardarCronologia()
  pintarCronologia()
}

async function generarInformeFinal(){
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()

  const partido = document.getElementById("partidoNombre").value || "Partido no indicado"
  const fecha = document.getElementById("fechaPartido").value || "Fecha no indicada"
  const responsable = document.getElementById("responsablePartido").value || "Responsable no indicado"

  let y = 15

  doc.setFontSize(16)
  doc.text("INFORME FINAL DE PARTIDO", 15, y)
  y += 10

  doc.setFontSize(11)
  doc.text("Estadio Nuevo Pepico Amat", 15, y)
  y += 8
  doc.text("Partido / evento: " + partido, 15, y)
  y += 7
  doc.text("Fecha: " + fecha, 15, y)
  y += 7
  doc.text("Responsable operativo: " + responsable, 15, y)
  y += 12

  doc.setFontSize(14)
  doc.text("1. Distribución operativa", 15, y)
  y += 8

  doc.setFontSize(10)

  if(elementosGuardados.length === 0){
    doc.text("No constan elementos operativos registrados.", 15, y)
    y += 7
  } else {
    elementosGuardados.forEach(el => {
      if(y > 275){
        doc.addPage()
        y = 15
      }
      doc.text(`- ${el.tipo.toUpperCase()}: ${el.nombre}`, 15, y)
      y += 6
    })
  }

  y += 6
  doc.setFontSize(14)
  doc.text("2. Cronología del partido", 15, y)
  y += 8

  doc.setFontSize(10)

  if(cronologiaGuardada.length === 0){
    doc.text("No consta cronología registrada.", 15, y)
    y += 7
  } else {
    cronologiaGuardada.forEach(item => {
      if(y > 275){
        doc.addPage()
        y = 15
      }
      const lineas = doc.splitTextToSize(`${item.hora} - ${item.texto}`, 180)
      doc.text(lineas, 15, y)
      y += lineas.length * 6
    })
  }

  y += 6
  doc.setFontSize(14)
  doc.text("3. Mensajes y comentarios operativos", 15, y)
  y += 8

  doc.setFontSize(10)

  if(mensajesGuardados.length === 0){
    doc.text("No constan mensajes registrados.", 15, y)
    y += 7
  } else {
    for(const m of mensajesGuardados){
      if(y > 260){
        doc.addPage()
        y = 15
      }

      if(m.tipo === "texto"){
        const lineas = doc.splitTextToSize(`${m.hora} - ${m.contenido}`, 180)
        doc.text(lineas, 15, y)
        y += lineas.length * 6
      }

      if(m.tipo === "foto"){
        doc.text(`${m.hora} - Fotografía recibida: ${m.nombre}`, 15, y)
        y += 6

        try{
          doc.addImage(m.contenido, "JPEG", 15, y, 70, 50)
          y += 56
        } catch(e){
          doc.text("No se pudo insertar la imagen en el PDF.", 15, y)
          y += 6
        }
      }

      if(m.tipo === "video"){
        doc.text(`${m.hora} - Vídeo recibido: ${m.nombre}`, 15, y)
        y += 6
        doc.text("El vídeo queda registrado en la aplicación. No se incrusta en el PDF.", 15, y)
        y += 8
      }
    }
  }

  y += 6

  if(y > 240){
    doc.addPage()
    y = 15
  }

  doc.setFontSize(14)
  doc.text("4. Valoración final", 15, y)
  y += 8

  doc.setFontSize(10)
  doc.text("Observaciones finales:", 15, y)
  y += 20
  doc.line(15, y, 195, y)
  y += 12
  doc.line(15, y, 195, y)
  y += 18

  doc.text("Firma responsable operativo:", 15, y)
  y += 20
  doc.line(15, y, 90, y)

  doc.save("Informe_Final_Partido.pdf")
}

cargarElementos()
cargarMensajes()
pintarCronologia()