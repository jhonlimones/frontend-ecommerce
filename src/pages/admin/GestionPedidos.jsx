// src/pages/admin/GestionPedidos.jsx
// pagina de gestion de pedidos para el admin
// muestra todos los pedidos de todos los usuarios y permite cambiar su estado
import { useState, useEffect } from 'react'
import api from '../../services/api'

// estados posibles de un pedido y su siguiente estado logico
const siguienteEstado = {
    pendiente:  'pagado',
    pagado:     'enviado',
    enviado:    'entregado',
    entregado:  null,       // estado final — no hay siguiente
    cancelado:  null        // estado final — no hay siguiente
}

// colores para cada estado del pedido
const coloresEstado = {
    pendiente:  { bg: '#fefcbf', color: '#744210' },
    pagado:     { bg: '#c6f6d5', color: '#22543d' },
    enviado:    { bg: '#bee3f8', color: '#2a4365' },
    entregado:  { bg: '#e9d8fd', color: '#44337a' },
    cancelado:  { bg: '#fed7d7', color: '#742a2a' }
}

const GestionPedidos = () => {
    const [pedidos, setPedidos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [mensaje, setMensaje] = useState(null)
    // filtro por estado — null muestra todos
    const [filtroEstado, setFiltroEstado] = useState(null)
    // id del pedido expandido para ver detalles
    const [expandido, setExpandido] = useState(null)

    useEffect(() => {
        cargarPedidos()
    }, [])

    const cargarPedidos = async () => {
        try {
            // usamos el endpoint de admin que devuelve todos los pedidos
            const response = await api.get('/pedido/todos')
            setPedidos(response.data)
        } catch {
            setError('Error al cargar los pedidos')
        } finally {
            setCargando(false)
        }
    }

    // avanza el estado del pedido al siguiente estado logico
    const handleAvanzarEstado = async (pedidoId, estadoActual) => {
        const nuevoEstado = siguienteEstado[estadoActual]
        if (!nuevoEstado) return

        try {
            await api.patch(`/pedido/${pedidoId}/estado`, { estado: nuevoEstado })
            setMensaje(`Pedido #${pedidoId} actualizado a "${nuevoEstado}" ✓`)
            await cargarPedidos()
            setTimeout(() => setMensaje(null), 3000)
        } catch {
            setError('Error al actualizar el estado')
        }
    }

    // cancela un pedido directamente
    const handleCancelar = async (pedidoId) => {
        if (!window.confirm('¿Seguro que quieres cancelar este pedido?')) return
        try {
            await api.patch(`/pedido/${pedidoId}/estado`, { estado: 'cancelado' })
            setMensaje(`Pedido #${pedidoId} cancelado ✓`)
            await cargarPedidos()
            setTimeout(() => setMensaje(null), 3000)
        } catch {
            setError('Error al cancelar el pedido')
        }
    }

    // filtra los pedidos por estado si hay un filtro activo
    const pedidosFiltrados = filtroEstado
        ? pedidos.filter(p => p.estado === filtroEstado)
        : pedidos

    if (cargando) return <p style={styles.centro}>Cargando pedidos...</p>

    return (
        <div style={styles.container}>
            <h1 style={styles.titulo}>Gestión de Pedidos</h1>

            {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
            {error && <p style={styles.error}>{error}</p>}

            {/* filtros por estado */}
            <div style={styles.filtros}>
                <button
                    onClick={() => setFiltroEstado(null)}
                    style={filtroEstado === null ? styles.filtroActivo : styles.filtro}
                >Todos ({pedidos.length})</button>
                {Object.keys(coloresEstado).map(estado => (
                    <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        style={filtroEstado === estado ? styles.filtroActivo : styles.filtro}
                    >
                        {estado} ({pedidos.filter(p => p.estado === estado).length})
                    </button>
                ))}
            </div>

            {/* lista de pedidos */}
            <div style={styles.lista}>
                {pedidosFiltrados.map(pedido => (
                    <div key={pedido.id} style={styles.card}>
                        {/* cabecera del pedido */}
                        <div style={styles.cabecera}>
                            <div
                                style={styles.cabeceraInfo}
                                onClick={() => setExpandido(prev => prev === pedido.id ? null : pedido.id)}
                            >
                                <span style={styles.pedidoId}>Pedido #{pedido.id}</span>
                                <span style={styles.fecha}>
                                    👤 {pedido.usuario?.nombre} · {pedido.usuario?.email} · {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                                </span>
                            </div>

                            <div style={styles.cabeceraAcciones}>
                                <span style={styles.total}>{pedido.total}€</span>

                                {/* badge de estado con color */}
                                <span style={{
                                    ...styles.estado,
                                    backgroundColor: coloresEstado[pedido.estado]?.bg,
                                    color: coloresEstado[pedido.estado]?.color
                                }}>
                                    {pedido.estado}
                                </span>

                                {/* boton para avanzar al siguiente estado */}
                                {siguienteEstado[pedido.estado] && (
                                    <button
                                        onClick={() => handleAvanzarEstado(pedido.id, pedido.estado)}
                                        style={styles.botonAvanzar}
                                    >
                                        → {siguienteEstado[pedido.estado]}
                                    </button>
                                )}

                                {/* boton cancelar — solo si el pedido no esta en estado final */}
                                {pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' && (
                                    <button
                                        onClick={() => handleCancelar(pedido.id)}
                                        style={styles.botonCancelar}
                                    >Cancelar</button>
                                )}
                            </div>
                        </div>

                        {/* detalles del pedido — visible solo si esta expandido */}
                        {expandido === pedido.id && (
                            <div style={styles.detalles}>
                                {pedido.detalles.length === 0 ? (
                                    <p style={styles.sinDetalles}>Sin detalles</p>
                                ) : (
                                    pedido.detalles.map(detalle => (
                                        <div key={detalle.id} style={styles.detalle}>
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
        maxWidth: '1200px',
        margin: '0 auto'
    },
    titulo: {
        color: '#1a1a1a',
        marginBottom: '2rem'
    },
    filtros: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
    },
    filtro: {
        padding: '0.4rem 0.75rem',
        border: '1px solid #ddd',
        borderRadius: '20px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        fontSize: '0.85rem'
    },
    filtroActivo: {
        padding: '0.4rem 0.75rem',
        border: '1px solid #1a1a1a',
        borderRadius: '20px',
        cursor: 'pointer',
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontSize: '0.85rem'
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
        flexWrap: 'wrap',
        gap: '1rem'
    },
    cabeceraInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        cursor: 'pointer'
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
        gap: '0.75rem',
        flexWrap: 'wrap'
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
    botonAvanzar: {
        backgroundColor: '#2d6a4f',
        color: 'white',
        padding: '0.4rem 0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem'
    },
    botonCancelar: {
        backgroundColor: '#e53e3e',
        color: 'white',
        padding: '0.4rem 0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem'
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
    mensaje: {
        backgroundColor: '#c6f6d5',
        color: '#2d6a4f',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    error: {
        color: '#e53e3e',
        marginBottom: '1rem'
    },
    centro: {
        textAlign: 'center',
        padding: '2rem'
    }
}

export default GestionPedidos