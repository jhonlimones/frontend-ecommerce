// src/context/AuthContext.jsx
// contexto global de autenticacion — gestiona el estado del usuario en toda la app
// cualquier componente puede acceder al usuario actual y a las funciones de login/logout
import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginService, obtenerPerfil } from '../services/auth.service'

// creamos el contexto — sera el contenedor del estado global de auth
const AuthContext = createContext(null)

// proveedor del contexto — envuelve toda la app para que todos los componentes
// tengan acceso al estado de autenticacion
export const AuthProvider = ({ children }) => {
    // usuario actual — null si no esta autenticado
    const [usuario, setUsuario] = useState(null)
    // estado de carga — evita mostrar la app antes de verificar el token
    const [cargando, setCargando] = useState(true)

    // al iniciar la app verificamos si hay un token guardado en localStorage
    // si existe intentamos obtener el perfil del usuario para restaurar la sesion
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            obtenerPerfil()
                .then(setUsuario)
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setCargando(false))
        } else {
            setCargando(false)
        }
    }, [])

    // funcion de login — guarda el token y obtiene el perfil del usuario
    const login = async (email, password) => {
        const data = await loginService(email, password)
        // guardamos el token en localStorage para persistir la sesion
        localStorage.setItem('token', data.access_token)
        // obtenemos el perfil completo del usuario
        const perfil = await obtenerPerfil()
        setUsuario(perfil)
        return perfil
    }

    // funcion de logout — limpia el token y el estado del usuario
    const logout = () => {
        localStorage.removeItem('token')
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{
            usuario,        // datos del usuario actual
            cargando,       // true mientras se verifica el token
            login,          // funcion para iniciar sesion
            logout,         // funcion para cerrar sesion
            esAdmin: usuario?.es_admin ?? false  // true si el usuario es admin
        }}>
            {/* no renderizamos nada hasta verificar el token */}
            {!cargando && children}
        </AuthContext.Provider>
    )
}

// hook personalizado para usar el contexto facilmente en cualquier componente
// uso: const { usuario, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext)