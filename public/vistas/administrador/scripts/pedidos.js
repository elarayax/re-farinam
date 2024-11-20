const socketPedidos = new WebSocket(`ws://${serverIP}:3000`); // Conexión WebSocket para pedidos
let currentSlide = 0;
let platosSeleccionadosContainer;

let pedidoNuevo = {
    id: 0,
    retiro: "",
    total: 0,
    nombreMozo: localStorage.getItem("usuario"),
    platos: [], // Lista de platos seleccionados
    estadoPedido: "",
    idZona: "",
    zona: "",
    idMesa: "",
    mesa: "", 
    cantidadPersonas: 0,
};

function crearPrimerSlide(container) {
    const slide = document.createElement('div');
    slide.classList.add('slide');

    const pregunta = document.createElement('h3');
    pregunta.textContent = "¿Qué tipo de venta deseas?";
    
    const opcionLlevar = document.createElement('button');
    opcionLlevar.textContent = "Venta para llevar";
    opcionLlevar.onclick = () => seleccionarOpcion("llevar");
    opcionLlevar.classList.add("button");
    opcionLlevar.classList.add("big-button");

    const opcionPresencial = document.createElement('button');
    opcionPresencial.textContent = "Venta presencial";
    opcionPresencial.onclick = () => seleccionarOpcion("presencial");
    opcionPresencial.classList.add("button");
    opcionPresencial.classList.add("big-button");

    slide.appendChild(pregunta);
    slide.appendChild(opcionLlevar);
    slide.appendChild(opcionPresencial);

    container.appendChild(slide);
}

function seleccionarOpcion(tipoVenta) {
    console.log("Opción seleccionada:", tipoVenta);
    pedidoNuevo.retiro = tipoVenta;
    if(tipoVenta == "llevar"){
        currentSlide += 1;
        mostrarSlide(currentSlide);
    }else if(tipoVenta == "presencial"){
        mostrarSlide(4);
    }
}

// Conexión abierta
socketPedidos.addEventListener('open', () => {
    console.log("Conectado al WebSocket de pedidos.");
});

// Manejo de mensajes recibidos
socketPedidos.addEventListener('message', function(event) {
    const mensaje = JSON.parse(event.data);
    if (mensaje.type === 'pedidosActivos') {
        generarMensaje("green", "Se actualizaron los pedidos activos");
        listarPedidos(mensaje.data);
    }
});

async function cargarPedidos() {
    try {
        const respuesta = await obtenerPedidosActivos(serverIP);
        listarPedidos(respuesta);
    } catch (error) {
        generarMensaje("red", `No se pudieron cargar los pedidos: ${error}`);
    }
}

cargarPedidos();

function listarPedidos(pedidos) {
    const tablaPedidos = document.getElementById("tablaPedidos");
    tablaPedidos.innerHTML = "";
    const tabla = document.createElement("table");
    tabla.classList.add("standar");
    tabla.innerHTML = `<thead><tr><th>Mesa</th><th>Estado</th><th>mesa</th><th></th></tr></thead>`;
    tablaPedidos.appendChild(tabla);
    const cuerpoTabla = document.createElement("tbody");
    pedidos.forEach(pedido => {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.textContent = pedido.id;
        const estadoPedido = document.createElement("td");
        estadoPedido.textContent = pedido.estadoPedido;
        const mesaPedido = document.createElement("td");
        mesaPedido.textContent = pedido.mesa;
        const acciones = document.createElement("td");
        const botonEditar = document.createElement("button");
        botonEditar.textContent = "Acciones";
        botonEditar.onclick = () => openModalAgregar(pedido.id);
        botonEditar.classList.add("button");
        botonEditar.classList.add("green-button");
        acciones.classList.add("celda-centrada");
        fila.appendChild(celda);
        acciones.appendChild(botonEditar);
        fila.appendChild(estadoPedido);
        fila.appendChild(mesaPedido);
        fila.appendChild(acciones);
        cuerpoTabla.appendChild(fila);
    });
    tabla.appendChild(cuerpoTabla);
}

/*async function llenarModalAgregar(id) {
    const tituloModal =  document.getElementById("tituloModalAgregar");
    const botonAcciones = document.getElementById("btnAccionesModal");
    const selectEstadoPedido = document.getElementById("estadoPedido");
    const estadosPedidos = await obtenerEstadosPedidos(serverIP);
    const idMesa = document.getElementById("idMesa");
    const pedidoPlatos = document.getElementById("pedidoPlatos");
    const eliminarPedido = document.getElementById("btnEliminarPedido");
    
    selectEstadoPedido.innerHTML = "";
    estadosPedidos.forEach(estadoPedido => {
        const option = document.createElement("option");
        option.value = estadoPedido.id;
        option.text = estadoPedido.estado;
        selectEstadoPedido.add(option);
    });
    
    if(id == null){
        tituloModal.innerText = "Agregar Pedido";
        botonAcciones.innerText = "Agregar Pedido";
        botonAcciones.onclick = () => agregarPedido();
        idMesa.value = "";
        pedidoPlatos.value = "";
        eliminarPedido.style.display = "none";
    } else {
        const pedidoEditar = await obtenerPedidoPorId(serverIP, id);
        tituloModal.innerText = `Editar Pedido: ${pedidoEditar.id}`;
        botonAcciones.innerText = "Editar Pedido";
        botonAcciones.onclick = () => editarPedido(id);
        idMesa.value = pedidoEditar.idMesa;
        pedidoPlatos.value = pedidoEditar.pedidos.join(", ");
        selectEstadoPedido.value = pedidoEditar.idEstadoPedido;
        eliminarPedido.onclick = () => deletePedido(pedidoEditar.id);
        eliminarPedido.style.display = "block";
        eliminarPedido.classList.add("button");
        eliminarPedido.classList.add("red-button");
    }
}*/

async function agregarPedido(){
    const idMesa = document.getElementById("idMesa").value;
    const pedidoPlatos = document.getElementById("pedidoPlatos").value.split(",");
    const estadoPedido = document.getElementById("estadoPedido").value;

    /*const nuevoPedido = {
        idMesa,
        pedidos: pedidoPlatos,
        idEstadoPedido: "en proceso"
    };*/

    crearPedido(serverIP, nuevoPedido);
    closeModalAgregar();
}

async function editarPedido(id) {
    const idMesa = document.getElementById("idMesa").value;
    const pedidoPlatos = document.getElementById("pedidoPlatos").value.split(",");
    const estadoPedido = document.getElementById("estadoPedido").value;

    const pedidoEditado = {
        idMesa,
        pedidos: pedidoPlatos,
        idEstadoPedido: estadoPedido
    };

    actualizarPedido(serverIP, id, pedidoEditado);
    closeModalAgregar();
}

async function deletePedido(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
        eliminarPedidoActivo(serverIP, id);
        closeModalAgregar();
    }
}

function openModalAgregar(id) {
    document.getElementById('modalAgregar').style.display = 'flex';
    if(id != null){
        currentSlide = 9;
    }
    mostrarSlide(currentSlide, id); // Mostrar la primer slide
    document.getElementById('navigationButtons').style.display = 'flex';
}

function closeModalAgregar() {
    document.getElementById('modalAgregar').style.display = 'none';
    currentSlide = 0;
}

function mostrarSlide(slideIndex, id) {
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = ''; // Limpiar el contenido actual

    switch(slideIndex) {
        case 0:
            crearPrimerSlide(questionsContainer);
            break;
        case 1:
            crearSegundoSlide(questionsContainer); // Llamar al segundo slide para agregar platos
            break;
        case 2:
            crearTercerSlide(questionsContainer);
            break;
        case 4:
            crearSlideZona(questionsContainer, serverIP);
            break;
        case 9:
            crearSlideEditarPedido(questionsContainer, serverIP, id);
            generarMensaje("green","editando pedido");
            break;
    }
}

async function generarPedido() {
    // Aquí puedes agregar la lógica para generar el pedido y enviarlo al servidor
    pedidoNuevo.estadoPedido = "generado";
    if(pedidoNuevo.mesa == ""){
        pedidoNuevo.idZona = "0";
        pedidoNuevo.zona = null,
        pedidoNuevo.idMesa = "0";
        pedidoNuevo.mesa = "para retirar";
    }
    console.log("Pedido generado:", pedidoNuevo);
    // Llamar a una función para enviar el pedido, por ejemplo:
    // enviarPedido(pedidoNuevo);

    crearPedidoActivo(serverIP, pedidoNuevo);
    closeModalAgregar();
}
