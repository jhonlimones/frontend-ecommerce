// src/pages/Tienda.jsx
import { useState, useEffect } from 'react'
import { useCarrito } from '../context/CarritoContext'
import { obtenerProductos } from '../services/productos.service'
import { obtenerCategorias } from '../services/categorias.service'

const Tienda = () => {
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [mensaje, setMensaje] = useState(null)
    // null significa todas las categorias
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)

    const { agregar } = useCarrito()

    useEffect(() => {
        // cargamos productos y categorias en paralelo
        Promise.all([obtenerProductos(), obtenerCategorias()])
            .then(([prods, cats]) => {
                setProductos(prods)
                setCategorias(cats)
            })
            .catch(() => setError('Error al cargar los productos'))
            .finally(() => setCargando(false))
    }, [])

    const handleAgregar = async (productoId) => {
        try {
            await agregar(productoId, 1)
            setMensaje('Producto añadido al carrito ✓')
            setTimeout(() => setMensaje(null), 2000)
        } catch {
            setError('Error al añadir al carrito')
        }
    }

    // filtramos productos por categoria seleccionada
    const productosFiltrados = categoriaSeleccionada
        ? productos.filter(p => p.categoria_id === categoriaSeleccionada)
        : productos

    if (cargando) return <p style={styles.centro}>Cargando productos...</p>
    if (error) return <p style={styles.error}>{error}</p>

    return (
        <div style={styles.container}>
            <h1 style={styles.titulo}>Nuestra Tienda</h1>

            {mensaje && <p style={styles.mensaje}>{mensaje}</p>}

            {/* filtros por categoria */}
            <div style={styles.filtros}>
                <button
                    onClick={() => setCategoriaSeleccionada(null)}
                    style={categoriaSeleccionada === null ? styles.filtroActivo : styles.filtro}
                >
                    Todas
                </button>
                {categorias.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategoriaSeleccionada(cat.id)}
                        style={categoriaSeleccionada === cat.id ? styles.filtroActivo : styles.filtro}
                    >
                        {cat.nombre}
                    </button>
                ))}
            </div>

            {/* grid de productos filtrados */}
            <div style={styles.grid}>
                {productosFiltrados.map(producto => (
                    <div key={producto.id} style={styles.card}>
                        {producto.imagen_url ? (
                            <img
                                src={`http://localhost:8800${producto.imagen_url}`}
                                alt={producto.nombre}
                                style={styles.imagen}
                            />
                        ) : (
                            <div style={styles.imagenPlaceholder}>📦</div>
                        )}

                        <div style={styles.info}>
                            <h3 style={styles.nombre}>{producto.nombre}</h3>
                            <p style={styles.precio}>{producto.precio}€</p>
                            <p style={styles.stock}>
                                {producto.en_stock
                                    ? `Stock: ${producto.stock} unidades`
                                    : '❌ Sin stock'}
                            </p>
                            <button
                                onClick={() => handleAgregar(producto.id)}
                                disabled={!producto.en_stock}
                                style={producto.en_stock ? styles.boton : styles.botonDeshabilitado}
                            >
                                {producto.en_stock ? 'Añadir al carrito' : 'Sin stock'}
                            </button>
                        </div>
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
        textAlign: 'center',
        marginBottom: '1.5rem',
        color: '#1a1a1a'
    },
    filtros: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    filtro: {
        padding: '0.4rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '20px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        fontSize: '0.9rem'
    },
    filtroActivo: {
        padding: '0.4rem 1rem',
        border: '1px solid #1a1a1a',
        borderRadius: '20px',
        cursor: 'pointer',
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontSize: '0.9rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    imagen: {
        width: '100%',
        height: '200px',
        objectFit: 'cover'
    },
    imagenPlaceholder: {
        width: '100%',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontSize: '4rem'
    },
    info: {
        padding: '1rem'
    },
    nombre: {
        margin: '0 0 0.5rem',
        color: '#1a1a1a'
    },
    precio: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#2d6a4f',
        margin: '0 0 0.5rem'
    },
    stock: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '0 0 1rem'
    },
    boton: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    botonDeshabilitado: {
        width: '100%',
        backgroundColor: '#ccc',
        color: '#666',
        padding: '0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'not-allowed',
        fontSize: '0.9rem'
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
    mensaje: {
        backgroundColor: '#c6f6d5',
        color: '#2d6a4f',
        padding: '0.75rem',
        borderRadius: '4px',
        textAlign: 'center',
        marginBottom: '1rem'
    }
}

export default Tienda