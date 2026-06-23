// src/services/productos.service.js
// funciones para comunicarse con los endpoints de productos del backend
import api from './api'

// obtener todos los productos — endpoint publico
export const obtenerProductos = async () => {
    const response = await api.get('/producto/')
    return response.data
}

// crear producto — solo admin
export const crearProducto = async (producto) => {
    const response = await api.post('/producto/productos', producto)
    return response.data
}

// actualizar producto — solo admin
export const actualizarProducto = async (id, producto) => {
    const response = await api.put(`/producto/productos/${id}`, producto)
    return response.data
}

// eliminar producto — solo admin
export const eliminarProducto = async (id) => {
    const response = await api.delete(`/producto/productos/${id}`)
    return response.data
}