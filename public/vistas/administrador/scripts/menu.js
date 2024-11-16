let ingredientesSeleccionados = [];

function cargarMenu(){
    fetch(`http://${serverIP}:3000/api/menu`).then(response => response.json()).then(data => {
        if (data.length === 0) {
            document.getElementById("tablaMenu").textContent = "No se encontraron datos de menú";
            
        }else{
            loadmenu();
        }
    }).catch(error => console.error("Error al cargar inventario:", error));
}

function openModalAgregar() {
    document.getElementById('modalAgregar').style.display = 'flex';
    llenarModalAgregar();
}

function closeModalAgregar() {
    document.getElementById('modalAgregar').style.display = 'none';
    ingredientesSeleccionados = [];
}

async function llenarModalAgregar() {
    const categorias = await llamarCategoriasMenu();
    if (categorias == null || categorias.length === 0) {
        generarMensaje('red', 'No hay categorías para el menú cargadas');
    } else {
        const selectCategorias = document.getElementById("categoriaPlato");
        selectCategorias.innerHTML = "";
        categorias.forEach(categoria => {
            const option = document.createElement("option");
            option.value = categoria.id;
            option.text = categoria.nombre;
            selectCategorias.appendChild(option);
        });

        selectCategorias.onchange = async function() {
            const categoriaId = selectCategorias.value;
            await cargarSubcategorias(categoriaId);
        };

        if (categorias.length > 0) {
            await cargarSubcategorias(categorias[0].id);
        }
    }
}

async function cargarSubcategorias(categoriaId) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/categoriasmenu/${categoriaId}`);
        if (!response.ok) {
            console.error('Error en la respuesta del servidor al cargar subcategorías:', response.statusText);
            generarMensaje('red', 'Error al cargar subcategorías');
            return;
        }
        const subcategorias = await response.json();

        const sub = subcategorias.subcategorias;

        // Obtener el select de subcategorías y llenarlo
        const selectSubcategorias = document.getElementById("subCategoriasPlato");
        selectSubcategorias.innerHTML = "";

        if (sub && sub.length > 0) {
            sub.forEach(subcategoria => {
                const option = document.createElement("option");
                option.value = subcategoria.id;
                option.text = subcategoria.nombre;
                selectSubcategorias.appendChild(option);
            });
        } else {
            generarMensaje('red', 'No hay subcategorías para la categoría seleccionada');
        }
    } catch (error) {
        generarMensaje('red', 'Error al cargar subcategorías');
    }
}

async function llamarCategoriasMenu() {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/categoriasmenu`); // Cambia la URL según sea necesario
        if (!response.ok) {
            console.error('Error en la respuesta del servidor:', response.statusText);
            return null;
        }
        const categorias = await response.json();
        return categorias;
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        return null;
    }
}

async function llamarCategoriasMenuTabla() {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/categoriasmenu`); // Cambia la URL según sea necesario
        if (!response.ok) {
            console.error('Error en la respuesta del servidor:', response.statusText);
            return null;
        }
        const categorias = await response.json();
        return categorias;
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        return null;
    }
}

async function loadmenu() {
    // Limpiar el contenido de la tabla para evitar duplicados al recargar
    const tablaMenu = document.getElementById("tablaMenu");
    tablaMenu.innerHTML = "";

    const categorias = await llamarCategoriasMenuTabla();
    if (!categorias) {
        console.error("No se pudieron cargar las categorías");
        return;
    }

    // Crear un conjunto para rastrear las categorías ya renderizadas
    const categoriasRenderizadas = new Set();

    // Recorre cada categoría y sus subcategorías
    for (const e of categorias) {
        if (!categoriasRenderizadas.has(e.nombre)) {
            const separador = document.createElement("div");
            separador.classList.add("separador-container");

            const textoCategoria = document.createElement("h3");
            textoCategoria.textContent = e.nombre;

            separador.appendChild(textoCategoria);
            tablaMenu.appendChild(separador);

            categoriasRenderizadas.add(e.nombre);
        }

        // Crear un conjunto para rastrear las subcategorías ya renderizadas en la categoría actual
        const subcategoriasRenderizadas = new Set();

        for (const f of e.subcategorias) {
            // Solo crea el contenedor de la subcategoría si no ha sido renderizado antes
            if (!subcategoriasRenderizadas.has(f.nombre)) {
                const subcategoria = document.createElement("div");
                subcategoria.classList.add("subcategoria-container");

                const textoSubCategoria = document.createElement("h4");
                textoSubCategoria.textContent = f.nombre;

                subcategoria.appendChild(textoSubCategoria);
                tablaMenu.appendChild(subcategoria);

                subcategoriasRenderizadas.add(f.nombre);

                // Llama a buscarPorSub para obtener los productos de esta subcategoría
                const productos = await buscarPorSub(f.nombre);
                const productosRenderizados = new Set();

                if (Array.isArray(productos) && productos.length > 0) {
                    productos.forEach(producto => {
                        if (!productosRenderizados.has(producto.plato.nombre)) {
                            // Crea un elemento para cada producto en la subcategoría
                            const divPlatos = document.createElement("div");
                            divPlatos.classList.add("plato-container");

                            const productoElemento = document.createElement("p");
                            productoElemento.textContent = producto.plato.nombre;
                            productoElemento.classList.add("producto-item");
                            divPlatos.appendChild(productoElemento);

                            const botonAcciones = document.createElement("button");
                            botonAcciones.classList.add("button");
                            botonAcciones.classList.add("green-button");
                            botonAcciones.textContent = "acciones";
                            botonAcciones.onclick = () => editarPlato(producto.id);

                            divPlatos.appendChild(botonAcciones);

                            subcategoria.appendChild(divPlatos);

                            productosRenderizados.add(producto.plato.nombre);
                        }
                    });
                } else {
                    // Mensaje si no hay productos en la subcategoría
                    const productoElemento = document.createElement("p");
                    productoElemento.textContent = "No hay productos en esta subcategoría";
                    subcategoria.appendChild(productoElemento);
                }
            }
        }
    }
}

async function buscarPorSub(subCategoria) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu/busqueda?subcategoria=${subCategoria}`);
        if (!response.ok) throw new Error("Error al buscar ingredientes");
        return await response.json();
    } catch (error) {
        console.error("Error al cargar ingredientes:", error);
        return [];
    }
}

async function buscarIngredientes(query) {
    if (query.trim() === "") return [];

    try {
        const response = await fetch(`http://${serverIP}:3000/api/inventario/buscarcomestibles?nombre=${query}`);
        if (!response.ok) throw new Error("Error al buscar ingredientes");
        return await response.json();
    } catch (error) {
        console.error("Error al cargar ingredientes:", error);
        return [];
    }
}

function editarPlato (id){
    generarMensaje("green", "editando plato "+id);
    document.getElementById('editarPlato').style.display = 'flex';
    llenarModalEditar(id);
}

async function llenarModalEditar(id){
    let platoRecibido = await llamarPlatoSolo(id);
    console.log(platoRecibido);
    const nombrePlatoEditar = document.getElementById("nombrePlatoEditar");
    nombrePlatoEditar.value = platoRecibido.plato.nombre;
    const precioPlatoEditar = document.getElementById("precioPlatoEditar");
    precioPlatoEditar.value = platoRecibido.plato.precio;
    const categoriaPlatoEditar = document.getElementById("categoriaPlatoEditar");
    categoriaPlatoEditar.innerHTML = "";
    const subCategoriaPlatoEditar = document.getElementById("subCategoriaPlatoEditar");
    subCategoriaPlatoEditar.innerHTML = "";
    const catgoriasMenu = await llamarCategoriasMenu();
    catgoriasMenu.forEach(e => {
        const optionCategorias = document.createElement("option");
        optionCategorias.value = e.id;
        optionCategorias.text = e.nombre;
        if(e.id == platoRecibido.plato.categoria.idCategoria){
            optionCategorias.selected = true;
            e.subcategorias.forEach(f => {
                const optionSubcategorias = document.createElement("option");
                optionSubcategorias.value = f.id;
                optionSubcategorias.text = f.nombre;
                if(f.id == platoRecibido.plato.categoria.subCategoria[0].id){
                    optionSubcategorias.selected = true;
                }
                subCategoriaPlatoEditar.appendChild(optionSubcategorias);
            });
        }
        ingredientesSeleccionados = [];
        ingredientesSeleccionados = platoRecibido.plato.ingredientes;

        const listaIngredientesEditar = document.getElementById("listadoIngredientesEditar");
        listaIngredientesEditar.innerHTML = "";
        ingredientesSeleccionados.forEach(e => {
            const optionIngredientes = document.createElement("li");
            optionIngredientes.innerText = e.nombre;
            listaIngredientesEditar.appendChild(optionIngredientes);
        });
        
        categoriaPlatoEditar.appendChild(optionCategorias);
    });
    console.log(platoRecibido)
}

function closeModalEditar() {
    document.getElementById('editarPlato').style.display = 'none';
    ingredientesSeleccionados = [];
}

async function llamarPlatoSolo (id){
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu/${id}`);
        if (!response.ok) throw new Error("Error al buscar ingredientes");
            return await response.json();
    }catch{
        generarMensaje("red", "no se puedo encontar el plato por el ID");
    }
}

// Evento de input para buscar ingredientes en tiempo real
const ingredienteInput = document.getElementById("ingredienteInput");
const sugerenciasIngredientes = document.getElementById("sugerenciasIngredientes");

ingredienteInput.addEventListener("input", async () => {
    const query = ingredienteInput.value;
    if (query.trim() === "") {
        sugerenciasIngredientes.style.display = "none";
        return;
    }

    try {
        // Llamar a la API para obtener ingredientes comestibles
        const ingredientes = await buscarIngredientes(query);

        // Limpiar sugerencias previas
        sugerenciasIngredientes.innerHTML = "";

        // Mostrar las sugerencias si hay resultados
        sugerenciasIngredientes.style.display = ingredientes.length ? "block" : "none";

        // Generar lista de sugerencias
        ingredientes.forEach(ingrediente => {
            const item = document.createElement("div");
            item.textContent = ingrediente.nombre;
            item.style.cursor = "pointer";
            item.onclick = () => seleccionarIngrediente(ingrediente);
            sugerenciasIngredientes.appendChild(item);
        });
    } catch (error) {
        console.error("Error al buscar ingredientes:", error);
    }
});


// Función para agregar ingrediente seleccionado al array y actualizar la lista
function seleccionarIngrediente(ingrediente) {
    // Agregar al array si no está ya seleccionado
    if (!ingredientesSeleccionados.some(i => i.id === ingrediente.id)) {
        ingredientesSeleccionados.push({ ...ingrediente, cantidad: 1 });
        actualizarListaIngredientes();
    }

    // Limpiar y ocultar sugerencias
    ingredienteInput.value = "";
    sugerenciasIngredientes.innerHTML = "";
    sugerenciasIngredientes.style.display = "none";
}

// Función para actualizar la lista de ingredientes seleccionados
function actualizarListaIngredientes() {
    const listaIngredientesSeleccionados = document.getElementById("listaIngredientesSeleccionados");
    listaIngredientesSeleccionados.innerHTML = "";

    ingredientesSeleccionados.forEach((ingrediente, index) => {
        const item = document.createElement("li");

        item.innerHTML = `
            ${ingrediente.nombre} - Cantidad: 
            <input type="number" min="1" value="${ingrediente.cantidad}" style="width: 50px;" 
                onchange="actualizarCantidadIngrediente(${index}, this.value)" />
            <button onclick="eliminarIngrediente(${index})">Eliminar</button>
        `;

        listaIngredientesSeleccionados.appendChild(item);
    });
}

// Función para actualizar la cantidad de un ingrediente en el array
function actualizarCantidadIngrediente(index, cantidad) {
    ingredientesSeleccionados[index].cantidad = parseInt(cantidad, 10);
}

// Función para eliminar un ingrediente del array
function eliminarIngrediente(index) {
    ingredientesSeleccionados.splice(index, 1);
    actualizarListaIngredientes();
}

function agregarPlato(){
    const nombrePlato = document.getElementById("nombrePlato");
    let puede = 0;
    if(nombrePlato.value.trim() == 0 || nombrePlato.value.length == 0){
        generarMensaje("red", "falta agregar un nombre al plato");
        puede += 1;
    }

    const valorPlato = document.getElementById("precioPlato");
    if(valorPlato.value.trim() == 0 || valorPlato.value.length == 0){
        generarMensaje("red", "falta agregar un precio al plato");
        puede += 1;
    }

    if(ingredientesSeleccionados.length == 0){
        generarMensaje("red", "debe agregar al menos un ingrediente");
        puede += 1;
    } 

    const valor = document.getElementById("categoriaPlato");

    const categoriaPlato = valor.options[valor.selectedIndex];
    const nombreCategoria = categoriaPlato.text;

    const valorSub = document.getElementById("subCategoriasPlato");

    const idSub = valorSub.options[valorSub.selectedIndex];
    const nombreSub = idSub.text;

    const subsCategorias = [];

    const subCategoria = {
        id: parseInt(idSub.value),
        nombre: nombreSub
    }

    subsCategorias.push(subCategoria);

    const categoria = {
        idCategoria: parseInt(categoriaPlato.value),
        nombreCategoria: nombreCategoria,
        subCategoria: subsCategorias
    }

    if(puede != 0){
        generarMensaje("red", "debe solucionar los campos faltantes antes de agregar el producto");
    }else{
        const plato = {
            nombre: nombrePlato.value,
            precio: parseInt(valorPlato.value),
            ingredientes: ingredientesSeleccionados,
            categoria: categoria,
        }
        fetch(`http://${serverIP}:3000/api/menu`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                plato
            }),
        })
        .then(response => response.json())
        .then(data => {
            cargarMenu();
            closeModalAgregar();
            generarMensaje("green", "Plato Agregado Satisfactoriamente");
        })
        .catch(error => generarMensaje("red", `Error al agregar el plato: ${error}`))

    }
}

// Cerrar el modal cuando el usuario haga clic fuera del contenido del modal
window.onclick = function(event) {
    const modal = document.getElementById('modalAgregar');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}