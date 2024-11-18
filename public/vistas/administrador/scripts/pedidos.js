const socketPedidos = new WebSocket(`ws://${serverIP}:3000`); // Conexión WebSocket para pedidos
let currentSlide = 0;
let platosSeleccionadosContainer;

let pedidoNuevo = {
    id: 0,
    retiro: "",
    platos: [] // Lista de platos seleccionados
};

// Conexión abierta
socketPedidos.addEventListener('open', () => {
    console.log("Conectado al WebSocket de pedidos.");
});

// Manejo de mensajes recibidos
socketPedidos.addEventListener('message', function(event) {
    const mensaje = JSON.parse(event.data);
    if (mensaje.type === 'pedido') {
        generarMensaje("green", "Se actualizaron los pedidos");
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

function listarPedidos(pedidos) {
    const tablaPedidos = document.getElementById("tablaPedidos");
    tablaPedidos.innerHTML = "";
    const tabla = document.createElement("table");
    tabla.classList.add("standar");
    tabla.innerHTML = `<thead><tr><th>Mesa</th><th>Estado</th><th></th></tr></thead>`;
    tablaPedidos.appendChild(tabla);
    const cuerpoTabla = document.createElement("tbody");
    pedidos.forEach(pedido => {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.textContent = pedido.idMesa;
        const estadoPedido = document.createElement("td");
        estadoPedido.textContent = pedido.estadoPedido;
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
        fila.appendChild(acciones);
        cuerpoTabla.appendChild(fila);
    });
    tabla.appendChild(cuerpoTabla);
}

async function llenarModalAgregar(id) {
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
        tituloModal.innerText = `Editar Pedido: ${pedidoEditar.idMesa}`;
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
}

async function agregarPedido(){
    const idMesa = document.getElementById("idMesa").value;
    const pedidoPlatos = document.getElementById("pedidoPlatos").value.split(",");
    const estadoPedido = document.getElementById("estadoPedido").value;

    const nuevoPedido = {
        idMesa,
        pedidos: pedidoPlatos,
        idEstadoPedido: "en proceso"
    };

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
        eliminarPedido(serverIP, id);
        closeModalAgregar();
    }
}

function openModalAgregar(id) {
    document.getElementById('modalAgregar').style.display = 'flex';
    mostrarSlide(currentSlide); // Mostrar la primer slide
    document.getElementById('navigationButtons').style.display = 'flex';
}

function closeModalAgregar() {
    document.getElementById('modalAgregar').style.display = 'none';
    currentSlide = 0;
}

function mostrarSlide(slideIndex) {
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = ''; // Limpiar el contenido actual

    switch(slideIndex) {
        case 0:
            crearPrimerSlide(questionsContainer);
            break;
        case 1:
            crearSegundoSlide(questionsContainer); // Llamar al segundo slide para agregar platos
            break;
    }
}

function crearPrimerSlide(container) {
    const slide = document.createElement('div');
    slide.classList.add('slide');

    const pregunta = document.createElement('h3');
    pregunta.textContent = "¿Qué tipo de venta deseas?";
    
    const opcionLlevar = document.createElement('button');
    opcionLlevar.textContent = "Venta para llevar";
    opcionLlevar.onclick = () => seleccionarOpcion("llevar");
    opcionLlevar.classList.add("button");

    const opcionPresencial = document.createElement('button');
    opcionPresencial.textContent = "Venta presencial";
    opcionPresencial.onclick = () => seleccionarOpcion("presencial");
    opcionPresencial.classList.add("button");

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
        generarMensaje("yellow", "se está creando presencial");
        closeModalAgregar();
    }
}

async function crearSegundoSlide(container) {
    const slide = document.createElement('div');
    slide.classList.add('slide');

    const pregunta = document.createElement('h3');
    pregunta.textContent = "¿Qué platos deseas agregar al pedido?";

    const inputPlato = document.createElement('input');
    inputPlato.type = 'text';
    inputPlato.placeholder = 'Escribe el nombre del plato...';
    inputPlato.id = "nombrePlato";
    inputPlato.addEventListener('input', () => mostrarPlatosPorNombre(inputPlato.value));

    const listaPlatos = document.createElement('div');
    listaPlatos.classList.add('platos-lista');

    const platosSeleccionadosContainer = document.createElement('div');
    platosSeleccionadosContainer.id = 'platosSeleccionados';
    platosSeleccionadosContainer.classList.add('platos-seleccionados-container');

    slide.appendChild(pregunta);
    slide.appendChild(inputPlato);
    slide.appendChild(listaPlatos);
    slide.appendChild(platosSeleccionadosContainer);

    container.appendChild(slide);

    async function mostrarPlatosPorNombre(nombre) {
        listaPlatos.innerHTML = '';

        if (nombre.trim() === '') return;

        const platosEncontrados = await buscarPlatoPorNombre(serverIP, nombre);
        if (platosEncontrados && platosEncontrados.length > 0) {
            platosEncontrados.forEach(plato => {
                const platoDiv = document.createElement('div');
                platoDiv.classList.add('plato');

                const nombrePlato = document.createElement('span');
                nombrePlato.textContent = plato.plato.nombre;

                const botonAgregar = document.createElement('button');
                botonAgregar.textContent = 'Agregar';
                botonAgregar.classList.add("button");
                botonAgregar.onclick = () => agregarPlatoAlPedido(plato);

                platoDiv.appendChild(nombrePlato);
                platoDiv.appendChild(botonAgregar);
                listaPlatos.appendChild(platoDiv);
            });
        } else {
            const noPlatos = document.createElement('span');
            noPlatos.textContent = 'No se encontraron platos';
            listaPlatos.appendChild(noPlatos);
        }
    }

    function agregarPlatoAlPedido(plato) {
        pedidoNuevo.platos.push(plato);
        actualizarListaPlatos();
    }

    function actualizarListaPlatos() {
        platosSeleccionadosContainer.innerHTML = '';
        pedidoNuevo.platos.forEach(plato => {
            const platoDiv = document.createElement('div');
            platoDiv.classList.add('plato-seleccionado');

            const nombrePlato = document.createElement('span');
            nombrePlato.textContent = plato.plato.nombre;

            const inputCantidad = document.createElement('input');
            inputCantidad.type = 'number';
            inputCantidad.placeholder = 'Cantidad';
            inputCantidad.value = 1;

            const inputObservaciones = document.createElement('input');
            inputObservaciones.type = 'text';
            inputObservaciones.placeholder = 'Observaciones';

            platoDiv.appendChild(nombrePlato);
            platoDiv.appendChild(inputCantidad);
            platoDiv.appendChild(inputObservaciones);

            const botonEliminarPlato = document.createElement("button");
            botonEliminarPlato.textContent = "Eliminar Plato";
            botonEliminarPlato.onclick = () => eliminarPlatoDelPedido(plato.id);
            platoDiv.appendChild(botonEliminarPlato);

            platosSeleccionadosContainer.appendChild(platoDiv);
        });
    }
}