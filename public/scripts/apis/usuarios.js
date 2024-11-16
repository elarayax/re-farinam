async function obtenerUsuarioPorId(serverIP, id) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/usuarios/${id}`);
        if (!response.ok) throw new Error('Error al obtener el usuario');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener el usuario por ID:", error);
        return null;
    }
}

// Función para crear un nuevo usuario
async function crearUsuario(serverIP, nuevoUsuario) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/usuarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoUsuario),
    });
    if (!response.ok) throw new Error('Error al crear el usuario');
    
    const data = await response.json();
    return data;
    } catch (error) {
        console.error("Error al crear usuario:", error);
        return null;
    }
}

// Función para actualizar un usuario
async function actualizarUsuario(serverIP, id, usuarioActualizado) {
  try {
    const response = await fetch(`http://${serverIP}:3000/api/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioActualizado),
    });
    if (!response.ok) throw new Error('Error al actualizar el usuario');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return null;
  }
}

// Función para eliminar un usuario
async function eliminarUsuario(serverIP, id) {
  try {
    const response = await fetch(`http://${serverIP}:3000/api/usuarios/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar el usuario');
    
    return 'Usuario eliminado con éxito';
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return null;
  }
}

async function login(serverIP, nickname, password) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();

        // Guardar en localStorage
        localStorage.setItem('userId', data.id);
        localStorage.setItem('isLoggedIn', true);
        localStorage.setItem('userType', data.tipoUsuario);

        return data.tipoUsuario;
    } catch (error) {
        console.error('Error en login:', error);
        return "no logueado";
    }
}