// src/services/auth.service.js
// funciones para comunicarse con los endpoints de autenticacion del backend
import api from './api'

// login — envia las credenciales y recibe el token
// el backend espera form-data no JSON por OAuth2PasswordRequestForm
export const login = async (email, password) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

// registro — crea un nuevo usuario
export const registro = async (nombre, email, password) => {
    const response = await api.post('/auth/usuarios', { nombre, email, password })
    return response.data
}

// obtener perfil del usuario autenticado
export const obtenerPerfil = async () => {
    const response = await api.get('/auth/usuarios/me')
    return response.data
}