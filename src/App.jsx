// src/App.jsx
// configuracion principal de rutas de la aplicacion
// React Router gestiona la navegacion sin recargar la pagina
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// paginas de usuario normal
import Login from './pages/Login'
import Registro from './pages/Registro'
import Tienda from './pages/Tienda'
import Carrito from './pages/Carrito'
import Pedidos from './pages/Pedidos'

// paginas de admin
import Dashboard from './pages/admin/Dashboard'
import GestionProductos from './pages/admin/GestionProductos'
import GestionPedidos from './pages/admin/GestionPedidos'

// componente de navegacion
import Navbar from './components/Navbar'

// componente que protege rutas privadas — redirige al login si no esta autenticado
const RutaPrivada = ({ children }) => {
    const { usuario } = useAuth()
    // si no hay usuario redirigimos al login
    return usuario ? children : <Navigate to="/login" />
}

// componente que protege rutas de admin — redirige a la tienda si no es admin
const RutaAdmin = ({ children }) => {
    const { usuario, esAdmin } = useAuth()
    if (!usuario) return <Navigate to="/login" />
    // si es usuario normal lo mandamos a la tienda
    return esAdmin ? children : <Navigate to="/" />
}

function App() {
    return (
        <>
            {/* navbar visible en todas las paginas */}
            <Navbar />
            <Routes>
                {/* rutas publicas — accesibles sin login */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                {/* rutas privadas — requieren autenticacion */}
                <Route path="/" element={
                    <RutaPrivada>
                        <Tienda />
                    </RutaPrivada>
                } />
                <Route path="/carrito" element={
                    <RutaPrivada>
                        <Carrito />
                    </RutaPrivada>
                } />
                <Route path="/pedidos" element={
                    <RutaPrivada>
                        <Pedidos />
                    </RutaPrivada>
                } />

                {/* rutas de admin — requieren rol admin */}
                <Route path="/admin" element={
                    <RutaAdmin>
                        <Dashboard />
                    </RutaAdmin>
                } />
                <Route path="/admin/productos" element={
                    <RutaAdmin>
                        <GestionProductos />
                    </RutaAdmin>
                } />
                <Route path="/admin/pedidos" element={
                    <RutaAdmin>
                        <GestionPedidos />
                    </RutaAdmin>
                } />

                {/* cualquier ruta desconocida redirige a la tienda */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    )
}

export default App