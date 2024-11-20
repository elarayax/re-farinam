// Obtener los métodos de pago
async function obtenerMetodosPago(serverIP) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/metodosPago`);
        if (!response.ok) throw new Error('Error al obtener los métodos de pago');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener los métodos de pago:', error);
        return null;
    }
}

// Crear un nuevo método de pago
async function crearMetodoPago(serverIP, nuevoMetodoPago) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/metodosPago`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoMetodoPago),
        });
        if (!response.ok) throw new Error('Error al crear el método de pago');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al crear el método de pago:', error);
        return null;
    }
}

// Actualizar un método de pago existente
async function actualizarMetodoPago(serverIP, id, metodoPagoActualizado) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/metodosPago/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metodoPagoActualizado),
        });
        if (!response.ok) throw new Error('Error al actualizar el método de pago');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al actualizar el método de pago con ID ${id}:`, error);
        return null;
    }
}

// Eliminar un método de pago
async function eliminarMetodoPago(serverIP, id) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/metodosPago/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el método de pago');
        return 'Método de pago eliminado con éxito';
    } catch (error) {
        console.error(`Error al eliminar el método de pago con ID ${id}:`, error);
        return null;
    }
}
