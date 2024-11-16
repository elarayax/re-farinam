const socketUsuarios = new WebSocket(`ws://${serverIP}:3000`); // Cambia la URL según sea necesario

// Conexión abierta
socketUsuarios.addEventListener('open', () => {
    console.log("Conectado al WebSocket de usuarios.");
});

// Manejo de errores de conexión
socketUsuarios.addEventListener('error', (error) => {
    console.error("Error en el WebSocket:", error);
});

// Conexión cerrada
socketUsuarios.addEventListener('close', () => {
    console.log("Conexión WebSocket cerrada.");
});

// Escuchar mensajes del WebSocket
socketUsuarios.addEventListener('message', function(event) {
    console.log("Mensaje recibido:", event.data);
    const mensaje = JSON.parse(event.data);
    if (mensaje.type === 'usuario') {
        generarMensaje("green", "Se actualizaron los usuarios");
        listarUSuarios(mensaje.data);
    }
});


async function cargarUsuarios (){
    try{
        const respuesta = await obtenerUsuarios(serverIP);
        console.log(respuesta);
        listarUSuarios(respuesta);
    } catch (error){
        generarMensaje("red", `no se pudieron cargar los usuarios: ${error}` )
    }
}

cargarUsuarios();

function listarUSuarios(usuarios){
    const tablaUSuarios = document.getElementById("tablaUsuarios");
    tablaUSuarios.innerHTML = "";
    const tabla = document.createElement("table");
    tabla.classList.add("standar")
    tabla.innerHTML = `<thead><tr><th>Usuario</th><th>Tipo de Usuario</th><th></th></tr></thead>`;
    tablaUSuarios.appendChild(tabla);
    const cuerpoTabla = document.createElement("tbody");
    usuarios.forEach(usuario => {
        if(usuario.idTipoUsuario != 1){
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.textContent = usuario.nickNameUsuario;
            const tipoUsuario = document.createElement("td");
            tipoUsuario.textContent = usuario.tipoUsuario;
            const acciones = document.createElement("td");  
            const botonEditar = document.createElement("button");
            botonEditar.textContent = "Acciones";
            botonEditar.onclick = () => openModalAgregar(usuario.id);
            botonEditar.classList.add("button");
            botonEditar.classList.add("green-button");
            acciones.classList.add("celda-centrada");
            fila.appendChild(celda);
            acciones.appendChild(botonEditar);
            fila.appendChild(tipoUsuario);
            fila.appendChild(acciones);
            cuerpoTabla.appendChild(fila);
        }
    });
    tabla.appendChild(cuerpoTabla);
}

async function llenarModalAgregar(id) {
    const tituloModal =  document.getElementById("tituloModalAgregar");
    const botonAcciones = document.getElementById("btnAccionesModal");
    const selectTipoUsuario = document.getElementById("tipoUsuario");
    const tiposUsuarios = await obtenerTiposDeUsuarios(serverIP);
    const nombreUsuario = document.getElementById("nombreUsuario");
    const apellidoUsuario = document.getElementById("apellidoUsuario");
    const nickNameUsuario = document.getElementById("nickNameUsuario");
    const eliminarUsuario = document.getElementById("btnEliminarUsuario");
    selectTipoUsuario.innerHTML = "";
    tiposUsuarios.forEach(tipoUsuario => {
        if(tipoUsuario.id != 1){
            const option = document.createElement("option");
            option.value = tipoUsuario.id;
            option.text = tipoUsuario.tipo;
            selectTipoUsuario.add(option);
        }
    });
    if(id == null){
        tituloModal.innerText = "Agregar Usuario";
        botonAcciones.innerText = "Agregar Usuario";
        botonAcciones.onclick = () => agregarUsuario();
        nombreUsuario.value = "";
        apellidoUsuario.value = "";
        nickNameUsuario.value = "";
        eliminarUsuario.style.display = "none";
    }else{
        const usuarioEditar = await obtenerUsuarioPorId(serverIP, id);
        tituloModal.innerText = `Editar Usuario: ${usuarioEditar.nickNameUsuario}`;
        botonAcciones.innerText = "Editar Usuario";
        botonAcciones.onclick = () => editarUsuario(id);
        nombreUsuario.value = usuarioEditar.nombre;
        apellidoUsuario.value = usuarioEditar.apellido;
        nickNameUsuario.value = usuarioEditar.nickNameUsuario;
        const tipoUsuario = document.getElementById("tipoUsuario");
        tipoUsuario.value = usuarioEditar.idTipoUsuario;
        eliminarUsuario.onclick = () => deleteUser(usuarioEditar.id, usuarioEditar.nickNameUsuario);
        eliminarUsuario.style.display = "block";
        eliminarUsuario.classList.add("button");
        eliminarUsuario.classList.add("red-button");
    }
}

function agregarUsuario(){
    let puede = 0;
    const nombre = document.getElementById("nombreUsuario").value;
    const apellido = document.getElementById("apellidoUsuario").value;
    const nickNameUsuario = document.getElementById("nickNameUsuario").value;
    const passwordUsuario = document.getElementById("passwordUsuario").value;
    const tipoUsuario = document.getElementById("tipoUsuario");

    const categoriaUsuario = tipoUsuario.options[tipoUsuario.selectedIndex];
    const nombreCategoriaUsuario = categoriaUsuario.text;

    if(nombre.trim()==0 || nombre.length == 0 || nombre.length < 3){
        generarMensaje("red", "nombre no puede estar vacío");
        puede += 1;
    }

    if(apellido.trim()==0 || apellido.length == 0 || apellido.length < 3){
        generarMensaje("red", "apellido no puede estar vacío");
        puede += 1;
    }

    if(nickNameUsuario.trim()==0 || nickNameUsuario.length == 0 || nickNameUsuario.length < 3){
        generarMensaje("red", "Nickname del usuario no puede estar vacío");
        puede += 1;
    }

    if(passwordUsuario.trim()==0 || passwordUsuario.length == 0 || passwordUsuario.length < 3){
        generarMensaje("red", "Contraseña del usuario no puede estar vacía");
        puede += 1;
    }

    if(puede > 0){
        generarMensaje("red", "revise los datos del formulario para poder generar el usuario")
    }else{
        const nuevoUsuario = {
            nombre,
            apellido,
            nickNameUsuario,
            password: passwordUsuario,
            tipoUsuario: nombreCategoriaUsuario,
            idTipoUsuario: categoriaUsuario.value, // Usamos value para obtener el id del tipo
        };

        crearUsuario(serverIP, nuevoUsuario);
        closeModalAgregar();
    }
}

async function editarUsuario(id) {
    let puede = 0;
    const datosUsuario = await obtenerUsuarioPorId(serverIP, id);

    const nombre = document.getElementById("nombreUsuario").value;
    const apellido = document.getElementById("apellidoUsuario").value;
    const nickNameUsuario = document.getElementById("nickNameUsuario").value;
    const passwordUsuario = document.getElementById("passwordUsuario").value;
    const tipoUsuarioSelect = document.getElementById("tipoUsuario");

    let nombreCategoriaUsuario = "";
    if (tipoUsuarioSelect.selectedIndex >= 0) {
        const categoriaUsuario = tipoUsuarioSelect.options[tipoUsuarioSelect.selectedIndex];
        nombreCategoriaUsuario = categoriaUsuario.text;
    } else {
        generarMensaje("red", "Debe seleccionar un tipo de usuario válido.");
        puede += 1;
    }

    const usuario = {
        nombre,
        apellido,
        nickNameUsuario,
        password: passwordUsuario || datosUsuario.password,
        tipoUsuario: nombreCategoriaUsuario,
        idTipoUsuario: tipoUsuarioSelect.value
    };

    // Validaciones
    if (nombre.length <= 3) {
        puede += 1;
        generarMensaje("red", "Nombre del usuario debe tener más de 3 caracteres");
    }

    if (apellido.length <= 3) {
        puede += 1;
        generarMensaje("red", "Apellido del usuario debe tener más de 3 caracteres");
    }

    if (nickNameUsuario.length <= 3) {
        puede += 1;
        generarMensaje("red", "Nickname del usuario debe tener más de 3 caracteres");
    }

    if (puede === 0) {
        actualizarUsuario(serverIP, id, usuario);
        closeModalAgregar();
    } else {
        generarMensaje("red", "Revise los campos para poder actualizar el usuario");
    }
}

async function deleteUser(id,nombre) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${nombre}?`)) {
        eliminarUsuario(serverIP, id);
        closeModalAgregar();
    }
}

function openModalAgregar(id) {
    document.getElementById('modalAgregar').style.display = 'flex';
    llenarModalAgregar(id);
}

function closeModalAgregar() {
    document.getElementById('modalAgregar').style.display = 'none';
}

async function obtenerUsuarios(serverIP) {
    try {
      const response = await fetch(`http://${serverIP}:3000/api/usuarios`);
      if (!response.ok) throw new Error('Error al obtener usuarios');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      return null;
    }
}