async function obtenerMenu(serverIP) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu`);
        if (!response.ok) throw new Error('Error al obtener el menú');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener el menú:", error);
        return null;
    }
}

async function obtenerMenuOrdenado(serverIP) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu/sorted`);
        if (!response.ok) throw new Error('Error al obtener el menú ordenado');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener el menú ordenado:", error);
        return null;
    }
}

async function agregarPlato(serverIP, nuevoPlato) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoPlato),
        });

        if (!response.ok) throw new Error('Error al agregar el plato');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al agregar el plato:", error);
        return null;
    }
}

async function buscarPlatosPorSubcategoria(serverIP, subcategoria) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu/busqueda?subcategoria=${subcategoria}`);
        if (!response.ok) throw new Error('Error al buscar platos por subcategoría');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al buscar platos por subcategoría:", error);
        return null;
    }
}

async function obtenerPlatoPorId(serverIP, id) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu/${id}`);
        if (!response.ok) throw new Error('Error al obtener el plato');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener el plato por ID:", error);
        return null;
    }
}

async function obtenerPlatoPorId(serverIP, id) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu/${id}`);
        if (!response.ok) throw new Error('Error al obtener el plato');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener el plato por ID:", error);
        return null;
    }
}

async function actualizarPlato(serverIP, id, platoActualizado) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/menu/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(platoActualizado),
        });

        if (!response.ok) throw new Error('Error al actualizar el plato');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al actualizar el plato:", error);
        return null;
    }
}

// Función para buscar platos por nombre
async function buscarPlatoPorNombre(serverIP, nombre) {
    try {
        // Hacer la solicitud a la API para buscar platos por nombre
        const response = await fetch(`http://${serverIP}:3000/api/menus/plato?nombre=${nombre}`);
        if (!response.ok) throw new Error('Error al buscar el plato por nombre');
        const data = await response.json();
        return data; // Devuelve los platos encontrados
    } catch (error) {
        console.error("Error al buscar el plato por nombre:", error);
        return null; // Devuelve null si hay un error
    }
}
