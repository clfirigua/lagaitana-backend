import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import MercadoPagoConfig, { Preference, Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private mercadopago: MercadoPagoConfig;

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN', '');
    if (accessToken && accessToken !== 'APP_USR-YOUR_ACCESS_TOKEN_HERE') {
      this.mercadopago = new MercadoPagoConfig({ accessToken });
    }
  }

  /**
   * Crea una preferencia de pago en MercadoPago y devuelve la URL de pago
   */
  async createPreference(orderId: string) {
    const order = await this.ordersService.findById(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada');

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN', '');

    // Si no hay token configurado, devolver mock para desarrollo
    if (!accessToken || accessToken === 'APP_USR-YOUR_ACCESS_TOKEN_HERE') {
      return {
        id: `mock_preference_${orderId}`,
        init_point: `${frontendUrl}/checkout/success?orderId=${orderId}&mock=true`,
        sandbox_init_point: `${frontendUrl}/checkout/success?orderId=${orderId}&mock=true`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        message: 'MercadoPago en modo demo - configure MERCADOPAGO_ACCESS_TOKEN para pagos reales',
      };
    }

    const preference = new Preference(this.mercadopago);

    const items = order.items.map((item) => ({
      id: item.productId,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'COP', // Pesos colombianos - cambia según tu país
    }));

    const isLocalhost = frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');

    const preferenceData = {
      items,
      payer: {
        email: order.shippingAddress.email,
        name: order.shippingAddress.fullName,
      },
      back_urls: {
        success: `${frontendUrl}/checkout/success?orderId=${orderId}`,
        failure: `${frontendUrl}/checkout/failure?orderId=${orderId}`,
        pending: `${frontendUrl}/checkout/pending?orderId=${orderId}`,
      },
      ...(isLocalhost ? {} : { auto_return: 'approved' as const }),
      external_reference: order._id?.toString(),
      notification_url: `${this.configService.get('BACKEND_URL', 'http://localhost:3000')}/api/payments/webhook`,
      shipments: {
        cost: order.shippingCost,
        mode: 'not_specified' as const,
      },
    };

    const response = await preference.create({ body: preferenceData });

    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
    };
  }

  /**
   * Webhook de MercadoPago - recibe notificaciones de pagos
   */
  async handleWebhook(query: any, body: any) {
    const type = query.type || body.type;
    const dataId = query['data.id'] || body.data?.id;

    if (type === 'payment' && dataId) {
      const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN', '');
      if (!accessToken || accessToken === 'APP_USR-YOUR_ACCESS_TOKEN_HERE') {
        return { received: true, message: 'Modo demo - sin procesamiento real' };
      }

      const payment = new Payment(this.mercadopago);
      const paymentData = await payment.get({ id: dataId });

      if (paymentData.status === 'approved') {
        const orderId = paymentData.external_reference;
        if (orderId) {
          await this.ordersService.markAsPaid(orderId, {
            mercadopagoId: dataId.toString(),
            mercadopagoStatus: paymentData.status,
          });
        }
      }
    }

    return { received: true };
  }

  /**
   * Confirma manualmente un pago (para testing o pago en efectivo)
   */
  async confirmPayment(orderId: string, paymentId: string) {
    return this.ordersService.markAsPaid(orderId, {
      mercadopagoId: paymentId,
      mercadopagoStatus: 'approved',
    });
  }

  /**
   * Devuelve la public key de MercadoPago para el frontend
   */
  getPublicKey() {
    const publicKey = this.configService.get<string>('MERCADOPAGO_PUBLIC_KEY', '');
    return {
      publicKey: publicKey === 'APP_USR-YOUR_PUBLIC_KEY_HERE' ? null : publicKey,
      isConfigured: publicKey !== '' && publicKey !== 'APP_USR-YOUR_PUBLIC_KEY_HERE',
    };
  }
}
