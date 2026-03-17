import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Crear orden — con JWT opcional: si el usuario está logueado se vincula la orden
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.ordersService.create(createOrderDto, userId);
  }

  // Mis órdenes (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  myOrders(@Req() req: any) {
    return this.ordersService.findByUser(req.user.userId);
  }

  // Ver una orden específica
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }
}
