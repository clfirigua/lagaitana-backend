import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export class OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  shippingCost: number;

  @Prop({ required: true })
  total: number;

  @Prop({
    default: 'pending',
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  status: string;

  @Prop({ type: Object, required: true })
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };

  @Prop({ type: Object })
  payment: {
    method: string;
    mercadopagoId?: string;
    mercadopagoStatus?: string;
    paidAt?: Date;
  };

  @Prop({ unique: true })
  orderNumber: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Helper para generar número de orden único
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LG-${timestamp}-${random}`;
}
