// src/services/api.js
// configuramos axios con la URL base del backend
// todas las peticiones usaran esta configuracion automaticamente
import axios from 'axios'

const api = axios.create({
    // URL base del backend FastAPI
    baseURL: 'http://localhost:8800/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
})

// interceptor de peticion — se ejecuta antes de cada peticion
// añade el token de autenticacion automaticamente si existe
api.interceptors.request.use((config) => {
    // obtenemos el token del localStorage si existe
    const token = localStorage.getItem('token')
    if (token) {
        // añadimos el token en el header Authorization
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// interceptor de respuesta — se ejecuta despues de cada respuesta
// si el token expiro redirigimos al login automaticamente
api.interceptors.response.use(
    // si la respuesta es correcta la dejamos pasar
    (response) => response,
    (error) => {
        // si el servidor devuelve 401 el token expiro o es invalido
        if (error.response?.status === 401) {
            // limpiamos el token y redirigimos al login
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api