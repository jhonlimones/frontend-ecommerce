// src/pages/Pago.jsx
// pagina de pago con Stripe — procesa el pago del pedido
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { crearPago } from '../services/pagos.service'

// inicializamos Stripe con la clave publica — nunca usar la secreta aqui
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const Pago = () => {
    const [procesando, setProcesando] = useState(false)
    const [error, setError] = useState(null)
    const [pedido, setPedido] = useState(null)

    const navigate = useNavigate()
    // obtenemos el pedido_id y total que vienen desde el carrito
    const location = useLocation()

    useEffect(() => {
        // si no hay datos del pedido redirigimos al carrito
        if (!location.state?.pedido_id) {
            navigate('/carrito')
            return
        }
        setPedido(location.state)
    }, [])

    const handlePagar = async () => {
        setProcesando(true)
        setError(null)

        try {
            const stripe = await stripePromise

            // obtenemos el client_secret del backend
            const data = await crearPago(pedido.pedido_id)

            // redirigimos a Stripe para completar el pago
            const result = await stripe.redirectToCheckout({
                // usamos el PaymentIntent para el checkout
                sessionId: data.client_secret
            })

            if (result.error) {
                setError(result.error.message)
            }
        } catch (err) {
            setError('Error al procesar el pago')
        } finally {
            setProcesando(false)
        }
    }

    if (!pedido) return null

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.titulo}>Confirmar Pago</h2>

                <div style={styles.resumen}>
                    <p style={styles.label}>Pedido #{pedido.pedido_id}</p>
                    <p style={styles.total}>{pedido.total}€</p>
                </div>

                {error && <p style={styles.error}>{error}</p>}

                {/* tarjeta de prueba Stripe */}
                <div style={styles.info}>
                    <p style={styles.infoTexto}>💳 Tarjeta de prueba:</p>
                    <p style={styles.infoDetalle}>4242 4242 4242 4242</p>
                    <p style={styles.infoDetalle}>Cualquier fecha futura · CVC: cualquier 3 dígitos</p>
                </div>

                <button
                    onClick={handlePagar}
                    disabled={procesando}
                    style={styles.boton}
                >
                    {procesando ? 'Procesando...' : `Pagar ${pedido.total}€`}
                </button>
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
    resumen: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
    },
    label: {
        color: '#666',
        marginBottom: '0.5rem'
    },
    total: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    info: {
        backgroundColor: '#ebf8ff',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem'
    },
    infoTexto: {
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#2a4365'
    },
    infoDetalle: {
        color: '#2a4365',
        fontSize: '0.9rem'
    },
    boton: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '1rem',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer'
    },
    error: {
        color: '#e53e3e',
        textAlign: 'center',
        marginBottom: '1rem'
    }
}

export default Pago