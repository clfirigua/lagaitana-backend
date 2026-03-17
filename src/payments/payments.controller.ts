import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Obtiene la public key de MercadoPago para el SDK del frontend
   */
  @Get('config')
  getConfig() {
    return this.paymentsService.getPublicKey();
  }

  /**
   * Crea preferencia de pago para una orden
   * POST /api/payments/create-preference
   * Body: { orderId: string }
   */
  @Post('create-preference')
  createPreference(@Body() body: { orderId: string }) {
    return this.paymentsService.createPreference(body.orderId);
  }

  /**
   * Webhook de MercadoPago - recibe notificaciones IPN
   * POST /api/payments/webhook
   */
  @Post('webhook')
  handleWebhook(@Query() query: any, @Body() body: any) {
    return this.paymentsService.handleWebhook(query, body);
  }

  /**
   * Confirma un pago manualmente (testing)
   * POST /api/payments/confirm/:orderId
   */
  @Post('confirm/:orderId')
  confirmPayment(
    @Param('orderId') orderId: string,
    @Body() body: { paymentId: string },
  ) {
    return this.paymentsService.confirmPayment(orderId, body.paymentId || 'manual');
  }
}
