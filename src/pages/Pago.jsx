// src/pages/Pago.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { crearPago } from '../services/pagos.service'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

// formulario de pago — usa los hooks de Stripe
const FormularioPago = ({ total, pedidoId }) => {
    const stripe = useStripe()
    const elements = useElements()
    const [procesando, setProcesando] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handlePagar = async (e) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setProcesando(true)
        setError(null)

        try {
            // confirmamos el pago con Stripe
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // url a la que redirige stripe despues del pago
                    return_url: `${window.location.origin}/pedidos`
                }
            })

            if (error) {
                setError(error.message)
            }
        } catch {
            setError('Error al procesar el pago')
        } finally {
            setProcesando(false)
        }
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.titulo}>Confirmar Pago</h2>

            <div style={styles.resumen}>
                <p style={styles.label}>Pedido #{pedidoId}</p>
                <p style={styles.totalTexto}>{total}€</p>
            </div>

            {/* formulario de pago de Stripe */}
            <PaymentElement style={styles.paymentElement} />

            {error && <p style={styles.error}>{error}</p>}

            {/* tarjeta de prueba */}
            <div style={styles.info}>
                <p style={styles.infoTexto}>💳 Tarjeta de prueba: 4242 4242 4242 4242</p>
                <p style={styles.infoDetalle}>Cualquier fecha futura · CVC: cualquier 3 dígitos</p>
            </div>

            <button
                onClick={handlePagar}
                disabled={procesando || !stripe}
                style={styles.boton}
            >
                {procesando ? 'Procesando...' : `Pagar ${total}€`}
            </button>
        </div>
    )
}

// pagina principal — carga el client_secret y envuelve el formulario con Elements
const Pago = () => {
    const [clientSecret, setClientSecret] = useState(null)
    const [pedido, setPedido] = useState(null)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!location.state?.pedido_id) {
            navigate('/carrito')
            return
        }
        setPedido(location.state)

        // obtenemos el client_secret del backend
        // solo llamamos una vez al montar el componente
        crearPago(location.state.pedido_id)
            .then(data => setClientSecret(data.client_secret))
            .catch(() => setError('Error al iniciar el pago'))
    }, []) // array vacio — solo se ejecuta una vez

    if (error) return <p style={styles.error}>{error}</p>
    if (!clientSecret) return <p style={styles.centro}>Cargando pago...</p>

    return (
        <div style={styles.container}>
            {/* Elements envuelve el formulario con el contexto de Stripe */}
            <Elements stripe={stripePromise} options={{ 
                clientSecret,
                // especificamos la version para compatibilidad
                appearance: { theme: 'stripe' } 
                }}>
                <FormularioPago total={pedido.total} pedidoId={pedido.pedido_id} />
            </Elements>
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
        maxWidth: '450px'
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
    totalTexto: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1a1a1a'
    },
    info: {
        backgroundColor: '#ebf8ff',
        padding: '1rem',
        borderRadius: '8px',
        margin: '1rem 0'
    },
    infoTexto: {
        fontWeight: 'bold',
        color: '#2a4365',
        marginBottom: '0.25rem'
    },
    infoDetalle: {
        color: '#2a4365',
        fontSize: '0.85rem'
    },
    boton: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '1rem',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '1rem'
    },
    error: {
        color: '#e53e3e',
        textAlign: 'center',
        margin: '1rem 0'
    },
    centro: {
        textAlign: 'center',
        padding: '2rem'
    }
}

export default Pago