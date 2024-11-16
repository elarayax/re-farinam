function generarMensaje(color, mensaje) {
    const container = document.getElementById('mensaje-container');
    
    // Crear el elemento del mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.classList.add('mensaje');
    let colores = "";
    if(color == "red"){
        colores = "#dc3545";
    }else if(color == "green"){
        colores = "#28a745";
    }else if(color == "yellow"){
        colores = "#ffc107";
    }

    mensajeDiv.style.backgroundColor = colores;
    
    // Agregar el contenido del mensaje
    mensajeDiv.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="cerrarMensaje(this)">✖</button>
    `;
    
    // Añadir el mensaje al contenedor
    container.appendChild(mensajeDiv);
    
    // Eliminar el mensaje automáticamente después de 3 segundos
    setTimeout(() => {
        if (mensajeDiv.parentElement) {
            mensajeDiv.remove();
        }
    }, 3000);
}

// Función para cerrar el mensaje al hacer clic en el botón
function cerrarMensaje(button) {
    button.parentElement.remove();
}