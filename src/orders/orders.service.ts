import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, generateOrderNumber } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async create(createOrderDto: CreateOrderDto, userId?: string): Promise<OrderDocument> {
    const subtotal = Math.round(
      createOrderDto.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
    ) / 100;
    const shippingCost = subtotal >= 50 ? 0 : 5.99;
    const total = Math.round((subtotal + shippingCost) * 100) / 100;

    const order = new this.orderModel({
      userId: userId ? new Types.ObjectId(userId) : undefined,
      items: createOrderDto.items,
      subtotal,
      shippingCost,
      total,
      shippingAddress: createOrderDto.shippingAddress,
      status: 'pending',
      orderNumber: generateOrderNumber(),
    });

    return order.save();
  }

  async findByUser(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async findAll() {
    return this.orderModel.find().sort({ createdAt: -1 }).populate('userId', 'name email').exec();
  }

  async updateStatus(id: string, status: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async markAsPaid(
    orderId: string,
    paymentData: { mercadopagoId: string; mercadopagoStatus: string },
  ): Promise<OrderDocument> {
    const order = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          status: 'paid',
          payment: {
            method: 'mercadopago',
            mercadopagoId: paymentData.mercadopagoId,
            mercadopagoStatus: paymentData.mercadopagoStatus,
            paidAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }
}
