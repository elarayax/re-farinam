const socketeMetodosPago = new WebSocket(`ws://${serverIP}:3000`); 

socketeMetodosPago.addEventListener('message', function(event) {
    console.log("Mensaje recibido:", event.data);
    const mensaje = JSON.parse(event.data);
    if (mensaje.type === 'metodoPago') {
        generarMensaje("green", "Se actualizaron los métodos de pago");
        listarMetodosPago(mensaje.data);
    }
});

function addMetodoPago() {
    const nombre = document.getElementById("nombreMetodoPago");
    const comision = document.getElementById("comisionMetodoPago");

    const nuevoNombre = nombre.value.trim();
    if (!nuevoNombre) {
        generarMensaje("red", "El nombre del metodo de pago no puede estar vacío");
        return;
    }

    const nuevaComision = parseFloat(comision.value); // Cambié parseInt por parseFloat para permitir decimales.

    // Verificar si es un número y no es NaN
    if (isNaN(nuevaComision)) {
        generarMensaje("red", "La comisión del metodo de pago tiene que ser número");
        return;
    }

    // Verificar que la comisión no sea negativa si es necesario
    if (nuevaComision < 0) {
        generarMensaje("red", "La comisión no puede ser negativa");
        return;
    }

    let nuevoMetodoPago = {
        nombre: nuevoNombre,
        comision: nuevaComision
    };

    crearMetodoPago(serverIP, nuevoMetodoPago);
}

async function cargarMetodosPago (){
    try{
        const respuesta = await obtenerMetodosPago(serverIP);
        console.log(respuesta);
        listarMetodosPago(respuesta);
    } catch (error){
        generarMensaje("red", `no se pudieron cargar los metodos de pago: ${error}` )
    }
}

cargarMetodosPago();

function listarMetodosPago(metodosPago){
    const tablaUSuarios = document.getElementById("metodosPagoList");
    tablaUSuarios.innerHTML = "";
    const tabla = document.createElement("table");
    tabla.classList.add("standar")
    tabla.innerHTML = `<thead><tr><th>nombre</th><th>comisión</th><th></th></tr></thead>`;
    tablaUSuarios.appendChild(tabla);
    const cuerpoTabla = document.createElement("tbody");
    metodosPago.forEach(metodo => {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.textContent = metodo.nombre;
        const tipoUsuario = document.createElement("td");
        tipoUsuario.textContent = metodo.comision;
        const acciones = document.createElement("td");  
        const botonEditar = document.createElement("button");
        botonEditar.textContent = "Acciones";
        //botonEditar.onclick = () => openModalAgregar(usuario.id);
        botonEditar.classList.add("button");
        botonEditar.classList.add("blue-button");
        acciones.classList.add("celda-centrada");
        fila.appendChild(celda);
        acciones.appendChild(botonEditar);
        fila.appendChild(tipoUsuario);
        fila.appendChild(acciones);
        cuerpoTabla.appendChild(fila);
    });
    tabla.appendChild(cuerpoTabla);
}