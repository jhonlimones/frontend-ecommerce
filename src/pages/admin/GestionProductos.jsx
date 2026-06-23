// src/pages/admin/GestionProductos.jsx
// pagina de gestion de productos para el admin
// permite crear, editar, eliminar y subir imagenes de productos
import { useState, useEffect } from 'react'
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../../services/productos.service'
import { obtenerCategorias, crearCategoria } from '../../services/categorias.service'
import api from '../../services/api'

// formulario vacio por defecto
const formularioVacio = {
    nombre: '',
    precio: '',
    en_stock: true,
    stock: '',
    categoria_id: '',
    imagen_url: null
}

const GestionProductos = () => {
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [formulario, setFormulario] = useState(formularioVacio)
    // null significa que estamos creando, un id significa que estamos editando
    const [editandoId, setEditandoId] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [mensaje, setMensaje] = useState(null)
    // archivo de imagen seleccionado para subir
    const [imagenFile, setImagenFile] = useState(null)
    const [nuevaCategoria, setNuevaCategoria] = useState('')

    const cargarProductos = async () => {
        try {
            const data = await obtenerProductos()
            setProductos(data)
        } catch {
            setError('Error al cargar productos')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        Promise.all([cargarProductos(), obtenerCategorias()])
            .then(([_, cats]) => setCategorias(cats))
    }, [])


    // actualiza el formulario cuando el usuario escribe
    const handleCambio = (e) => {
        const { name, value, type, checked } = e.target
        setFormulario(prev => ({
            ...prev,
            // los checkbox devuelven checked en vez de value
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    // prepara el formulario para editar un producto existente
    const handleEditar = (producto) => {
        setEditandoId(producto.id)
        setFormulario({
            nombre: producto.nombre,
            precio: producto.precio,
            en_stock: producto.en_stock,
            stock: producto.stock,
            categoria_id: producto.categoria_id,
            imagen_url: producto.imagen_url
        })
    }

    // resetea el formulario al estado inicial
    const handleCancelar = () => {
        setEditandoId(null)
        setFormulario(formularioVacio)
        setImagenFile(null)
        setError(null)
    }

    const handleSubmit = async () => {
        setError(null)
        try {
            const datos = {
                ...formulario,
                precio: parseFloat(formulario.precio),
                stock: parseInt(formulario.stock),
                categoria_id: parseInt(formulario.categoria_id)
            }

            if (editandoId) {
                // actualizamos el producto existente
                await actualizarProducto(editandoId, datos)
                setMensaje('Producto actualizado correctamente ✓')
            } else {
                // creamos un nuevo producto
                const nuevo = await crearProducto(datos)
                // si hay imagen la subimos inmediatamente despues de crear
                if (imagenFile) {
                    await subirImagen(nuevo.id, imagenFile)
                }
                setMensaje('Producto creado correctamente ✓')
            }

            handleCancelar()
            await cargarProductos()
            setTimeout(() => setMensaje(null), 3000)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al guardar el producto')
        }
    }

    // sube la imagen de un producto al backend
    const subirImagen = async (productoId, file) => {
        const formData = new FormData()
        formData.append('file', file)
        await api.post(`/producto/upload-imagen/${productoId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    const handleEliminar = async (productoId) => {
        // pedimos confirmacion antes de eliminar
        if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return
        try {
            await eliminarProducto(productoId)
            setMensaje('Producto eliminado ✓')
            await cargarProductos()
            setTimeout(() => setMensaje(null), 3000)
        } catch {
            setError('Error al eliminar el producto')
        }
    }

    const handleCrearCategoria = async () => {
        if (!nuevaCategoria.trim()) return
        try {
            await crearCategoria(nuevaCategoria)
            setNuevaCategoria('')
            // recargamos categorias
            const cats = await obtenerCategorias()
            setCategorias(cats)
            setMensaje('Categoría creada ✓')
            setTimeout(() => setMensaje(null), 3000)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al crear categoría')
        }
    }

    if (cargando) return <p style={styles.centro}>Cargando productos...</p>

    return (
        <div style={styles.container}>
            <h1 style={styles.titulo}>Gestión de Productos</h1>

            {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
            {error && <p style={styles.error}>{error}</p>}

            {/* formulario de crear/editar producto */}
            <div style={styles.formulario}>
                <h2 style={styles.subtitulo}>
                    {editandoId ? `Editando producto #${editandoId}` : 'Nuevo Producto'}
                </h2>

                <div style={styles.grid}>
                    <div style={styles.campo}>
                        <label style={styles.label}>Nombre</label>
                        <input
                            name="nombre"
                            value={formulario.nombre}
                            onChange={handleCambio}
                            style={styles.input}
                            placeholder="Nombre del producto"
                        />
                    </div>
                    <div style={styles.campo}>
                        <label style={styles.label}>Precio (€)</label>
                        <input
                            name="precio"
                            type="number"
                            value={formulario.precio}
                            onChange={handleCambio}
                            style={styles.input}
                            placeholder="0.00"
                        />
                    </div>
                    <div style={styles.campo}>
                        <label style={styles.label}>Stock</label>
                        <input
                            name="stock"
                            type="number"
                            value={formulario.stock}
                            onChange={handleCambio}
                            style={styles.input}
                            placeholder="0"
                        />
                    </div>
                    <div style={styles.campo}>
                        <label style={styles.label}>Categoría</label>
                        <select
                            name="categoria_id"
                            value={formulario.categoria_id}
                            onChange={handleCambio}
                            style={styles.input}
                        >
                            <option value="">Selecciona categoría</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* checkbox de en_stock */}
                <div style={styles.campoCheck}>
                    <input
                        name="en_stock"
                        type="checkbox"
                        checked={formulario.en_stock}
                        onChange={handleCambio}
                        id="en_stock"
                    />
                    <label htmlFor="en_stock" style={styles.label}>En stock</label>
                </div>

                {/* subida de imagen — solo al crear producto nuevo */}
                {!editandoId && (
                    <div style={styles.campo}>
                        <label style={styles.label}>Imagen (opcional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImagenFile(e.target.files[0])}
                            style={styles.input}
                        />
                    </div>
                )}

                <div style={styles.botonesForm}>
                    <button onClick={handleSubmit} style={styles.boton}>
                        {editandoId ? 'Actualizar' : 'Crear Producto'}
                    </button>
                    {editandoId && (
                        <button onClick={handleCancelar} style={styles.botonCancelar}>
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* tabla de productos existentes */}
            <div style={styles.tabla}>
                <h2 style={styles.subtitulo}>Productos ({productos.length})</h2>
                {productos.map(producto => (
                    <div key={producto.id} style={styles.fila}>
                        {/* miniatura de imagen o placeholder */}
                        {producto.imagen_url ? (
                            <img
                                src={`http://localhost:8800${producto.imagen_url}`}
                                alt={producto.nombre}
                                style={styles.miniatura}
                            />
                        ) : (
                            <div style={styles.miniaturaPlaceholder}>📦</div>
                        )}

                        <div style={styles.filaInfo}>
                            <strong>{producto.nombre}</strong>
                            <span style={styles.filaDetalle}>
                                {producto.precio}€ · Stock: {producto.stock} · {producto.en_stock ? '✅' : '❌'}
                            </span>
                        </div>

                        <div style={styles.filaAcciones}>
                            <button
                                onClick={() => handleEditar(producto)}
                                style={styles.botonEditar}
                            >Editar</button>
                            <button
                                onClick={() => handleEliminar(producto.id)}
                                style={styles.botonEliminar}
                            >Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            {/* seccion para crear nuevas categorias */}
            <div style={{...styles.formulario, marginTop: '2rem'}}>
                <h2 style={styles.subtitulo}>Gestión de Categorías</h2>
                <div style={styles.categoriaRow}>
                    <input
                        value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        style={{...styles.input, flex: 1}}
                        placeholder="Nueva categoría (ej: Zapatos)"
                    />
                    <button onClick={handleCrearCategoria} style={styles.boton}>
                        Crear Categoría
                    </button>
                </div>
                {/* lista de categorias existentes */}
                <div style={styles.categoriaLista}>
                    {categorias.map(cat => (
                        <span key={cat.id} style={styles.categoriaBadge}>
                            {cat.nombre}
                        </span>
                    ))}
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
        marginBottom: '2rem'
    },
    subtitulo: {
        color: '#1a1a1a',
        marginBottom: '1rem'
    },
    formulario: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
    },
    campo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    campoCheck: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
    },
    label: {
        fontWeight: 'bold',
        color: '#444',
        fontSize: '0.9rem'
    },
    input: {
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '1rem'
    },
    botonesForm: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem'
    },
    boton: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    botonCancelar: {
        backgroundColor: '#e2e8f0',
        color: '#1a1a1a',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    tabla: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    fila: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid #f0f0f0'
    },
    miniatura: {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '4px'
    },
    miniaturaPlaceholder: {
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '1.5rem'
    },
    filaInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    filaDetalle: {
        fontSize: '0.85rem',
        color: '#666'
    },
    filaAcciones: {
        display: 'flex',
        gap: '0.5rem'
    },
    botonEditar: {
        backgroundColor: '#2d6a4f',
        color: 'white',
        padding: '0.4rem 0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    botonEliminar: {
        backgroundColor: '#e53e3e',
        color: 'white',
        padding: '0.4rem 0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
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
    },
    categoriaRow: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem'
    },
    categoriaLista: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
    },
    categoriaBadge: {
        backgroundColor: '#f0f0f0',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        color: '#444'
    }
}

export default GestionProductos