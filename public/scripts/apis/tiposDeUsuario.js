async function obtenerTiposDeUsuarios(serverIP) {
  try {
    const response = await fetch(`http://${serverIP}:3000/api/tiposUsuario`);
    if (!response.ok) throw new Error('Error al obtener tipos de usuario');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar tipos de usuario:", error);
    return null;
  }
}