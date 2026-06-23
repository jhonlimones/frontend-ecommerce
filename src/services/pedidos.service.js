// src/services/pedidos.service.js
// funciones para comunicarse con los endpoints de pedidos
import api from './api'

// confirmar todos los items del carrito como pedido
export const confirmarPedido = async () => {
    const response = await api.post('/pedido/confirmar')
    return response.data
}

// confirmar solo algunos items del carrito
export const confirmarPedidoSelectivo = async (itemIds) => {
    const response = await api.post('/pedido/confirmar-selectivo', { item_ids: itemIds })
    return response.data
}

// obtener historial de pedidos del usuario
export const obtenerMisPedidos = async () => {
    const response = await api.get('/pedido/mis-pedidos')
    return response.data
}

// obtener detalle de un pedido
export const obtenerPedido = async (pedidoId) => {
    const response = await api.get(`/pedido/${pedidoId}`)
    return response.data
}