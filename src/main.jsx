// src/main.jsx
import { BrowserRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    // eliminamos StrictMode para evitar doble montaje en desarrollo
    // {/* BrowserRouter habilita la navegacion sin recarga de pagina */}
    <BrowserRouter>
        {/* AuthProvider debe ir primero porque CarritoProvider lo necesita */}
        <AuthProvider>
            {/* CarritoProvider envuelve la app para que el carrito este disponible en todos los componentes */}
            <CarritoProvider>
                <App />
            </CarritoProvider>
        </AuthProvider>
    </BrowserRouter>
)