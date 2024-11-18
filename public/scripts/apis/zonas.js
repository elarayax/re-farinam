// Obtener todas las zonas
async function obtenerZonas(serverIP) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/zonas`);
        if (!response.ok) throw new Error('Error al obtener las zonas');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener las zonas:', error);
        return null;
    }
}

// Crear una nueva zona
async function crearZona(serverIP, nuevaZona) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/zonas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevaZona),
        });
        if (!response.ok) throw new Error('Error al crear la zona');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al crear la zona:', error);
        return null;
    }
}

// Actualizar una zona existente
async function actualizarZona(serverIP, id, zonaActualizada) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/zonas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(zonaActualizada),
        });
        if (!response.ok) throw new Error('Error al actualizar la zona');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al actualizar la zona con ID ${id}:`, error);
        return null;
    }
}

// Eliminar una zona
async function eliminarZona(serverIP, id) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/zonas/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar la zona');
        return 'Zona eliminada con éxito';
    } catch (error) {
        console.error(`Error al eliminar la zona con ID ${id}:`, error);
        return null;
    }
}

// Obtener las mesas de una zona específica
async function obtenerMesasDeZona(serverIP, zonaId) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/zonas/${zonaId}/mesas`);
        if (!response.ok) throw new Error('Error al obtener las mesas de la zona');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al obtener las mesas de la zona con ID ${zonaId}:`, error);
        return null;
    }
}

// Crear una nueva mesa en una zona
async function crearMesaEnZona(serverIP, zonaId, nuevaMesa) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/zonas/${zonaId}/mesas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevaMesa),
        });
        if (!response.ok) throw new Error('Error al crear la mesa en la zona');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al crear la mesa en la zona con ID ${zonaId}:`, error);
        return null;
    }
}

// Actualizar una mesa en una zona
async function actualizarMesaEnZona(serverIP, zonaId, mesaNumero, mesaActualizada) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/zonas/${zonaId}/mesas/${mesaNumero}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mesaActualizada),
        });
        if (!response.ok) throw new Error('Error al actualizar la mesa en la zona');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al actualizar la mesa con número ${mesaNumero} en la zona con ID ${zonaId}:`, error);
        return null;
    }
}

// Eliminar una mesa de una zona
async function eliminarMesaDeZona(serverIP, zonaId, mesaNumero) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/zonas/${zonaId}/mesas/${mesaNumero}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar la mesa de la zona');
        return 'Mesa eliminada con éxito';
    } catch (error) {
        console.error(`Error al eliminar la mesa con número ${mesaNumero} de la zona con ID ${zonaId}:`, error);
        return null;
    }
}
