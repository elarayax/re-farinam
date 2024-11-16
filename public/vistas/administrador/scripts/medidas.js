// Suponiendo que tienes un elemento de lista para mostrar las medidas
const medidasList = document.getElementById('medidasList'); // Asegúrate de que este ID coincida con tu HTML
const agregarMedidaBtn = document.getElementById('agregarMedidaBtn'); // Botón para agregar medida
const valorInput = document.getElementById('valorInput');
const unidadInput = document.getElementById('unidadInput'); // Input para la unidad

// Obtener la IP del servidor desde localStorage o usar localhost como fallback
//const serverIP = localStorage.getItem('serverIP') || 'localhost';

// Conexión al WebSocket
const socketMedidas = new WebSocket(`ws://${serverIP}:3000`); // Cambia la URL según sea necesario

// Escuchar mensajes del WebSocket
// Escuchar mensajes del WebSocket
socketMedidas.addEventListener('message', function(event) {
    const mensaje = JSON.parse(event.data);
    
    if (mensaje.type === 'medidas') {
        const medidas = mensaje.data;
        console.log('Medidas actualizadas:', mensaje.data);
        medidasList.innerHTML = ''; // Limpiar el tbody antes de agregar nuevas filas
        
        medidas.forEach(medida => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', medida.id);

            // Celda para la unidad
            const unidadCell = document.createElement('td');
            unidadCell.textContent = medida.medida;
            row.appendChild(unidadCell);

            // Celda para la abreviación
            const abreviacionCell = document.createElement('td');
            abreviacionCell.textContent = medida.abreviacion;
            row.appendChild(abreviacionCell);

            // Celda para los botones de acción
            const accionesCell = document.createElement('td');

            // Botón de editar
            const editarBtn = document.createElement('button');
            editarBtn.textContent = 'Editar';
            editarBtn.classList.add('editar');
            editarBtn.onclick = function() {
                const nuevoValor = prompt('Nuevo valor de la medida:', medida.medida);
                const nuevaUnidad = prompt('Nueva abreviación de la medida:', medida.abreviacion);
                if (nuevoValor && nuevaUnidad) {
                    actualizarMedida(medida.id, nuevoValor, nuevaUnidad);
                }
            };
            accionesCell.appendChild(editarBtn);

            // Botón de eliminar
            const eliminarBtn = document.createElement('button');
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.classList.add('eliminar');
            eliminarBtn.onclick = function() {
                if (confirm('¿Estás seguro de que deseas eliminar esta medida?')) {
                    eliminarMedida(medida.id);
                }
            };
            accionesCell.appendChild(eliminarBtn);

            row.appendChild(accionesCell);
            medidasList.appendChild(row);
        });
    }
});

// Función para agregar una nueva medida
function agregarMedida(event) {
    event.preventDefault(); 
    const valor = valorInput.value;
    const unidad = unidadInput.value;

    if (!valor || !unidad) {
        alert('Por favor, completa ambos campos.');
        return;
    }
    console.log(`agregando medida: ${valor} - ${unidad}`);
    fetch(`http://${serverIP}:3000/api/medidas`, { // Cambia la URL según sea necesario
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ medida: valor, abreviacion: unidad }),  // Asegúrate de enviar "valor" y "unidad"
    })
    .then(response => {
        console.log("Respuesta al agregar medida:", response);  // Ver la respuesta del servidor
        if (!response.ok) {
            throw new Error('Error al agregar la medida');
        }
        return response.json();
    })
    .then(data => {
        console.log('Medida agregada:', data);
        cargarMedidas(); // Recargar las medidas después de agregar una nueva
        valorInput.value = ''; // Limpiar el input de valor
        unidadInput.value = ''; // Limpiar el input de unidad
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para actualizar una medida
function actualizarMedida(id, nuevoValor, nuevaUnidad) {
    fetch(`http://${serverIP}:3000/api/medidas/${id}`, { // Cambia la URL según sea necesario
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ medida: nuevoValor, abreviacion: nuevaUnidad }),
    })
    .then(response => {
        console.log("Respuesta al actualizar medida:", response); // Ver la respuesta del servidor
        if (!response.ok) {
            throw new Error('Error al actualizar la medida');
        }
        return response.json();
    })
    .then(data => {
        console.log('Medida actualizada:', data);
        cargarMedidas(); // Recargar las medidas después de actualizar
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para eliminar una medida
function eliminarMedida(id) {
    fetch(`http://${serverIP}:3000/api/medidas/${id}`, { // Cambia la URL según sea necesario
        method: 'DELETE',
    })
    .then(response => {
        console.log("Respuesta al eliminar medida:", response); // Ver la respuesta del servidor
        if (!response.ok) {
            throw new Error('Error al eliminar la medida');
        }
        cargarMedidas(); // Recargar las medidas después de eliminar
        console.log('Medida eliminada con éxito');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para cargar las medidas al inicio
function cargarMedidas() {
    fetch(`http://${serverIP}:3000/api/medidas`)
        .then(response => response.json())
        .then(medidas => {
            console.log("Medidas cargadas:", medidas);
            medidasList.innerHTML = ''; // Limpiar el tbody antes de agregar nuevas filas
            
            medidas.forEach(medida => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', medida.id);

                // Celda para la unidad
                const unidadCell = document.createElement('td');
                unidadCell.textContent = medida.medida;
                row.appendChild(unidadCell);

                // Celda para la abreviación
                const abreviacionCell = document.createElement('td');
                abreviacionCell.textContent = medida.abreviacion;
                row.appendChild(abreviacionCell);

                // Celda para los botones de acción
                const accionesCell = document.createElement('td');

                // Botón de editar
                const editarBtn = document.createElement('button');
                editarBtn.textContent = 'Editar';
                editarBtn.classList.add('editar');
                editarBtn.onclick = function() {
                    const nuevoValor = prompt('Nuevo valor de la medida:', medida.medida);
                    const nuevaUnidad = prompt('Nueva abreviación de la medida:', medida.abreviacion);
                    if (nuevoValor && nuevaUnidad) {
                        actualizarMedida(medida.id, nuevoValor, nuevaUnidad);
                    }
                };
                accionesCell.appendChild(editarBtn);

                // Botón de eliminar
                const eliminarBtn = document.createElement('button');
                eliminarBtn.textContent = 'Eliminar';
                eliminarBtn.classList.add('eliminar');
                eliminarBtn.onclick = function() {
                    if (confirm('¿Estás seguro de que deseas eliminar esta medida?')) {
                        eliminarMedida(medida.id);
                    }
                };
                accionesCell.appendChild(eliminarBtn);

                row.appendChild(accionesCell);
                medidasList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al cargar medidas:', error);
        });
}


// Cargar las medidas al inicio
//cargarMedidas();

agregarMedidaBtn.addEventListener('click', agregarMedida);