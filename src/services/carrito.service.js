// src/services/carrito.service.js
// funciones para comunicarse con los endpoints del carrito
import api from './api'

// obtener carrito del usuario autenticado
export const obtenerCarrito = async () => {
    const response = await api.get('/carrito/')
    return response.data
}

// agregar producto al carrito
export const agregarProducto = async (productoId, cantidad = 1) => {
    const response = await api.post(`/carrito/agregar/${productoId}?cantidad=${cantidad}`)
    return response.data
}

// actualizar cantidad de un item — si cantidad es 0 se elimina
export const actualizarCantidad = async (itemId, cantidad) => {
    const response = await api.patch(`/carrito/item/${itemId}?cantidad=${cantidad}`)
    return response.data
}

// eliminar item del carrito
export const eliminarItem = async (itemId) => {
    const response = await api.delete(`/carrito/eliminar/${itemId}`)
    return response.data
}