// src/pages/Registro.jsx
// pagina de registro de nuevo usuario
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registro } from '../services/auth.service'

const Registro = () => {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [cargando, setCargando] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setCargando(true)
        try {
            await registro(nombre, email, password)
            // redirigimos al login despues de registrarse
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al registrarse')
        } finally {
            setCargando(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.titulo}>Crear Cuenta</h2>

                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.form}>
                    <div style={styles.campo}>
                        <label style={styles.label}>Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            style={styles.input}
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div style={styles.campo}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div style={styles.campo}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={cargando}
                        style={styles.boton}
                    >
                        {cargando ? 'Registrando...' : 'Registrarse'}
                    </button>
                </div>

                {/* link al login sin recargar la pagina */}
                <p style={styles.login}>
                    ¿Ya tienes cuenta? <Link to="/login" style={styles.link}>Inicia sesión</Link>
                </p>
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
    },
    card: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    titulo: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        color: '#1a1a1a'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    campo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    label: {
        fontWeight: 'bold',
        color: '#444'
    },
    input: {
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '1rem'
    },
    boton: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '0.75rem',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '0.5rem'
    },
    error: {
        color: '#e53e3e',
        textAlign: 'center',
        marginBottom: '1rem'
    },
    login: {
        textAlign: 'center',
        marginTop: '1rem',
        color: '#666'
    },
    link: {
        color: '#1a1a1a',
        fontWeight: 'bold'
    }
}

export default Registro