// src/pages/Carrito.jsx
// pagina del carrito de compras
// el usuario puede ver, modificar cantidades y confirmar su pedido
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { confirmarPedido, confirmarPedidoSelectivo } from '../services/pedidos.service'
import { crearPago } from '../services/pagos.service'

const Carrito = () => {
    const { carrito, cargando, actualizar, eliminar } = useCarrito()
    // ids de items seleccionados para confirmacion selectiva
    const [seleccionados, setSeleccionados] = useState([])
    const [error, setError] = useState(null)
    const [procesando, setProcesando] = useState(false)

    const navigate = useNavigate()

    // alterna la seleccion de un item para confirmacion selectiva
    const toggleSeleccion = (itemId) => {
        setSeleccionados(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
    }

    // confirma todos los items del carrito
    const handleConfirmarTodo = async () => {
        setProcesando(true)
        setError(null)
        try {
            const pedido = await confirmarPedido()
            // redirigimos al pago con el pedido_id
            await handlePago(pedido.pedido_id, pedido.total)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al confirmar el pedido')
        } finally {
            setProcesando(false)
        }
    }

    // confirma solo los items seleccionados
    const handleConfirmarSelectivo = async () => {
        if (seleccionados.length === 0) {
            setError('Selecciona al menos un producto')
            return
        }
        setProcesando(true)
        setError(null)
        try {
            const pedido = await confirmarPedidoSelectivo(seleccionados)
            await handlePago(pedido.pedido_id, pedido.total)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al confirmar el pedido')
        } finally {
            setProcesando(false)
        }
    }

    // crea el pago en stripe y redirige — por ahora mostramos el client_secret
    // cuando integremos Stripe.js completaremos el pago aqui
    const handlePago = async (pedidoId, total) => {
        // redirigimos a la pagina de pago con los datos del pedido
        navigate('/pago', { state: { pedido_id: pedidoId, total } })
    }

    if (cargando) return <p style={styles.centro}>Cargando carrito...</p>

    // si el carrito esta vacio mostramos mensaje con link a la tienda
    if (!carrito?.items?.length) return (
        <div style={styles.vacio}>
            <p>Tu carrito está vacío 🛒</p>
            {/* link a la tienda sin recargar la pagina */}
            <Link to="/" style={styles.link}>Ver productos</Link>
        </div>
    )

    // calculamos el total de los items seleccionados
    const totalSeleccionado = carrito.items
        .filter(item => seleccionados.includes(item.id))
        .reduce((acc, item) => acc + (item.cantidad * (item.producto?.precio || 0)), 0)

    return (
        <div style={styles.container}>
            <h1 style={styles.titulo}>Mi Carrito</h1>

            {error && <p style={styles.error}>{error}</p>}

            {/* lista de items del carrito */}
            <div style={styles.lista}>
                {carrito.items.map(item => (
                    <div key={item.id} style={styles.item}>
                        {/* checkbox para seleccion selectiva */}
                        <input
                            type="checkbox"
                            checked={seleccionados.includes(item.id)}
                            onChange={() => toggleSeleccion(item.id)}
                            style={styles.checkbox}
                        />

                        {/* imagen miniatura del producto */}
                        {item.producto?.imagen_url ? (
                            <img
                                src={`http://localhost:8800${item.producto.imagen_url}`}
                                alt={item.producto.nombre}
                                style={styles.miniatura}
                            />
                        ) : (
                            <div style={styles.miniaturaPlaceholder}>📦</div>
                        )}

                        <div style={styles.itemInfo}>
                            {/* nombre del producto en vez de Producto #id */}
                            <p style={styles.itemNombre}>{item.producto?.nombre || `Producto #${item.producto_id}`}</p>
                            <p style={styles.itemPrecio}>{item.producto?.precio}€ / unidad</p>
                        </div>

                        {/* control de cantidad */}
                        <div style={styles.cantidad}>
                            <button
                                onClick={() => actualizar(item.id, item.cantidad - 1)}
                                style={styles.btnCantidad}
                            >-</button>
                            <span style={styles.cantidadNum}>{item.cantidad}</span>
                            <button
                                onClick={() => actualizar(item.id, item.cantidad + 1)}
                                style={styles.btnCantidad}
                            >+</button>
                        </div>

                        <button
                            onClick={() => eliminar(item.id)}
                            style={styles.btnEliminar}
                        >🗑️</button>
                    </div>
                ))}
            </div>

            {/* acciones del carrito */}
            <div style={styles.acciones}>
                {/* confirmar solo los seleccionados */}
                {seleccionados.length > 0 && (
                    <button
                        onClick={handleConfirmarSelectivo}
                        disabled={procesando}
                        style={styles.botonSecundario}
                    >
                        Comprar seleccionados ({seleccionados.length})
                    </button>
                )}

                {/* confirmar todo el carrito */}
                <button
                    onClick={handleConfirmarTodo}
                    disabled={procesando}
                    style={styles.boton}
                >
                    {procesando ? 'Procesando...' : 'Comprar todo'}
                </button>
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto'
    },
    titulo: {
        marginBottom: '2rem',
        color: '#1a1a1a'
    },
    lista: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem'
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer'
    },
    itemInfo: {
        flex: 1
    },
    itemNombre: {
        margin: 0,
        fontWeight: 'bold'
    },
    cantidad: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    cantidadNum: {
        minWidth: '2rem',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    btnCantidad: {
        backgroundColor: '#f0f0f0',
        border: 'none',
        borderRadius: '4px',
        padding: '0.25rem 0.75rem',
        cursor: 'pointer',
        fontSize: '1.1rem'
    },
    btnEliminar: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.25rem'
    },
    acciones: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem'
    },
    boton: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '0.75rem 2rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    botonSecundario: {
        backgroundColor: '#2d6a4f',
        color: 'white',
        padding: '0.75rem 2rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    vacio: {
        textAlign: 'center',
        padding: '4rem',
        color: '#666'
    },
    link: {
        display: 'inline-block',
        marginTop: '1rem',
        color: '#1a1a1a',
        fontWeight: 'bold'
    },
    centro: {
        textAlign: 'center',
        padding: '2rem'
    },
    error: {
        color: '#e53e3e',
        marginBottom: '1rem'
    },
    miniatura: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px'
},
miniaturaPlaceholder: {
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '1.5rem'
},
itemPrecio: {
    fontSize: '0.85rem',
    color: '#2d6a4f',
    margin: 0
}
}

export default Carrito