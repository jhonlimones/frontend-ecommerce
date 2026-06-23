// src/pages/Pedidos.jsx
// pagina de historial de pedidos del usuario
// muestra todos los pedidos con su estado y detalles
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { obtenerMisPedidos } from '../services/pedidos.service'

// colores para cada estado del pedido
const coloresEstado = {
    pendiente:  { bg: '#fefcbf', color: '#744210' },
    pagado:     { bg: '#c6f6d5', color: '#22543d' },
    enviado:    { bg: '#bee3f8', color: '#2a4365' },
    entregado:  { bg: '#e9d8fd', color: '#44337a' },
    cancelado:  { bg: '#fed7d7', color: '#742a2a' }
}

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    // id del pedido expandido para ver detalles
    const [expandido, setExpandido] = useState(null)

    useEffect(() => {
        obtenerMisPedidos()
            .then(setPedidos)
            .catch(() => setError('Error al cargar los pedidos'))
            .finally(() => setCargando(false))
    }, [])

    // alterna la expansion de un pedido para ver sus detalles
    const toggleExpandir = (pedidoId) => {
        setExpandido(prev => prev === pedidoId ? null : pedidoId)
    }

    if (cargando) return <p style={styles.centro}>Cargando pedidos...</p>
    if (error) return <p style={styles.error}>{error}</p>

    // si no hay pedidos mostramos mensaje con link a la tienda
    if (!pedidos.length) return (
        <div style={styles.vacio}>
            <p>No tienes pedidos aún 📦</p>
            <Link to="/" style={styles.link}>Ir a la tienda</Link>
        </div>
    )

    return (
        <div style={styles.container}>
            <h1 style={styles.titulo}>Mis Pedidos</h1>

            <div style={styles.lista}>
                {pedidos.map(pedido => (
                    <div key={pedido.id} style={styles.card}>
                        {/* cabecera del pedido — siempre visible */}
                        <div
                            style={styles.cabecera}
                            onClick={() => toggleExpandir(pedido.id)}
                        >
                            <div style={styles.cabeceraInfo}>
                                <span style={styles.pedidoId}>Pedido #{pedido.id}</span>
                                <span style={styles.fecha}>
                                    {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                                </span>
                            </div>

                            <div style={styles.cabeceraAcciones}>
                                <span style={styles.total}>{pedido.total}€</span>
                                {/* badge de estado con color segun el estado */}
                                <span style={{
                                    ...styles.estado,
                                    backgroundColor: coloresEstado[pedido.estado]?.bg,
                                    color: coloresEstado[pedido.estado]?.color
                                }}>
                                    {pedido.estado}
                                </span>
                                <span>{expandido === pedido.id ? '▲' : '▼'}</span>
                            </div>
                        </div>

                        {/* detalles del pedido — visible solo si esta expandido */}
                        {expandido === pedido.id && (
                            <div style={styles.detalles}>
                                {pedido.detalles.length === 0 ? (
                                    <p style={styles.sinDetalles}>Sin detalles disponibles</p>
                                ) : (
                                    pedido.detalles.map(detalle => (
                                        <div key={detalle.id} style={styles.detalle}>
                                            {/* imagen miniatura del producto */}
                                            {detalle.producto?.imagen_url ? (
                                                <img
                                                    src={`http://localhost:8800${detalle.producto.imagen_url}`}
                                                    alt={detalle.producto.nombre}
                                                    style={styles.miniatura}
                                                />
                                            ) : (
                                                <div style={styles.miniaturaPlaceholder}>📦</div>
                                            )}
                                            <span>{detalle.producto?.nombre || `Producto #${detalle.producto_id}`}</span>
                                            <span>x{detalle.cantidad}</span>
                                            <span>{detalle.subtotal}€</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}
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
        gap: '1rem'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    cabecera: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        cursor: 'pointer'
    },
    cabeceraInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    pedidoId: {
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    fecha: {
        fontSize: '0.85rem',
        color: '#666'
    },
    cabeceraAcciones: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    total: {
        fontWeight: 'bold',
        fontSize: '1.1rem'
    },
    estado: {
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold'
    },
    detalles: {
        borderTop: '1px solid #f0f0f0',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    detalle: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
    },
    sinDetalles: {
        color: '#666',
        textAlign: 'center'
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
        textAlign: 'center',
        padding: '2rem'
    },
    miniatura: {
    width: '40px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '4px'
},
miniaturaPlaceholder: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '1rem'
}
}

export default Pedidos