const categoriasList = document.getElementById('categoriasList'); // Asegúrate de que este ID coincida con tu HTML
const comestibleList = document.getElementById("comestible").value;

// Obtener la IP del servidor desde localStorage o usar localhost como fallback
//const serverIP = localStorage.getItem('serverIP') || 'localhost';

// Conexión al WebSocket
const socketCategorias = new WebSocket(`ws://${serverIP}:3000`); // Cambia la URL según sea necesario

// Escuchar mensajes del WebSocket
// Escuchar mensajes del WebSocket
// Escuchar mensajes del WebSocket
socketCategorias.addEventListener('message', function(event) {
    const mensaje = JSON.parse(event.data);
    if (mensaje.type === 'categoriasInventario') {
        // Verifica si el mensaje es un array de categorías
        if (Array.isArray(mensaje)) {
            categoriasList.innerHTML = '';  // Limpiar la lista antes de agregar nuevas categorías

            mensaje.forEach(categoria => {
                // Crear contenedor para cada categoría
            const categoriaContainer = document.createElement('div');
            categoriaContainer.className = 'categoria-container';

            const categoriaHead = document.createElement('div');
            categoriaHead.className = 'create-option-item';

            categoriaContainer.appendChild(categoriaHead);

            let comestible = "";

            if(categoria.comestible){
                comestible = "es comestible";
            }else {
                comestible = "no es comestible";
            }

            // Nombre de la categoría
            const categoriaNombre = document.createElement('h3');
            categoriaNombre.textContent = categoria.nombre + " - "+ comestible;
            categoriaHead.appendChild(categoriaNombre);

            // Botón de editar y eliminar
            const editarBtn = crearBotonEditarCategoria(categoria);
            const eliminarBtn = crearBotonEliminarCategoria(categoria);

            categoriaHead.appendChild(editarBtn);
            categoriaHead.appendChild(eliminarBtn);

            // Tabla de subcategorías para la categoría
            const subcategoriasTabla = document.createElement('table');
            subcategoriasTabla.className = 'subcategorias-tabla';
            subcategoriasTabla.innerHTML = `
                <thead>
                    <tr>
                        <th>Nombre de Subcategoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="subcategorias-${categoria.id}">
                    ${Array.isArray(categoria.subcategorias) ? categoria.subcategorias.map(subcategoria => `
                        <tr>
                            <td>${subcategoria.nombre}</td>
                            <td><button class="eliminarSubcategoria" data-categoria="${categoria.id}" data-nombre-subcategoria="${subcategoria.nombre}" data-subcategoria="${subcategoria.id}" onclick="eliminarSubcategoria(${categoria.id}, ${subcategoria.id})">Eliminar Subcategoría</button></td>
                        </tr>
                    `).join('') : 'No hay subcategorías disponibles'}
                </tbody>
            `;
            categoriaContainer.appendChild(subcategoriasTabla);

            // Botón para agregar una subcategoría en esta categoría
            const agregarSubcategoriaBtn = document.createElement('button');
            agregarSubcategoriaBtn.textContent = 'Agregar Subcategoría';
            agregarSubcategoriaBtn.onclick = function() {
                const nombreSubcategoria = prompt('Ingrese el nombre de la subcategoría:');
                if (nombreSubcategoria) {
                    agregarSubcategoria(categoria.id, nombreSubcategoria);
                }
            };
            categoriaContainer.appendChild(agregarSubcategoriaBtn);

            // Añadir el contenedor de la categoría a la lista de categorías
            categoriasList.appendChild(categoriaContainer);
            });
        } else {
            console.error('La respuesta de WebSocket no contiene categorías válidas:', mensaje);
        }        
            
    }
});

// Función para actualizar la lista de categorías en el DOM
function actualizarListaCategorias(categorias) {
    if (!Array.isArray(categorias)) {
        console.error('La respuesta de categorías no es un array:', categorias);
        return;
    }

    categoriasList.innerHTML = ''; // Limpiar la lista antes de agregar nuevas categorías

    categorias.forEach(categoria => {
        // Crear contenedor para cada categoría
        const categoriaContainer = document.createElement('div');
        categoriaContainer.className = 'categoria-container';

        const categoriaHead = document.createElement('div');
        categoriaHead.className = 'create-option-item';

        categoriaContainer.appendChild(categoriaHead);

        let comestible = "";

        if(categoria.comestible){
            comestible = "es comestible";
        }else {
            comestible = "no es comestible";
        }

        // Nombre de la categoría
        const categoriaNombre = document.createElement('h3');
        categoriaNombre.textContent = categoria.nombre + " - "+ comestible;
        categoriaHead.appendChild(categoriaNombre);

        // Botón de editar y eliminar
        const editarBtn = crearBotonEditarCategoria(categoria);
        const eliminarBtn = crearBotonEliminarCategoria(categoria);

        categoriaHead.appendChild(editarBtn);
        categoriaHead.appendChild(eliminarBtn);

        // Tabla de subcategorías para la categoría
        const subcategoriasTabla = document.createElement('table');
        subcategoriasTabla.className = 'subcategorias-tabla';
        subcategoriasTabla.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre de Subcategoría</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="subcategorias-${categoria.id}">
                ${Array.isArray(categoria.subcategorias) ? categoria.subcategorias.map(subcategoria => `
                    <tr>
                        <td>${subcategoria.nombre}</td>
                        <td><button class="eliminarSubcategoria" data-categoria="${categoria.id}" data-nombre-subcategoria="${subcategoria.nombre}" data-subcategoria="${subcategoria.id}" onclick="eliminarSubcategoria(${categoria.id}, ${subcategoria.id})">Eliminar Subcategoría</button></td>
                    </tr>
                `).join('') : 'No hay subcategorías disponibles'}
            </tbody>
        `;
        categoriaContainer.appendChild(subcategoriasTabla);

        // Botón para agregar una subcategoría en esta categoría
        const agregarSubcategoriaBtn = document.createElement('button');
        agregarSubcategoriaBtn.textContent = 'Agregar Subcategoría';
        agregarSubcategoriaBtn.onclick = function() {
            const nombreSubcategoria = prompt('Ingrese el nombre de la subcategoría:');
            if (nombreSubcategoria) {
                agregarSubcategoria(categoria.id, nombreSubcategoria);
            }
        };
        categoriaContainer.appendChild(agregarSubcategoriaBtn);

        // Añadir el contenedor de la categoría a la lista de categorías
        categoriasList.appendChild(categoriaContainer);
    });
}

// Función para eliminar una subcategoría
function eliminarSubcategoria(categoriaId, subcategoriaId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta subcategoría?')) {
        fetch(`http://${serverIP}:3000/api/categorias/${categoriaId}/subcategorias/${subcategoriaId}`, { 
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                console.log('Subcategoría eliminada con éxito');
                cargarCategorias(); // Recargar categorías después de eliminar
            } else {
                throw new Error('Error al eliminar la subcategoría');
            }
        })
        .catch(error => {
            console.error('Error al eliminar la subcategoría:', error);
        });
    }
}


// Función para editar una categoría (actualizada para incluir comestible)
function editarCategoria(id, nuevoNombre, comestible) {
    fetch(`http://${serverIP}:3000/api/categorias/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nuevoNombre, comestible: comestible })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Categoría actualizada:', data);
        socketCategorias.send(JSON.stringify({ type: 'categorias', data: [data] })); // Enviar actualización por WebSocket
    })
    .catch(error => {
        console.error('Error al actualizar la categoría:', error);
    });
}

// Función para crear el botón de editar categoría (actualizada para solicitar comestible)
function crearBotonEditarCategoria(categoria) {
    const botonEditar = document.createElement('button');
    botonEditar.textContent = 'Editar Categoría';
    botonEditar.onclick = function() {
        const nuevoNombre = prompt('Ingrese el nuevo nombre para la categoría', categoria.nombre);
        const esComestible = confirm('¿Es comestible?') ? true : false;

        if (nuevoNombre && (nuevoNombre !== categoria.nombre || esComestible !== categoria.comestible)) {
            editarCategoria(categoria.id, nuevoNombre, esComestible); // Editar con el nuevo nombre y valor de comestible
        }
    };
    return botonEditar;
}

// Función para eliminar una categoría
function eliminarCategoria(id) {
    fetch(`http://${serverIP}:3000/api/categorias/${id}`, { 
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log('Categoría eliminada con éxito');
            socketCategorias.send(JSON.stringify({ type: 'categorias', data: [] })); // Enviar actualización de categorías por WebSocket
        } else {
            throw new Error('Error al eliminar la categoría');
        }
    })
    .catch(error => {
        console.error('Error al eliminar la categoría:', error);
    });
}

// Función para agregar una subcategoría
function agregarSubcategoria(idCategoria, nombreSubcategoria) {
    fetch(`http://${serverIP}:3000/api/categorias/${idCategoria}/subcategorias`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nombreSubcategoria })
    })
    .then(response => response.json())
    .then(data => {
        socketCategorias.send(JSON.stringify({ type: 'categorias', data: [data] }));
        cargarCategorias(); // Recargar categorías después de agregar una subcategoría
    })
    .catch(error => {
        console.error('Error al agregar la subcategoría:', error);
    });
}

function crearCategoria(event) {
    event.preventDefault(); // Evitar que el formulario se recargue

    const nuevoNombre = categoriaNombreInput.value.trim();
    const comestible = document.getElementById("comestible").checked; // Obtener el estado del checkbox

    if (!nuevoNombre) {
        alert('El nombre de la categoría no puede estar vacío');
        return;
    }
    let newSub = [];
    // Enviar la nueva categoría al servidor mediante un POST
    fetch(`http://${serverIP}:3000/api/categorias`, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nuevoNombre, comestible: comestible, "subcategorias": newSub })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Categoría creada:', data);
        socketCategorias.send(JSON.stringify({ type: 'categorias', data: [data] }));
        categoriaNombreInput.value = ''; // Limpiar el campo de entrada
    })
    .catch(error => {
        console.error('Error al crear la categoría:', error);
    });
}


// Función para cargar las categorías al inicio
function cargarCategorias() {
    fetch(`http://${serverIP}:3000/api/categorias`) // Cambia la URL según sea necesario
        .then(response => response.json())
        .then(categorias => {
            actualizarListaCategorias(categorias);
        })
        .catch(error => {
            console.error('Error al cargar categorías:', error);
        });
}

// Función para crear el botón de eliminar categoría
function crearBotonEliminarCategoria(categoria) {
    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar Categoría';
    botonEliminar.onclick = function() {
        if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            eliminarCategoria(categoria.id); // Llamar a la función para eliminar la categoría
        }
    };
    return botonEliminar;
}


// Cargar las categorías al inicio
cargarCategorias();

// Obtener el formulario y los elementos del DOM
const categoriaForm = document.getElementById('categoriaForm');
const categoriaNombreInput = document.getElementById('categoriaNombre');

// Escuchar el evento de envío del formulario
categoriaForm.addEventListener('submit', crearCategoria);
