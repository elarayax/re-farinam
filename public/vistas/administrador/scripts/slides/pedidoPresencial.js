async function crearSlideZona(container, serverIP) {
    const slide = document.createElement('div');
    slide.classList.add('slide');

    const titulo = document.createElement('h3');
    titulo.textContent = "Selecciona la zona y la mesa";

    // Crear el selector de zonas
    const selectZona = document.createElement('select');
    selectZona.id = "selectZona";
    selectZona.addEventListener('change', async () => {
        const zonaId = selectZona.value;
        if (zonaId) {
            await actualizarSelectMesas(serverIP, zonaId);
        }
    });

    // Crear el selector de mesas
    const selectMesa = document.createElement('select');
    selectMesa.id = "selectMesa";
    selectMesa.disabled = true; // Desactivado hasta que se seleccione una zona

    const cantidadPersonas = document.createElement("input");
    cantidadPersonas.type = "number";
    cantidadPersonas.id = "cantidadPersonas";
    cantidadPersonas.placeholder = "Cantidad de personas";
    cantidadPersonas.required = true
    cantidadPersonas.min = 1
    cantidadPersonas.max = 20
    cantidadPersonas.step = 1
    cantidadPersonas.value = 1
    cantidadPersonas.onchange = () => {
        pedidoNuevo.cantidadPersonas = cantidadPersonas.value;
    }

    // Botón siguiente
    const botonSiguiente = document.createElement('button');
    botonSiguiente.textContent = "Siguiente";
    botonSiguiente.classList.add("button");
    botonSiguiente.onclick = () => {
        const zonaSeleccionada = selectZona.options[selectZona.selectedIndex].text;
        const mesaSeleccionada = selectMesa.options[selectMesa.selectedIndex].text;
        console.log("Mesa seleccionada:", mesaSeleccionada);
        const cantidad = cantidadPersonas.value;
        if (!cantidad || cantidad < 1 || cantidad > 20) {
            alert("Por favor ingresa una cantidad de personas válida (entre 1 y 20).");
            return;
        }
        if (zonaSeleccionada && mesaSeleccionada) {
            alert(`Zona: ${zonaSeleccionada}, Mesa: ${mesaSeleccionada}`);
            pedidoNuevo.mesa = mesaSeleccionada;
            pedidoNuevo.zona = zonaSeleccionada;
            pedidoNuevo.idMesa = parseInt(selectMesa.value);
            pedidoNuevo.idZona = parseInt(selectZona.value);
            pedidoNuevo.cantidadPersonas = parseInt(cantidad);
            currentSlide += 1;
            mostrarSlide(currentSlide);
        } else {
            alert("Por favor selecciona una zona y una mesa.");
        }
    };

    // Agregar elementos al slide
    slide.appendChild(titulo);
    slide.appendChild(selectZona);
    slide.appendChild(selectMesa);
    slide.appendChild(cantidadPersonas);
    slide.appendChild(botonSiguiente);

    container.appendChild(slide);

    // Cargar zonas
    await cargarZonas(serverIP);

    // Función para cargar zonas en el selector
    async function cargarZonas(serverIP) {
        const zonas = await obtenerZonas(serverIP);
        if (zonas && zonas.length > 0) {
            selectZona.innerHTML = '<option value="">Seleccione una zona</option>';
            zonas.forEach(zona => {
                const option = document.createElement('option');
                option.value = zona.id;
                option.textContent = zona.nombre;
                selectZona.appendChild(option);
            });
        } else {
            selectZona.innerHTML = '<option value="">No hay zonas disponibles</option>';
        }
    }

    // Función para actualizar las mesas en el selector
    async function actualizarSelectMesas(serverIP, zonaId) {
        const mesas = await obtenerMesasDeZona(serverIP, zonaId);
        if (mesas && mesas.length > 0) {
            selectMesa.innerHTML = '<option value="">Seleccione una mesa</option>';
            mesas.forEach(mesa => {
                if(mesa.estado === "disponible"){
                    const option = document.createElement('option');
                    option.value = mesa.id;
                    option.textContent = `${mesa.numero}`;
                    selectMesa.appendChild(option);
                }
            });
            selectMesa.disabled = false;
        } else {
            selectMesa.innerHTML = '<option value="">No hay mesas disponibles</option>';
            selectMesa.disabled = true;
        }
    }
}