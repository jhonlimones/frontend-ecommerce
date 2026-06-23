// src/services/pagos.service.js
// funciones para comunicarse con los endpoints de pagos
import api from './api'

// crear intencion de pago para un pedido
// devuelve el client_secret que necesita Stripe.js para procesar el pago
export const crearPago = async (pedidoId) => {
    const response = await api.post(`/pago/crear-pago/${pedidoId}`)
    return response.data
}