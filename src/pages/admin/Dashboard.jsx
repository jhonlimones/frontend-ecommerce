// src/pages/admin/Dashboard.jsx
// pagina principal del panel de administracion
// muestra un resumen general y acceso rapido a las secciones de admin
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { obtenerProductos } from '../../services/productos.service'
import { obtenerMisPedidos } from '../../services/pedidos.service'
import { useAuth } from '../../context/AuthContext'

const Dashboard = () => {
    const [totalProductos, setTotalProductos] = useState(0)
    const [totalPedidos, setTotalPedidos] = useState(0)
    const [pedidosPendientes, setPedidosPendientes] = useState(0)
    const [cargando, setCargando] = useState(true)
    const { usuario } = useAuth()

    useEffect(() => {
        // cargamos los datos del dashboard al montar el componente
        Promise.all([
            obtenerProductos(),
            obtenerMisPedidos()
        ]).then(([productos, pedidos]) => {
            setTotalProductos(productos.length)
            setTotalPedidos(pedidos.length)
            // contamos los pedidos que estan pendientes de procesar
            setPedidosPendientes(pedidos.filter(p => p.estado === 'pendiente').length)
        }).finally(() => setCargando(false))
    }, [])

    if (cargando) return <p style={styles.centro}>Cargando dashboard...</p>

    return (
        <div style={styles.container}>
            <h1 style={styles.titulo}>Panel de Administración</h1>
            <p style={styles.bienvenida}>Bienvenido, {usuario.nombre} 👋</p>

            {/* tarjetas de resumen */}
            <div style={styles.grid}>
                <div style={styles.card}>
                    <span style={styles.icono}>📦</span>
                    <h3 style={styles.cardTitulo}>Productos</h3>
                    <p style={styles.cardNumero}>{totalProductos}</p>
                    {/* link sin recarga de pagina */}
                    <Link to="/admin/productos" style={styles.link}>Gestionar →</Link>
                </div>

                <div style={styles.card}>
                    <span style={styles.icono}>🛒</span>
                    <h3 style={styles.cardTitulo}>Pedidos Totales</h3>
                    <p style={styles.cardNumero}>{totalPedidos}</p>
                    <Link to="/admin/pedidos" style={styles.link}>Ver todos →</Link>
                </div>

                <div style={{...styles.card, borderTop: '4px solid #e53e3e'}}>
                    <span style={styles.icono}>⏳</span>
                    <h3 style={styles.cardTitulo}>Pendientes</h3>
                    <p style={{...styles.cardNumero, color: '#e53e3e'}}>{pedidosPendientes}</p>
                    <Link to="/admin/pedidos" style={styles.link}>Procesar →</Link>
                </div>
            </div>

            {/* accesos rapidos */}
            <div style={styles.accesos}>
                <h2 style={styles.subtitulo}>Accesos Rápidos</h2>
                <div style={styles.botonesAcceso}>
                    <Link to="/admin/productos" style={styles.boton}>
                        ➕ Añadir Producto
                    </Link>
                    <Link to="/admin/pedidos" style={styles.boton}>
                        📋 Ver Pedidos
                    </Link>
                </div>
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
        marginBottom: '0.5rem'
    },
    bienvenida: {
        color: '#666',
        marginBottom: '2rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    card: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        borderTop: '4px solid #1a1a1a'
    },
    icono: {
        fontSize: '2rem'
    },
    cardTitulo: {
        color: '#666',
        margin: '0.5rem 0'
    },
    cardNumero: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: '0.5rem 0'
    },
    link: {
        color: '#1a1a1a',
        fontWeight: 'bold',
        textDecoration: 'none'
    },
    subtitulo: {
        color: '#1a1a1a',
        marginBottom: '1rem'
    },
    accesos: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    botonesAcceso: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    boton: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold'
    },
    centro: {
        textAlign: 'center',
        padding: '2rem'
    }
}

export default Dashboard