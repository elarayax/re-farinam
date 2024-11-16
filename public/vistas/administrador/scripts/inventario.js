let categoriasSeleccionadas = [];
const subCategoriasSeleccionadas = [];

const socketInventario = new WebSocket(`ws://${serverIP}:3000`);

function inventario(){
    fetch(`http://${serverIP}:3000/api/inventario`).then(response => response.json()).then(data => {
        if (data.length === 0) {
            document.getElementById("inventarioName").textContent = "No se encontraron datos de inventario";
        }
    }).catch(error => console.error("Error al cargar inventario:", error));
}

function abrirModal() {
    document.getElementById("modalAgregarProducto").style.display = "block";
    llamarCategorias();
    llamarMedidas();
}

function cerrarModal() {
    document.getElementById("modalAgregarProducto").style.display = "none";
}

function llamarCategorias(){
    fetch(`http://${serverIP}:3000/api/categorias`)
        .then(response => response.json())
        .then(categorias => {
            selecCategorias(categorias);
        }).catch(error => {
            console.error('Error al cargar categorías:', error);
        });
}

function selecCategorias(categoria) {
    const select = document.getElementById("categoriaProducto");
    select.innerHTML = ""; 
    categoria.forEach(element => {
        const optionElement = document.createElement("option");
        optionElement.value = element.id;
        optionElement.textContent = element.nombre;
        optionElement.dataset.comestible = element.comestible;
        select.appendChild(optionElement);
    });
}

function actualizarSubs(){
    const select = document.getElementById("categoriaProducto");
    llamarSubcategorias(parseInt(select.value));
}

function llamarSubcategorias(id, selectId) {
    fetch(`http://${serverIP}:3000/api/categorias/${id}/subcategorias`)
    .then(response => response.json())
    .then(subcategorias => {
        selecSubcategorias(subcategorias,selectId);
    }).catch(error => {
        console.error('Error al cargar subcategorías:', error);
    });
}


function selecSubcategorias(subcategorias, selectId) {
    const selectSubcategorias = document.getElementById(selectId);
    selectSubcategorias.innerHTML = ""; 

    if(subcategorias.length === 0){
        const optionElement = document.createElement("option");
        optionElement.value = 0;
        optionElement.textContent = "No posee subCategorías";
        selectSubcategorias.appendChild(optionElement);
    } else {
        subcategorias.forEach(subcategoria => {
            const optionElement = document.createElement("option");
            optionElement.value = subcategoria.id;
            optionElement.textContent = subcategoria.nombre;
            selectSubcategorias.appendChild(optionElement);
        });
    }
}

function llamarMedidas(){
    fetch(`http://${serverIP}:3000/api/medidas`)
    .then(response => response.json())
    .then(medidas => {
        if(medidas.length > 0){
            selectMedidas(medidas);
        }
    });
}

function selectMedidas(medidas){
    const select = document.getElementById("medidaProducto");
    select.innerHTML = "";
    medidas.forEach(element => {
        const optionElement = document.createElement("option");
        optionElement.value = element.id;
        optionElement.textContent = element.medida;
        select.appendChild(optionElement)
    });
}

function addCategory(){
    const selectCategoria = document.getElementById("categoriaProducto");
    const selectedOption = selectCategoria.options[selectCategoria.selectedIndex];

    const categoria = {
        nombre: selectedOption.textContent,
        id: parseInt(selectedOption.value),
        comestible: selectedOption.dataset.comestible,
        subcategorias: []
    };

    const existe = categoriasSeleccionadas.some(item => item.id === categoria.id);
    if(!existe){
        categoriasSeleccionadas.push(categoria); // Añadimos solo si no es duplicado
        actualizarListadoCategorias();
    }else{
        mostrarMensajeDuplicado("Categoría ya había sido ingresada");
    }
}
function mostrarMensajeDuplicado(mensaje) {
    const mensajeDiv = document.getElementById("mensaje-duplicado");
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.display = "block";

    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
        mensajeDiv.style.display = "none";
    }, 3000);
}

function actualizarListadoCategorias() {
    const listadoCategorias = document.getElementById("categoriasAñadidas");
    listadoCategorias.innerHTML = ""; 

    categoriasSeleccionadas.forEach((e, index) => {
        const li = document.createElement("li");

        // Accedemos directamente a la propiedad comestible de e
        li.textContent = `${e.nombre}`;

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.onclick = () => eliminarCategoria(index);

        li.appendChild(btnEliminar);

        const selectElement = document.createElement("select");
        selectElement.id = `categoria${e.id}`;

        llamarSubcategorias(e.id, `categoria${e.id}`);

        li.appendChild(selectElement);

        const addSubCategorySelect = document.createElement("a");
        addSubCategorySelect.id = `addSub${e.id}`;
        addSubCategorySelect.textContent = "Agregar subcategoria";
        addSubCategorySelect.href = "#";
        addSubCategorySelect.onclick = () => llenarTablaSubs(e.id);

        const subcategoriasTabla = document.createElement('table');
        subcategoriasTabla.className = 'subcategorias-tabla';
        subcategoriasTabla.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre de Subcategoría</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="subcategorias-${e.id}">
            </tbody>
        `;

        li.appendChild(addSubCategorySelect);
        li.appendChild(subcategoriasTabla);

        listadoCategorias.appendChild(li);
    });
}

function llenarTablaSubs(id) {
    const subcategoriasTbody = document.getElementById(`subcategorias-${id}`);
    const valor = document.getElementById(`categoria${id}`);
    const selectedOption = valor.options[valor.selectedIndex];
    const nombreSubcategoria = selectedOption.text;
    const valueId = selectedOption.id;

    const subCategory = {
        id: valueId,
        nombre: nombreSubcategoria,
    };

    // Buscar la categoría correspondiente en el array de `categoriasSeleccionadas`
    const categoria = categoriasSeleccionadas.find(e => e.id == id);

    // Verificar si la subcategoría ya existe en `subcategorias`
    const subcategoriaExiste = categoria.subcategorias.some(sub => sub.id === subCategory.id);

    if (!subcategoriaExiste) {
        // Si no existe, agregar la subcategoría al `tbody` y al array de `subcategorias`
        const tr = document.createElement("tr");

        const tdNombre = document.createElement("td");
        tdNombre.textContent = nombreSubcategoria;

        const tdAcciones = document.createElement("td");
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.onclick = () => tr.remove();

        tdAcciones.appendChild(btnEliminar);
        tr.appendChild(tdNombre);
        tr.appendChild(tdAcciones);

        subcategoriasTbody.appendChild(tr);

        // Agregar la subcategoría al array `subcategorias` de la categoría
        categoria.subcategorias.push(subCategory);
    } else {
        // Mostrar un mensaje si la subcategoría ya existe
        mostrarMensajeDuplicado("La subcategoría ya ha sido ingresada");
    }
}

function eliminarCategoria(index) {
    categoriasSeleccionadas.splice(index, 1);
    actualizarListadoCategorias();
}

function guardarProducto() {
    const nombre = document.getElementById("nombreProducto").value;
    const categoria = categoriasSeleccionadas;
    const cantidad = parseInt(document.getElementById("cantidadProducto").value);
    const stockCritico = parseInt(document.getElementById("stockCritico").value);

    fetch(`http://${serverIP}:3000/api/inventario`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nombre,
            categoria,
            cantidad,
            stockCritico,
        }),
    })
    .then(response => response.json())
    .then(data => {
        cargarInventario();
        cerrarModal();
    })
    .catch(error => console.error("Error al guardar el producto:", error));
}

function cargarInventario() {
    fetch(`http://${serverIP}:3000/api/inventario`)
        .then(response => response.json())
        .then(data => {
            const contenedorTablas = document.getElementById("tablas-inventario");
            contenedorTablas.innerHTML = "";  // Limpiar contenido previo

            // Agrupar los productos por categorías
            const categorias = data.reduce((acc, item) => {
                if (!acc[item.categoria]) acc[item.categoria] = [];
                acc[item.categoria].push(item);
                return acc;
            }, {});

            // Iterar sobre cada categoría para crear tablas
            for (const [categoria, productos] of Object.entries(categorias)) {
                const tabla = document.createElement("table");
                tabla.className = "tabla-inventario";

                // Cabecera de la tabla
                const encabezado = `<tr><th>Nombre</th><th>Categorias</th><th>SubCategoría</th><th>Cantidad</th><th>Stock Crítico</th><th>Acciones</th></tr>`;
                tabla.innerHTML = encabezado;

                // Agregar filas para cada producto en la categoría
                productos.forEach(producto => {
                    const fila = document.createElement("tr");

                    // Nombre del producto
                    const tdNombre = document.createElement("td");
                    tdNombre.textContent = producto.nombre;
                    fila.appendChild(tdNombre);

                    // Categoría del producto
                    const tCategoria = document.createElement("td");
                    let textoCategoria = "";
                    
                    producto.categoria.forEach(e => {
                        textoCategoria += e.nombre + ", ";
                    });
                    // Quitar la última coma y espacio sobrantes
                    tCategoria.textContent = textoCategoria.slice(0, -2);
                    fila.appendChild(tCategoria);

                    let textSubCategoria = "";

                    producto.categoria.forEach(e=>{
                        e.subcategorias.forEach(f => {
                            textSubCategoria += f.nombre + ", "
                        });
                    });

                    // Subcategoría del producto (con valor por defecto si no está presente)
                    const tdSubCategoria = document.createElement("td");
                    textSubCategoria = textSubCategoria.slice(0, -2);
                    tdSubCategoria.textContent = textSubCategoria || "-"; // Si no tiene subcategoría, mostrar '-'
                    fila.appendChild(tdSubCategoria);

                    // Cantidad
                    const tdCantidad = document.createElement("td");
                    tdCantidad.textContent = producto.cantidad;
                    fila.appendChild(tdCantidad);

                    // Stock Crítico
                    const tdStockCritico = document.createElement("td");
                    tdStockCritico.textContent = producto.stockCritico;
                    fila.appendChild(tdStockCritico);

                    const tdAcciones = document.createElement("td");

                    const btnEditar = document.createElement("button");
                    btnEditar.textContent = "Acciones";
                    btnEditar.onclick = () => editarProducto(producto.id);
                    tdAcciones.appendChild(btnEditar);
                    fila.appendChild(tdAcciones);

                    tabla.appendChild(fila);  // Agregar la fila a la tabla
                });

                // Añadir la tabla al contenedor
                contenedorTablas.appendChild(tabla);
            }
        })
        .catch(error => {
            console.error("Error al cargar inventario:", error);
            document.getElementById("inventarioName").textContent = "Hubo un error al cargar el inventario.";
        });
}

socketInventario.addEventListener('message', function(event) {
    try {
        const mensaje = JSON.parse(event.data);
        console.log('Mensaje recibido:', mensaje); // Log completo del mensaje

        if (mensaje.type === 'inventario') {
            console.log('Inventario recibido:', mensaje.data); // Verifica que esté el campo `data` correctamente
            cargarInventarioActualizado(mensaje.data);
        }
    } catch (error) {
        console.error('Error al procesar el mensaje del WebSocket:', error);
    }
});

function cargarInventarioActualizado(datos) {
    console.log('Datos recibidos en cargarInventario:', datos);

    const contenedorTablas = document.getElementById("tablas-inventario");
    contenedorTablas.innerHTML = "";  // Limpiar contenido previo

    // Agrupar los productos por categorías
    const categorias = datos.reduce((acc, item) => {
        console.log('Item del inventario:', item);  // Verificar cada producto
        if (!acc[item.categoria]) acc[item.categoria] = [];
        acc[item.categoria].push(item);
        return acc;
    }, {});

    console.log('Categorías agrupadas:', categorias);  // Verificar las categorías agrupadas

    // Iterar sobre cada categoría para crear tablas
    for (const [categoria, productos] of Object.entries(categorias)) {
        const tabla = document.createElement("table");
        tabla.className = "tabla-inventario";

        // Cabecera de la tabla
        const encabezado = `<tr><th>Nombre</th><th>Categorias</th><th>SubCategoría</th><th>Cantidad</th><th>Stock Crítico</th><th>Acciones</th></tr>`;
        tabla.innerHTML = encabezado;

        // Agregar filas para cada producto en la categoría
        productos.forEach(producto => {
            const fila = document.createElement("tr");

            // Nombre del producto
            const tdNombre = document.createElement("td");
            tdNombre.textContent = producto.nombre;
            fila.appendChild(tdNombre);

            // Categoría del producto
            const tCategoria = document.createElement("td");
            let textoCategoria = "";
            
            producto.categoria.forEach(e => {
                textoCategoria += e.nombre + ", ";
            });
            // Quitar la última coma y espacio sobrantes
            tCategoria.textContent = textoCategoria.slice(0, -2);
            fila.appendChild(tCategoria);

            let textSubCategoria = "";

            producto.categoria.forEach(e=>{
                e.subcategorias.forEach(f => {
                    textSubCategoria += f.nombre + ", "
                });
            });

            // Subcategoría del producto (con valor por defecto si no está presente)
            const tdSubCategoria = document.createElement("td");
            textSubCategoria = textSubCategoria.slice(0, -2);
            tdSubCategoria.textContent = textSubCategoria || "-"; // Si no tiene subcategoría, mostrar '-'
            fila.appendChild(tdSubCategoria);

            // Cantidad
            const tdCantidad = document.createElement("td");
            tdCantidad.textContent = producto.cantidad;
            fila.appendChild(tdCantidad);

            // Stock Crítico
            const tdStockCritico = document.createElement("td");
            tdStockCritico.textContent = producto.stockCritico;
            fila.appendChild(tdStockCritico);

            const tdAcciones = document.createElement("td");

            const btnEditar = document.createElement("button");
            btnEditar.textContent = "acciones";
            btnEditar.onclick = () => editarProducto(producto.id);
            tdAcciones.appendChild(btnEditar);

            fila.appendChild(tdAcciones);

            tabla.appendChild(fila);   // Agregar la fila a la tabla
        });

        // Añadir la tabla al contenedor
        contenedorTablas.appendChild(tabla);
    }
}

function eliminarProducto(id, nombre){
    if (confirm(`¿Estás seguro de que deseas eliminar ${nombre} del inventario`)) {
        fetch(`http://${serverIP}:3000/api/inventario/${id}`, { 
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                console.log('item eliminado con éxito');
                cargarCategorias(); // Recargar categorías después de eliminar
            } else {
                throw new Error('Error al eliminar el item');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el item:', error);
        });
    }
}

function editarProducto(id){
    document.getElementById("editarProducto").style.display = "block";
    fetch(`http://${serverIP}:3000/api/inventario/${id}`)
    .then(response => response.json())
    .then(inventario => {
        console.log(inventario);
        formEditarProducto(inventario);
    }).catch(error => {
        console.error('Error al cargar categorías:', error);
    });
}

function formEditarProducto(inventario){
    document.getElementById("nombreProductoEditar").value = inventario.nombre;
    if(inventario.cantidad == null){
        document.getElementById("cantidadProductoEditar").value = 0;
    }else{
        document.getElementById("cantidadProductoEditar").value = inventario.cantidad;
    }
    if(inventario.stockCritico == null){
        document.getElementById("stockCriticoEditar").value = 0;    
    }else{
        document.getElementById("stockCriticoEditar").value = inventario.stockCritico;
    }

    const listadoCategorias = document.getElementById("categoriasProductoEditar");
    listadoCategorias.innerHTML = "";

    inventario.categoria.forEach(e=> {
        const li = document.createElement("li");
        const name = e.nombre;
        li.textContent = name;
        listadoCategorias.appendChild(li);
    });
    document.getElementById("eliminarModal").onclick = () => eliminarProducto(inventario.id, inventario.nombre);
}

function cerrarEditar(){
    document.getElementById("editarProducto").style.display = "none";
}