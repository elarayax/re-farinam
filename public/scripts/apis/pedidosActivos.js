async function obtenerPedidosActivos(serverIP) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/pedidos/activos/`);
        if (!response.ok) throw new Error('Error al obtener pedidos activos');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al obtener el pedido activo con ID ${id}:`, error);
        return null;
    }
}

async function obtenerPedidoActivoPorId(serverIP, id) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/pedidos/activos/${id}`);
        if (!response.ok) throw new Error('Error al obtener el pedido activo');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al obtener el pedido activo con ID ${id}:`, error);
        return null;
    }
}

async function crearPedidoActivo(serverIP, nuevoPedido) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/pedidos/activos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoPedido),
        });
        if (!response.ok) throw new Error('Error al crear el pedido activo');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al crear el pedido activo:', error);
        return null;
    }
}

async function actualizarPedidoActivo(serverIP, id, pedidoActualizado) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/pedidos/activos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoActualizado),
        });
        if (!response.ok) throw new Error('Error al actualizar el pedido activo');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al actualizar el pedido activo con ID ${id}:`, error);
        return null;
    }
}

async function eliminarPedidoActivo(serverIP, id) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/pedidos/activos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el pedido activo');
        return 'Pedido eliminado con éxito';
    } catch (error) {
        console.error(`Error al eliminar el pedido activo con ID ${id}:`, error);
        return null;
    }
}

async function finalizarPedidoActivo(serverIP, id, dataFinalizar) {
    try {
        const response = await fetch(`http://${serverIP}:3000/api/pedidos/activos/${id}/finalizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataFinalizar),
        });
        if (!response.ok) throw new Error('Error al finalizar el pedido');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al finalizar el pedido con ID ${id}:`, error);
        return null;
    }
}


async function buscarPedidosActivos(serverIP, filtros) {
    try {
        const queryParams = new URLSearchParams(filtros).toString();
        const response = await fetch(`http://${serverIP}:3000/api/pedidos/activos/buscar?${queryParams}`);
        if (!response.ok) throw new Error('Error al buscar los pedidos activos');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al buscar los pedidos activos:', error);
        return null;
    }
}
