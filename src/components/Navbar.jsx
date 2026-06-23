// src/components/Navbar.jsx
// barra de navegacion principal — visible en todas las paginas
// muestra opciones distintas segun si el usuario es admin o usuario normal
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'

const Navbar = () => {
    const { usuario, logout, esAdmin } = useAuth()
    const { totalItems } = useCarrito()
    // useNavigate permite redirigir programaticamente despues del logout
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        // redirigimos al login despues de cerrar sesion
        navigate('/login')
    }

    return (
        <nav style={styles.nav}>
            {/* logo — siempre redirige a la tienda */}
            <Link to="/" style={styles.logo}>
                🛍️ E-Commerce
            </Link>

            <div style={styles.links}>
                {/* si no hay usuario mostramos login y registro */}
                {!usuario ? (
                    <>
                        <NavLink to="/login" style={styles.link}>Login</NavLink>
                        <NavLink to="/registro" style={styles.link}>Registro</NavLink>
                    </>
                ) : esAdmin ? (
                    // si es admin mostramos el menu de administracion
                    <>
                        <NavLink to="/admin" style={styles.link}>Dashboard</NavLink>
                        <NavLink to="/admin/productos" style={styles.link}>Productos</NavLink>
                        <NavLink to="/admin/pedidos" style={styles.link}>Pedidos</NavLink>
                        <span style={styles.usuario}>👤 {usuario.nombre}</span>
                        <button onClick={handleLogout} style={styles.boton}>Salir</button>
                    </>
                ) : (
                    // si es usuario normal mostramos tienda, carrito y pedidos
                    <>
                        <NavLink to="/" style={styles.link}>Tienda</NavLink>
                        {/* mostramos el numero de items en el carrito */}
                        <NavLink to="/carrito" style={styles.link}>
                            🛒 Carrito {totalItems > 0 && <span style={styles.badge}>{totalItems}</span>}
                        </NavLink>
                        <NavLink to="/pedidos" style={styles.link}>Mis Pedidos</NavLink>
                        <span style={styles.usuario}>👤 {usuario.nombre}</span>
                        <button onClick={handleLogout} style={styles.boton}>Salir</button>
                    </>
                )}
            </div>
        </nav>
    )
}

// estilos inline simples — los mejoraremos cuando añadamos CSS
const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#1a1a1a',
        color: 'white'
    },
    logo: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1.5rem',
        fontWeight: 'bold'
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
    },
    link: {
        color: 'white',
        textDecoration: 'none'
    },
    usuario: {
        color: '#aaa'
    },
    boton: {
        backgroundColor: '#e53e3e',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    badge: {
        backgroundColor: '#e53e3e',
        color: 'white',
        borderRadius: '50%',
        padding: '0.1rem 0.4rem',
        fontSize: '0.75rem',
        marginLeft: '4px'
    }
}

export default Navbar