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

    const botonSiguiente = document.createElement('button');
    botonSiguiente.textContent = "Siguiente";
    botonSiguiente.classList.add("button");
    botonSiguiente.onclick = () => {
        currentSlide += 1;
        mostrarSlide(currentSlide);
    };

    slide.appendChild(pregunta);
    slide.appendChild(inputPlato);
    slide.appendChild(listaPlatos);
    slide.appendChild(platosSeleccionadosContainer);
    slide.appendChild(botonSiguiente);

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
        // Crear un objeto con el plato, la cantidad y las observaciones
        const platoConDatos = {
            id: plato.id,
            nombre: plato.plato.nombre,
            valor: plato.plato.precio,
            cantidad: 1, // Iniciar con cantidad 1
            observaciones: '' // Iniciar con observaciones vacías
        };
    
        // Agregar el plato al pedido
        pedidoNuevo.platos.push(platoConDatos);
    
        // Actualizar la lista de platos seleccionados
        actualizarListaPlatos();
    }

    function actualizarListaPlatos() {
        // Limpiar el contenedor de platos seleccionados
        platosSeleccionadosContainer.innerHTML = '';
        
        // Iterar sobre los platos seleccionados y mostrarlos
        pedidoNuevo.platos.forEach(plato => {
            const platoDiv = document.createElement('div');
            platoDiv.classList.add('plato-seleccionado');
    
            const nombrePlato = document.createElement('span');
            nombrePlato.textContent = plato.nombre;
    
            // Input para la cantidad
            const inputCantidad = document.createElement('input');
            inputCantidad.type = 'number';
            inputCantidad.value = plato.cantidad; // Mostrar la cantidad
            inputCantidad.min = 1;
            inputCantidad.addEventListener('input', (e) => {
                plato.cantidad = parseInt(e.target.value) || 1; // Actualizar la cantidad
            });
    
            // Input para las observaciones
            const inputObservaciones = document.createElement('input');
            inputObservaciones.type = 'text';
            inputObservaciones.placeholder = 'Observaciones';
            inputObservaciones.value = plato.observaciones; // Mostrar observaciones
            inputObservaciones.addEventListener('input', (e) => {
                plato.observaciones = e.target.value; // Actualizar las observaciones
            });
    
            // Botón para eliminar el plato del pedido
            const botonEliminarPlato = document.createElement('button');
            botonEliminarPlato.textContent = "Eliminar Plato";
            botonEliminarPlato.onclick = () => eliminarPlatoDelPedido(plato.id);
            
            platoDiv.appendChild(nombrePlato);
            platoDiv.appendChild(inputCantidad);
            platoDiv.appendChild(inputObservaciones);
            platoDiv.appendChild(botonEliminarPlato);
    
            platosSeleccionadosContainer.appendChild(platoDiv);
        });
    }

    function eliminarPlatoDelPedido(idPlato) {
        // Buscar el plato en el array de platos seleccionados y eliminarlo
        const index = pedidoNuevo.platos.findIndex(plato => plato.id === idPlato);
        if (index !== -1) {
            pedidoNuevo.platos.splice(index, 1);  // Eliminar el plato del array
        }
        
        // Actualizar la lista de platos seleccionados en la UI
        actualizarListaPlatos();
    }
}

function crearTercerSlide(container) {
    let total = 0;

    const slide = document.createElement('div');
    slide.classList.add('slide');

    const resumenTitulo = document.createElement('h3');
    resumenTitulo.textContent = "Resumen del Pedido";

    // Crear la tabla para mostrar los platos
    const tabla = document.createElement('table');
    tabla.classList.add('standar');

    // Crear encabezado de la tabla
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Nombre', 'Cantidad', 'Observaciones', 'Precio Unitario', 'Subtotal'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tabla.appendChild(thead);

    // Crear cuerpo de la tabla
    const tbody = document.createElement('tbody');
    pedidoNuevo.platos.forEach(plato => {
        const row = document.createElement('tr');

        // Crear celdas para cada propiedad
        const nombreCell = document.createElement('td');
        nombreCell.textContent = plato.nombre;

        const cantidadCell = document.createElement('td');
        cantidadCell.textContent = plato.cantidad;

        const observacionesCell = document.createElement('td');
        observacionesCell.textContent = plato.observaciones;

        const precioCell = document.createElement('td');
        precioCell.textContent = `$${parseFloat(plato.valor).toFixed(2)}`; // Precio unitario

        const subtotalCell = document.createElement('td');
        const subtotal = parseInt(plato.valor) * parseInt(plato.cantidad);
        subtotalCell.textContent = `$${subtotal.toFixed(2)}`;
        total += subtotal;

        // Agregar las celdas a la fila
        row.appendChild(nombreCell);
        row.appendChild(cantidadCell);
        row.appendChild(observacionesCell);
        row.appendChild(precioCell);
        row.appendChild(subtotalCell);

        // Agregar la fila al cuerpo de la tabla
        tbody.appendChild(row);
    });
    tabla.appendChild(tbody);

    // Mostrar el total del pedido
    const totalP = document.createElement('p');
    totalP.classList.add('total-resumen');
    totalP.innerText = `Total: $${total.toFixed(0)}`;
    pedidoNuevo.total = total;

    // Botón para generar el pedido
    const botonGenerarPedido = document.createElement('button');
    botonGenerarPedido.textContent = "Generar Pedido";
    botonGenerarPedido.classList.add("button");
    botonGenerarPedido.onclick = () => {
        generarPedido();
    };

    // Agregar elementos al slide
    slide.appendChild(resumenTitulo);
    slide.appendChild(tabla);
    slide.appendChild(totalP);
    slide.appendChild(botonGenerarPedido);

    container.appendChild(slide);
}