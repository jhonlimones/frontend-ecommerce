// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* AuthProvider envuelve toda la app para que el estado de auth este disponible en todos los componentes */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>
)