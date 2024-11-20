async function iniciarSesion(){
    event.preventDefault();
    const usuario = document.getElementById("username").value;
    const contraseña = document.getElementById("password").value;
    const mensaje = await login(serverIP, usuario, contraseña);
    generarMensaje("green",`iniciando sesion ${serverIP} - ${usuario} - ${contraseña}`);
    console.log(`iniciando sesion ${serverIP} - ${usuario} - ${contraseña}`);
    if(mensaje == "no logueado"){
        generarMensaje("red","usuario y/o contraseña incorrecta");
    }else if(mensaje == "administrador" || mensaje == "superAdministrador"){
        localStorage.setItem('usuario', usuario);
        window.location.href = `http://${serverIP}:3000/administrador/actual`;
    }else {
        generarMensaje("yellow", "vista aún no creada");
    }
}