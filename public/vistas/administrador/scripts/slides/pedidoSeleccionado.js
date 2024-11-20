async function crearSlideEditarPedido(container, serverIP, id) {
    const slide = document.createElement('div');
    slide.classList.add('slide');

    // Título
    const titulo = document.createElement('h3');
    titulo.textContent = `Editar Pedido ID: ${id}`;
    slide.appendChild(titulo);

    try {
        // Obtener el pedido activo
        const pedido = await obtenerPedidoActivoPorId(serverIP, id);

        if (pedido) {
            // Mostrar información básica del pedido
            const infoPedido = document.createElement('div');
            infoPedido.classList.add('pedido-info');
            if(pedido.idMesa != 0){
                infoPedido.innerHTML = `
                    <p><strong>Mesa:</strong> ${pedido.mesa}</p>
                    <p><strong>Zona:</strong> ${pedido.zona}</p>
                    <p><strong>Estado:</strong> ${pedido.estadoPedido}</p>
                    <p><strong>Mozo:</strong> ${pedido.nombreMozo}</p>
                `;
            }else{
                infoPedido.innerHTML = `
                    <p><strong>Pedido:</strong> ${pedido.mesa}</p>
                    <p><strong>Estado:</strong> ${pedido.estadoPedido}</p>
                    <p><strong>Mozo:</strong> ${pedido.nombreMozo}</p>
                `;
            }
            slide.appendChild(infoPedido);

            // Crear tabla de platos
            const tablaPlatos = document.createElement('table');
            tablaPlatos.classList.add('standar');
            tablaPlatos.innerHTML = `
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Costo/Plato</th>
                        <th>Costo Total</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${pedido.platos.map(plato => `
                        <tr data-id="${plato.id}">
                            <td>${plato.nombre}</td>
                            <td>
                                <input type="number" min="1" value="${plato.cantidad}" class="input-cantidad">
                            </td>
                            <td>${plato.valor}</td>
                            <td class="costo-total">${plato.cantidad * plato.valor}</td>
                            <td>
                                <input type="text" value="${plato.observaciones}" class="input-observaciones">
                            </td>
                            <td>
                                <button class="eliminar-plato" data-id="${plato.id}">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            slide.appendChild(tablaPlatos);

            // Agregar eventos a los inputs y botones de la tabla
            tablaPlatos.querySelectorAll('.input-cantidad').forEach(inputCantidad => {
                inputCantidad.addEventListener('input', (e) => {
                    const fila = e.target.closest('tr');
                    const platoId = fila.getAttribute('data-id');
                    const nuevoValor = parseInt(e.target.value, 10);

                    // Actualizar el plato en el objeto pedido
                    const plato = pedido.platos.find(p => p.id == platoId);
                    if (plato) {
                        plato.cantidad = nuevoValor;

                        // Actualizar el costo total de la fila
                        const costoTotalElem = fila.querySelector('.costo-total');
                        costoTotalElem.textContent = plato.cantidad * plato.valor;
                    }
                });
            });

            tablaPlatos.querySelectorAll('.input-observaciones').forEach(inputObs => {
                inputObs.addEventListener('input', (e) => {
                    const fila = e.target.closest('tr');
                    const platoId = fila.getAttribute('data-id');
                    const nuevaObs = e.target.value;

                    // Actualizar las observaciones en el objeto pedido
                    const plato = pedido.platos.find(p => p.id == platoId);
                    if (plato) {
                        plato.observaciones = nuevaObs;
                    }
                });
            });

            tablaPlatos.querySelectorAll('.eliminar-plato').forEach(botonEliminar => {
                botonEliminar.addEventListener('click', (e) => {
                    const fila = e.target.closest('tr');
                    const platoId = fila.getAttribute('data-id');

                    // Remover plato del objeto pedido
                    pedido.platos = pedido.platos.filter(p => p.id != platoId);

                    // Remover fila de la tabla
                    fila.remove();
                });
            });

            // Crear sección para agregar nuevos platos
            const agregarPlatosSection = document.createElement('div');
            agregarPlatosSection.classList.add('agregar-platos-section');

            const inputPlato = document.createElement('input');
            inputPlato.type = 'text';
            inputPlato.placeholder = 'Escribe el nombre del plato...';
            inputPlato.id = "nombrePlato";
            inputPlato.addEventListener('input', () => mostrarPlatosPorNombre(inputPlato.value));

            const listaPlatos = document.createElement('div');
            listaPlatos.classList.add('platos-lista');

            agregarPlatosSection.appendChild(inputPlato);
            agregarPlatosSection.appendChild(listaPlatos);

            slide.appendChild(agregarPlatosSection);

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
                pedido.platos.push(platoConDatos);

                // Actualizar la lista de platos en la UI
                actualizarListaPlatos();
            }

            function actualizarListaPlatos() {
                // Limpiar el contenedor de platos seleccionados
                tablaPlatos.querySelector('tbody').innerHTML = '';
                
                // Iterar sobre los platos seleccionados y mostrarlos
                pedido.platos.forEach(plato => {
                    const platoRow = document.createElement('tr');
                    platoRow.setAttribute('data-id', plato.id);

                    platoRow.innerHTML = `
                        <td>${plato.nombre}</td>
                        <td>
                            <input type="number" value="${plato.cantidad}" min="1" class="input-cantidad">
                        </td>
                        <td>${plato.valor}</td>
                        <td class="costo-total">${plato.cantidad * plato.valor}</td>
                        <td>
                            <input type="text" value="${plato.observaciones}" class="input-observaciones">
                        </td>
                        <td>
                            <button class="eliminar-plato" data-id="${plato.id}">Eliminar</button>
                        </td>
                    `;

                    // Agregar la fila al cuerpo de la tabla
                    tablaPlatos.querySelector('tbody').appendChild(platoRow);
                });

                // Re-activar los eventos de edición de cantidad, observaciones y eliminación
                reactivarEventosEdicion();
            }

            function reactivarEventosEdicion() {
                tablaPlatos.querySelectorAll('.input-cantidad').forEach(inputCantidad => {
                    inputCantidad.addEventListener('input', (e) => {
                        const fila = e.target.closest('tr');
                        const platoId = fila.getAttribute('data-id');
                        const nuevoValor = parseInt(e.target.value, 10);

                        const plato = pedido.platos.find(p => p.id == platoId);
                        if (plato) {
                            plato.cantidad = nuevoValor;
                            const costoTotalElem = fila.querySelector('.costo-total');
                            costoTotalElem.textContent = plato.cantidad * plato.valor;
                        }
                    });
                });

                tablaPlatos.querySelectorAll('.input-observaciones').forEach(inputObs => {
                    inputObs.addEventListener('input', (e) => {
                        const fila = e.target.closest('tr');
                        const platoId = fila.getAttribute('data-id');
                        const nuevaObs = e.target.value;

                        const plato = pedido.platos.find(p => p.id == platoId);
                        if (plato) {
                            plato.observaciones = nuevaObs;
                        }
                    });
                });

                tablaPlatos.querySelectorAll('.eliminar-plato').forEach(botonEliminar => {
                    botonEliminar.addEventListener('click', (e) => {
                        const fila = e.target.closest('tr');
                        const platoId = fila.getAttribute('data-id');

                        pedido.platos = pedido.platos.filter(p => p.id != platoId);
                        fila.remove();
                    });
                });
            }

            // Finalizar pedido
            const botonFinalizar = document.createElement('button');
            botonFinalizar.textContent = 'Finalizar Pedido';
            botonFinalizar.classList.add('boton-finalizar');
            botonFinalizar.onclick = () => {
                // Calcular el total
                const total = pedido.platos.reduce((acc, plato) => acc + plato.valor * plato.cantidad, 0);
                const propina = total * 1.10; // 10% de propina

                // Mostrar la nueva slide con el total y la propina
                mostrarSlidePago(container, serverIP, total, propina, pedido);
            };

            slide.appendChild(botonFinalizar);
        } else {
            slide.innerHTML = '<p>No se encontró el pedido.</p>';
        }
    } catch (error) {
        console.error('Error al obtener el pedido:', error);
        slide.innerHTML = '<p>Error al cargar el pedido.</p>';
    }

    container.appendChild(slide);
}

async function mostrarSlidePago(container, serverIP, total, propinaCalculada, pedido) {
    if (!pedido) {
        console.error('No se encontró el pedido');
        return;
    }

    const slidePago = document.createElement('div');
    slidePago.classList.add('slide');

    const titulo = document.createElement('h3');
    titulo.textContent = `Finalizar Pedido ID: ${pedido.id}`;
    slidePago.appendChild(titulo);

    // Mostrar el total y la propina
    const resumen = document.createElement('div');
    resumen.innerHTML = `
        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
        <p><strong>Propina (10%):</strong> $${propinaCalculada.toFixed(2)}</p>
    `;
    slidePago.appendChild(resumen);

    // Obtener los métodos de pago de la API
    try {
        const metodosPago = await obtenerMetodosPago(serverIP);

        if (!metodosPago || metodosPago.length === 0) {
            console.error('No se encontraron métodos de pago');
            return;
        }

        // Formulario para métodos de pago
        const metodoPagoSection = document.createElement('div');
        metodoPagoSection.classList.add('metodo-pago');

        const metodoPagoLabel = document.createElement('label');
        metodoPagoLabel.textContent = 'Métodos de Pago:';
        metodoPagoSection.appendChild(metodoPagoLabel);

        const inputPago = document.createElement('input');
        inputPago.type = 'number';
        inputPago.placeholder = 'Monto';
        inputPago.id = 'montoPago';

        const metodoSelect = document.createElement('select');
        metodoSelect.id = 'metodoSelect';

        // Agregar los métodos de pago al select
        metodosPago.forEach(metodo => {
            const option = document.createElement('option');
            option.value = metodo.id;
            option.textContent = metodo.nombre;
            metodoSelect.appendChild(option);
        });

        metodoPagoSection.appendChild(inputPago);
        metodoPagoSection.appendChild(metodoSelect);
        slidePago.appendChild(metodoPagoSection);

        // Contenedor para los métodos de pago agregados
        const pagosAgregados = document.createElement('div');
        pagosAgregados.id = 'pagosAgregados';
        slidePago.appendChild(pagosAgregados);

        // Lista para guardar los métodos de pago agregados
        let pagos = [];

        // Función para agregar un método de pago
        const agregarMetodoPago = (metodoId, metodoNombre, monto) => {
            if (monto <= 0) return;

            // Crear un elemento para mostrar el pago agregado
            const pagoElement = document.createElement('div');
            pagoElement.textContent = `${metodoNombre}: $${monto.toFixed(2)}`;
            pagosAgregados.appendChild(pagoElement);

            // Guardar el pago en la lista
            pagos.push({ id: metodoId, nombre: metodoNombre, monto });
        };

        // Botón para agregar el método de pago
        const botonAgregarPago = document.createElement('button');
        botonAgregarPago.textContent = 'Agregar Pago';
        botonAgregarPago.onclick = () => {
            const monto = parseFloat(inputPago.value);
            const metodoId = parseInt(metodoSelect.value, 10);
            const metodo = metodosPago.find(m => m.id === metodoId);
            if (monto && metodo) {
                agregarMetodoPago(metodo.id, metodo.nombre, monto);
                inputPago.value = ''; // Limpiar el campo de monto
            }
        };
        slidePago.appendChild(botonAgregarPago);

        // Botón para finalizar el pedido
        const botonFinalizar = document.createElement('button');
        botonFinalizar.textContent = 'Finalizar Pago';
        botonFinalizar.classList.add('boton-finalizar');
        botonFinalizar.onclick = async () => {
            if (!pedido.id) {
                console.error('No se pudo acceder al ID del pedido');
                return;
            }

            // Validar si hay métodos de pago y suman el total
            const sumaPagos = pagos.reduce((acc, pago) => acc + pago.monto, 0);
            if (sumaPagos !== total) {
                alert('La suma de los métodos de pago debe ser igual al total');
                return;
            }

            // Preparar datos del pedido finalizado
            const dataFinalizar = {
                ...pedido, // Conservar datos existentes del pedido
                metodosPago: pagos, // Agregar métodos de pago
                total,              // Agregar el total
                propina: propinaCalculada, // Propina calculada
                estadoPedido: 'finalizado',
                horaTermino: new Date().toISOString(),
                fechaFinalizacion: new Date().toISOString()
            };

            try {
                const resultado = await finalizarPedidoActivo(serverIP, pedido.id, dataFinalizar);
                if (resultado) {
                    alert('Pedido Finalizado');
                    // Lógica adicional si es necesario
                } else {
                    alert('Hubo un error al finalizar el pedido');
                }
            } catch (error) {
                console.error('Error al finalizar el pedido:', error);
            }
        };
        slidePago.appendChild(botonFinalizar);

        container.innerHTML = '';  // Limpiar slide anterior
        container.appendChild(slidePago);
    } catch (error) {
        console.error('Error al obtener los métodos de pago:', error);
    }
}
