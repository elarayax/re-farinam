const categoriasMenuList = document.getElementById('categoriasMenuList');
const socketCategoriasMenu = new WebSocket(`ws://${serverIP}:3000`);


socketCategoriasMenu.addEventListener('message', function(event) {
    try {
        const mensaje = JSON.parse(event.data);
        console.log('Mensaje recibido:', mensaje); // Log completo del mensaje

        if (mensaje.type === 'categoriaMenu') {
            console.log('categoría Menu recibido:', mensaje.data); // Verifica que esté el campo `data` correctamente
            cargarCategoriaMenuActualizado(mensaje.data); // Aquí pasamos solo el array
        }
    } catch (error) {
        console.error('Error al procesar el mensaje del WebSocket:', error);
    }
});


function cargarCategoriaMenuActualizado(categoria){
    const mensaje = categoria;
    console.log("actualizando categorias del menu");
    if (Array.isArray(mensaje)) {
        console.log("era un array");
        categoriasMenuList.innerHTML = '';
        mensaje.forEach(categoria => {
            // Crear contenedor para cada categoría
            const categoriaContainer = document.createElement('div');
            categoriaContainer.className = 'categoria-container';

            const categoriaHead = document.createElement('div');
            categoriaHead.className = 'create-option-item';

            categoriaContainer.appendChild(categoriaHead);

            // Nombre de la categoría
            const categoriaNombre = document.createElement('h3');
            categoriaNombre.textContent = categoria.nombre;
            categoriaHead.appendChild(categoriaNombre);

            const btnAcciones = document.createElement("button");
            btnAcciones.classList.add("button");
            btnAcciones.classList.add("green-button");
            btnAcciones.textContent = "acciones";
            btnAcciones.onclick = () => openModalAgregar(categoria.id, "categoriaMenu", categoria.nombre); 
            categoriaHead.appendChild(btnAcciones);

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
            categoriasMenuList.appendChild(categoriaContainer);
        });
    }else {
        console.error('La respuesta de WebSocket no contiene categorías válidas:', mensaje);
    }
}

function addMenuCategory() {
    const categoriasMenuNombre = document.getElementById("categoriasMenuNombre");

    const nuevoNombre = categoriasMenuNombre.value.trim();
    if (!nuevoNombre) {
        alert('El nombre de la categoría del menú no puede estar vacío');
        return;
    }

    const subcategorias = [];

    // Enviar la nueva zona al servidor mediante un POST
    fetch(`http://${serverIP}:3000/api/categoriasmenu`, { // Cambia la URL según sea necesario
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nuevoNombre, subcategorias: subcategorias })
    })
    .then(response => response.json())
    .then(data => {
        console.log('categoría menú creado:', data);
        // Actualizar la lista de zonas después de agregar una nueva
        categoriasMenuNombre.value = ''; // Limpiar el campo de entrada
    })
    .catch(error => {
        console.error('Error al crear la zona:', error);
    });
}

function cargarCategoriasMenu(){
    fetch(`http://${serverIP}:3000/api/categoriasmenu`) // Cambia la URL según sea necesario
    .then(response => response.json())
    .then(categorias => {
        actualizarListaCategoriasMenu(categorias);
    })
    .catch(error => {
        console.error('Error al cargar categorías:', error);
    });
}

function actualizarListaCategoriasMenu(categorias) {
    if (!Array.isArray(categorias)) {
        console.error('La respuesta de categorías no es un array:', categorias);
        return;
    }

    categoriasMenuList.innerHTML = ''; // Limpiar la lista antes de agregar nuevas categorías

    categorias.forEach(categoria => {
        // Crear contenedor para cada categoría
        const categoriaContainer = document.createElement('div');
        categoriaContainer.className = 'categoria-container';

        const categoriaHead = document.createElement('div');
        categoriaHead.className = 'create-option-item';

        categoriaContainer.appendChild(categoriaHead);

        // Nombre de la categoría
        const categoriaNombre = document.createElement('h3');
        categoriaNombre.textContent = categoria.nombre;
        categoriaHead.appendChild(categoriaNombre);

        const btnAcciones = document.createElement("button");
        btnAcciones.classList.add("button");
        btnAcciones.classList.add("green-button");
        btnAcciones.textContent = "acciones";
        btnAcciones.onclick = () => openModalAgregar(categoria.id, "categoriaMenu", categoria.nombre); 
        categoriaHead.appendChild(btnAcciones);

        // Botón para agregar una subcategoría en esta categoría
        const agregarSubcategoriaBtn = document.createElement('button');
        agregarSubcategoriaBtn.textContent = 'Agregar Subcategoría';
        agregarSubcategoriaBtn.onclick = () => openModalAgregar(categoria.id, "subCategoriaMenu", categoria.nombre); 
        categoriaContainer.appendChild(agregarSubcategoriaBtn);

        const subcategoriasTabla = document.createElement('table');
        subcategoriasTabla.className = 'subcategorias-tabla';
        subcategoriasTabla.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre de Subcategoría del Menú</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="subcategorias-${categoria.id}">
                ${Array.isArray(categoria.subcategorias) ? categoria.subcategorias.map(subcategoria => `
                    <tr>
                        <td>${subcategoria.nombre}</td>
                        <td>
                            <button class="button green-button" data-categoria="${categoria.id}" data-nombre-subcategoria="${subcategoria.nombre}" data-subcategoria="${subcategoria.id}" onclick="eliminarSubcategoria(${categoria.id}, ${subcategoria.id})">Eliminar Subcategoría</button>
                        </td>
                    </tr>
                `).join('') : 'No hay subcategorías disponibles'}
            </tbody>
        `;
        categoriaContainer.appendChild(subcategoriasTabla);

        // Añadir el contenedor de la categoría a la lista de categorías
        categoriasMenuList.appendChild(categoriaContainer);
    });
}

function eliminarCategoriaMenu(id, nombre){
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría ${nombre}`)) {
        fetch(`http://${serverIP}:3000/api/categoriasmenu/${id}`, { 
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                console.log('item eliminado con éxito');
                cargarCategoriasMenu(); // Recargar categorías después de eliminar
                closeModalAgregar();
            } else {
                throw new Error('Error al eliminar el item');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el item:', error);
        });
    }
}

function openModalAgregar(id, nombre, nombrePadre) {
    document.getElementById('modalAgregar').style.display = 'flex';
    if(nombre == "categoriaMenu"){
        fetch(`http://${serverIP}:3000/api/categoriasmenu/${id}`)
        .then(response => response.json())
        .then(categoriaCompleta => {
            llenarModalAgregar(id, nombre, nombrePadre, categoriaCompleta);
        })
        .catch(error => {
            console.error('Error al cargar la categoría:', error);
        });
    }else if(nombre == "subCategoriaMenu"){
        llenarModalAgregar(id, nombre, nombrePadre, null);
    }else if (nombre == "subCategoriaMenuEditar"){
        llenarModalAgregar(id, nombre, nombrePadre, null);
    }
}

function llenarModalAgregar(id, nombre, nombrePadre, categoriaCompleta){
    const llenarFormulario = document.getElementById("generadorModal");
    llenarFormulario.innerHTML = "";

    if(nombre == "subCategoriaMenu"){
        document.getElementById("tituloModal").textContent = `Agregando SubCategoría a ${nombrePadre}`;

        const labelNombre = document.createElement("label");
        labelNombre.textContent = "Nombre de la SubCategoría";
        labelNombre.htmlFor = "nombreSubCategoriaMenu";
        llenarFormulario.appendChild(labelNombre);

        const inputNombre = document.createElement("input");
        inputNombre.type = "text";
        inputNombre.id = "nombreSubCategoriaMenu";
        inputNombre.placeholder = "Nombre de la subcategoría";
        llenarFormulario.appendChild(inputNombre);

        const buttonAgregar = document.createElement("button");
        buttonAgregar.textContent = "Agregar SubCategoría";
        buttonAgregar.onclick = () => agregarSubCategoriaMenu(id, inputNombre.value);
        llenarFormulario.appendChild(buttonAgregar);

    }else if(nombre == "categoriaMenu"){
        document.getElementById("tituloModal").textContent = `Editando: ${nombrePadre}`;

        let labelNombre = document.createElement("label");
        labelNombre.textContent = "Nombre de la categoría";
        labelNombre.htmlFor = "nombreCategoríaMenu";
        llenarFormulario.appendChild(labelNombre);

        const inputNombre = document.createElement("input");
        inputNombre.type = "text";
        inputNombre.id = "nombreCategoríaMenu";
        inputNombre.placeholder = "Nombre de la categoría";
        llenarFormulario.appendChild(inputNombre);
        
        const divAcciones = document.createElement("div");
        divAcciones.classList.add("div-acciones-modal");
        llenarFormulario.appendChild(divAcciones);

        const buttonEliminar = document.createElement("button");
        buttonEliminar.textContent = "Eliminar Categoría";
        buttonEliminar.onclick = () => eliminarCategoriaMenu(id, nombrePadre);
        divAcciones.appendChild(buttonEliminar);

        const buttonAgregar = document.createElement("button");
        buttonAgregar.textContent = "Actualizar Categoría";
        buttonAgregar.onclick = () => actualizarCategoriaMenu(id, inputNombre.value, categoriaCompleta.subcategorias);
        divAcciones.appendChild(buttonAgregar);
    }
}

function closeModalAgregar() {
    document.getElementById('modalAgregar').style.display = 'none';
}

function actualizarCategoriaMenu(id, nombre, subCategorias) {
    // Construir el objeto categoría con todos los datos necesarios
    const categoriaActualizada = {
        id: id,                // ID de la categoría
        nombre: nombre,   
        subcategorias: subCategorias,     // Nombre actualizado de la categoría
        // Aquí puedes incluir otras propiedades como subcategorias si lo necesitas
        // subcategorias: [...] 
    };

    // Enviar la categoría completa al servidor
    fetch(`http://${serverIP}:3000/api/categoriasmenu/${id}`, {
        method: 'PUT', // Utilizamos PUT para actualizar
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoriaActualizada) // Convertimos el objeto en JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar la categoría');
        }
        return response.json();
    })
    .then(data => {
        console.log('Categoría actualizada:', data);
        // Recargar la lista de categorías si es necesario
        cargarCategoriasMenu();
        closeModalAgregar();
    })
    .catch(error => {
        console.error('Error al actualizar la categoría:', error);
    });
}

function agregarSubCategoriaMenu(id, nombreSubCategoria) {
    const nombreAgregar = nombreSubCategoria;
    if (!nombreAgregar) {
        alert('El nombre de la sub categoría del menú no puede estar vacío');
        return;
    }

    // Enviar la nueva zona al servidor mediante un POST
    fetch(`http://${serverIP}:3000/api/categoriasmenu/${id}/subcategorias`, { // Cambia la URL según sea necesario
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nombreAgregar })
    })
    .then(response => response.json())
    .then(data => {
        console.log('subCategoría menú creada:', data);
        // Actualizar la lista de zonas después de agregar una nueva
        closeModalAgregar();
    })
    .catch(error => {
        console.error('Error al crear la zona:', error);
    });
}

cargarCategoriasMenu();