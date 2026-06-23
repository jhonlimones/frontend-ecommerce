// src/services/categorias.service.js
// funciones para comunicarse con los endpoints de categorias del backend
import api from './api'

// obtener todas las categorias — endpoint publico
export const obtenerCategorias = async () => {
    const response = await api.get('/categorias/categorias')
    return response.data
}

// crear categoria — solo admin
export const crearCategoria = async (nombre) => {
    const response = await api.post('/categorias/categorias', { nombre })
    return response.data
}