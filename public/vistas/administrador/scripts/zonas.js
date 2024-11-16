// Suponiendo que tienes un elemento de lista para mostrar las zonas
const zonasList = document.getElementById('zonasList'); // Asegúrate de que este ID coincida con tu HTML

// Obtener la IP del servidor desde localStorage o usar localhost como fallback
const serverIP = localStorage.getItem('serverIP') || 'localhost';

// Conexión al WebSocket
const socket = new WebSocket(`ws://${serverIP}:3000`); // Cambia la URL según sea necesario

// Escuchar mensajes del WebSocket
socket.addEventListener('message', function(event) {
    const mensaje = JSON.parse(event.data);
    console.log('Mensaje recibido:', mensaje); // Añadir esto para depuración

    if (mensaje.type === 'zonas') {
        const zonas = mensaje.data;
        console.log('Zonas recibidas:', zonas); // Añadir esto para depuración
        actualizarListaZonas(zonas);
    }
});

// Función para actualizar la lista de zonas en el DOM
function actualizarListaZonas(zonas) {
    if (!Array.isArray(zonas)) {
        console.error('La respuesta de zonas no es un array:', zonas);
        return;
    }

    zonasList.innerHTML = ''; // Limpiar la lista antes de agregar nuevas zonas
    
    zonas.forEach(zona => {
        // Crear contenedor para cada zona
        const zonaContainer = document.createElement('div');
        zonaContainer.className = 'zona-container';

        // Nombre de la zona
        const zonaNombre = document.createElement('h3');
        zonaNombre.textContent = zona.nombre;
        zonaContainer.appendChild(zonaNombre);

        // Botón de editar y eliminar
        const editarBtn = crearBotonEditar(zona);
        const eliminarBtn = crearBotonEliminar(zona);

        zonaContainer.appendChild(editarBtn);
        zonaContainer.appendChild(eliminarBtn);

        // Tabla de mesas para la zona
        const mesasTabla = document.createElement('table');
        mesasTabla.className = 'mesas-tabla';
        mesasTabla.innerHTML = `
            <thead>
                <tr>
                    <th>Número de Mesa</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="mesas-${zona.id}">
                ${Array.isArray(zona.mesas) ? zona.mesas.map(mesa => `
                    <tr>
                        <td>${mesa.numero}</td>
                        <td>${mesa.estado}</td>
                        <td><button class="eliminarMesa" data-zona="${zona.id}" data-nombre-mesa="${mesa.numero}" data-mesa="${mesa.id}" onclick="eliminarMesa(${zona.id}, ${mesa.id})">Eliminar Mesa</button></td>
                    </tr>
                `).join('') : 'No hay mesas disponibles'}
            </tbody>
        `;
        zonaContainer.appendChild(mesasTabla);

        // Botón para agregar una mesa en esta zona
        const agregarMesaBtn = document.createElement('button');
        agregarMesaBtn.textContent = 'Agregar Mesa';
        agregarMesaBtn.onclick = function() {
            const numeroMesa = prompt('Ingrese el número de la mesa:');
            if (numeroMesa) {
                const estadoMesa = 'Disponible'; // Estado inicial
                agregarMesa(zona.id, numeroMesa, estadoMesa);
            }
        };
        zonaContainer.appendChild(agregarMesaBtn);

        // Añadir el contenedor de la zona a la lista de zonas
        zonasList.appendChild(zonaContainer);
    });
}

// Función para eliminar una mesa
function eliminarMesa(zonaId, numeroMesa, nombreMesa) {
    if (confirm(`¿Estás seguro de que deseas eliminar la mesa ${nombreMesa}?`)) {
        fetch(`http://${serverIP}:3000/api/zonas/${zonaId}/mesas/${numeroMesa}`, { // Asegúrate de que la URL sea correcta
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                console.log('Mesa eliminada con éxito');
                socket.send(JSON.stringify({ type: 'zonas', data: [] })); // Enviar actualización de zonas por WebSocket
            } else {
                throw new Error('Error al eliminar la mesa');
            }
        })
        .catch(error => {
            console.error('Error al eliminar la mesa:', error);
        });
    }
}


function editarMesa(idZona, numeroMesa) {
    const nuevoEstado = prompt('Nuevo estado para la mesa (disponible, ocupada, etc.):');
    if (nuevoEstado) {
        fetch(`http://${serverIP}:3000/api/zonas/${idZona}/mesas/${numeroMesa}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Mesa actualizada:', data);
            socket.send(JSON.stringify({ type: 'zonas', data: [] })); // Enviar actualización de zonas por WebSocket
            cargarZonas(); // Recargar zonas después de editar la mesa
        })
        .catch(error => {
            console.error('Error al editar la mesa:', error);
        });
    }
}

// Función para crear el botón de editar
function crearBotonEditar(zona) {
    const editarBtn = document.createElement('button');
    editarBtn.textContent = 'Editar';
    editarBtn.classList.add('editar');
    editarBtn.onclick = function() {
        const nuevoNombre = prompt('Nuevo nombre de la zona:', zona.nombre);
        if (nuevoNombre) {
            actualizarZona(zona.id, nuevoNombre);
        }
    };
    return editarBtn;
}

// Función para crear el botón de eliminar
function crearBotonEliminar(zona) {
    const eliminarBtn = document.createElement('button');
    eliminarBtn.textContent = 'Eliminar';
    eliminarBtn.classList.add('eliminar');
    eliminarBtn.onclick = function() {
        if (confirm('¿Estás seguro de que deseas eliminar esta zona?')) {
            eliminarZona(zona.id);
        }
    };
    return eliminarBtn;
}

// Función para actualizar una zona
function actualizarZona(id, nuevoNombre) {
    fetch(`http://${serverIP}:3000/api/zonas/${id}`, { // Cambia la URL según sea necesario
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nuevoNombre }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Zona actualizada:', data);
        socket.send(JSON.stringify({ type: 'zonas', data: [data] })); // Enviar a través de WebSocket
    })
    .catch(error => {
        console.error('Error al actualizar la zona:', error);
    });
}

// Función para eliminar una zona
function eliminarZona(id) {
    fetch(`http://${serverIP}:3000/api/zonas/${id}`, { // Cambia la URL según sea necesario
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log('Zona eliminada con éxito');
            socket.send(JSON.stringify({ type: 'zonas', data: [] })); // Enviar actualización de zonas por WebSocket
        } else {
            throw new Error('Error al eliminar la zona');
        }
    })
    .catch(error => {
        console.error('Error al eliminar la zona:', error);
    });
}

// Función para agregar una mesa
function agregarMesa(idZona, numeroMesa, estadoMesa) {
    fetch(`http://${serverIP}:3000/api/zonas/${idZona}/mesas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numero: numeroMesa, estado: estadoMesa })
    })
    .then(response => response.json())
    .then(data => {
        socket.send(JSON.stringify({ type: 'zonas', data: [data] }));
        cargarZonas(); // Recargar zonas después de agregar una mesa
    })
    .catch(error => {
        console.error('Error al agregar la mesa:', error);
    });
}

// Función para cargar las zonas al inicio
function cargarZonas() {
    fetch(`http://${serverIP}:3000/api/zonas`) // Cambia la URL según sea necesario
        .then(response => response.json())
        .then(zonas => {
            actualizarListaZonas(zonas);
        })
        .catch(error => {
            console.error('Error al cargar zonas:', error);
        });
}

// Cargar las zonas al inicio
cargarZonas();

// Obtener el formulario y los elementos del DOM
const zonaForm = document.getElementById('zonaForm');
const zonaNombreInput = document.getElementById('zonaNombre');

// Función para crear una nueva zona
function crearZona(event) {
    event.preventDefault(); // Evitar que el formulario se recargue

    const nuevoNombre = zonaNombreInput.value.trim();
    if (!nuevoNombre) {
        alert('El nombre de la zona no puede estar vacío');
        return;
    }

    // Enviar la nueva zona al servidor mediante un POST
    fetch(`http://${serverIP}:3000/api/zonas`, { // Cambia la URL según sea necesario
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nuevoNombre })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Zona creada:', data);
        // Actualizar la lista de zonas después de agregar una nueva
        socket.send(JSON.stringify({ type: 'zonas', data: [data] }));
        zonaNombreInput.value = ''; // Limpiar el campo de entrada
    })
    .catch(error => {
        console.error('Error al crear la zona:', error);
    });
}

zonasList.addEventListener('click', function(event) {
    if (event.target.classList.contains('eliminarMesa')) {
        const zonaId = event.target.getAttribute('data-zona');
        const mesaNumero = event.target.getAttribute('data-mesa');
        const mesaNombre = event.target.getAttribute('data-nombre-mesa');
        eliminarMesa(zonaId, mesaNumero, mesaNombre);
    }
});

// Escuchar el evento de envío del formulario
zonaForm.addEventListener('submit', crearZona);
