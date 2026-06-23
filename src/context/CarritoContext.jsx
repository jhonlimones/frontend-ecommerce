// src/context/CarritoContext.jsx
// contexto global del carrito — gestiona el estado del carrito en toda la app
// cualquier componente puede acceder al carrito y a las funciones de agregar/eliminar
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import {
    obtenerCarrito,
    agregarProducto,
    eliminarItem,
    actualizarCantidad
} from '../services/carrito.service'

const CarritoContext = createContext(null)

export const CarritoProvider = ({ children }) => {
    // estado del carrito — contiene id, usuario_id e items
    const [carrito, setCarrito] = useState(null)
    // estado de carga
    const [cargando, setCargando] = useState(false)
    // obtenemos el usuario actual del contexto de auth
    const { usuario } = useAuth()

    // cargamos el carrito cuando el usuario inicia sesion
    // si cierra sesion vaciamos el carrito
    useEffect(() => {
        if (usuario) {
            cargarCarrito()
        } else {
            setCarrito(null)
        }
    }, [usuario])

    // obtiene el carrito actualizado del backend
    const cargarCarrito = async () => {
        try {
            setCargando(true)
            const data = await obtenerCarrito()
            setCarrito(data)
        } catch (error) {
            console.error('Error al cargar carrito:', error)
        } finally {
            setCargando(false)
        }
    }

    // agrega un producto al carrito y recarga el estado
    const agregar = async (productoId, cantidad = 1) => {
        await agregarProducto(productoId, cantidad)
        await cargarCarrito()
    }

    // elimina un item del carrito y recarga el estado
    const eliminar = async (itemId) => {
        await eliminarItem(itemId)
        await cargarCarrito()
    }

    // actualiza la cantidad de un item — si es 0 lo elimina
    const actualizar = async (itemId, cantidad) => {
        await actualizarCantidad(itemId, cantidad)
        await cargarCarrito()
    }

    // numero total de items en el carrito — para mostrar en el icono del carrito
    const totalItems = carrito?.items?.reduce((acc, item) => acc + item.cantidad, 0) ?? 0

    return (
        <CarritoContext.Provider value={{
            carrito,        // datos completos del carrito
            cargando,       // true mientras carga
            totalItems,     // numero total de items para el icono
            agregar,        // agregar producto al carrito
            eliminar,       // eliminar item del carrito
            actualizar,     // actualizar cantidad de un item
            cargarCarrito   // recargar el carrito manualmente
        }}>
            {children}
        </CarritoContext.Provider>
    )
}

// hook personalizado para usar el contexto facilmente
// uso: const { carrito, agregar, eliminar } = useCarrito()
export const useCarrito = () => useContext(CarritoContext)