import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

const SEED_PRODUCTS = [
  { name: 'Agenda Faith Vibes', price: 24.99, category: 'Agendas', image: 'p-agenda-cute.jpg', verse: 'Filipenses 4:13', description: 'Agenda espiral con stickers de cruces y corazones. Diseño colorido para organizar tu semana con fe.', tags: ['nuevo', 'popular'], stock: 50 },
  { name: 'Diario de Oración Premium', price: 34.99, category: 'Agendas', image: 'product-agenda-2.jpg', verse: 'Salmo 119:105', description: 'Diario en cuero con cruz grabada. Perfecto para tus reflexiones y oraciones diarias.', tags: ['premium'], stock: 30 },
  { name: 'Planner Floral Fe', price: 29.99, category: 'Agendas', image: 'product-agenda-1.jpg', verse: 'Proverbios 3:5', description: 'Agenda con cubierta floral y detalles dorados. Planifica tu vida con propósito.', tags: ['popular'], stock: 40 },
  { name: 'Mug Cruz Lavanda', price: 16.99, category: 'Mugs', image: 'p-mug-lavender.jpg', verse: 'Juan 3:16', description: 'Taza de cerámica color lavanda con cruz minimalista. Tu compañera de café matutino.', tags: ['nuevo'], stock: 60 },
  { name: 'Mug God is Good', price: 18.99, category: 'Mugs', image: 'p-mug-pink.jpg', verse: 'Salmo 34:8', description: 'Taza rosa con caligrafía moderna. Empieza cada día recordando la bondad de Dios.', tags: ['popular', 'nuevo'], stock: 45 },
  { name: 'Mug Filipenses 4:13', price: 17.99, category: 'Mugs', image: 'product-mug-2.jpg', verse: 'Filipenses 4:13', description: 'Set de tazas con versículo inspirador. Ideal para compartir con amigos.', tags: [], stock: 35 },
  { name: 'Taza Cruz Artesanal', price: 19.99, category: 'Mugs', image: 'product-mug-1.jpg', verse: 'Romanos 8:28', description: 'Cerámica hecha a mano con cruz sutil. Cada pieza es única.', tags: ['artesanal'], stock: 20 },
  { name: 'Pulsera FAITH', price: 12.99, category: 'Accesorios', image: 'p-bracelet-faith.jpg', verse: 'Hebreos 11:1', description: 'Pulsera de cuentas coloridas con letras que deletrean FAITH. Trendy y con propósito.', tags: ['nuevo', 'popular'], stock: 80 },
  { name: 'Case Cruz Pastel', price: 22.99, category: 'Accesorios', image: 'p-phonecase.jpg', verse: 'Isaías 41:10', description: 'Funda para celular con patrón de cruces en rosa pastel. Protege tu phone con estilo.', tags: ['nuevo'], stock: 40 },
  { name: 'Tote Bag BLESSED', price: 19.99, category: 'Accesorios', image: 'p-tote.jpg', verse: 'Jeremías 17:7', description: 'Bolsa de tela con tipografía bold. Perfecta para la uni, la iglesia o el gym.', tags: ['popular'], stock: 35 },
  { name: 'Pack Stickers Cristianos', price: 8.99, category: 'Detalles', image: 'p-stickers.jpg', verse: 'Salmo 46:10', description: 'Set de stickers con cruces, corazones, palomas y versículos. Para tu agenda, laptop o botella.', tags: ['popular', 'nuevo'], stock: 100 },
  { name: 'Set Regalo Cruz Madera', price: 24.99, category: 'Detalles', image: 'product-detail-1.jpg', verse: 'Filipenses 4:7', description: 'Collar con cruz de madera en empaque artesanal con flores secas. Regalo perfecto.', tags: ['regalo'], stock: 25 },
  { name: 'Agenda Semanal Mint', price: 21.99, category: 'Agendas', image: 'p-agenda-cute.jpg', verse: 'Mateo 6:33', description: 'Agenda compacta en tonos mint. Ideal para llevar a todos lados.', tags: [], stock: 30 },
  { name: 'Mug Sunrise Worship', price: 15.99, category: 'Mugs', image: 'p-mug-pink.jpg', verse: 'Lamentaciones 3:23', description: 'Taza para tus devocionales matutinos. Diseño cálido y acogedor.', tags: [], stock: 40 },
  { name: 'Pulsera HOPE', price: 11.99, category: 'Accesorios', image: 'p-bracelet-faith.jpg', verse: 'Romanos 15:13', description: 'Pulsera trenzada con la palabra HOPE. Colores vibrantes para un look con mensaje.', tags: [], stock: 60 },
  { name: 'Case Gradient Faith', price: 23.99, category: 'Accesorios', image: 'p-phonecase.jpg', verse: 'Proverbios 31:25', description: 'Funda con gradiente pastel y cruz central. Compatible con iPhone y Samsung.', tags: ['nuevo'], stock: 30 },
  { name: 'Tote Bag Faith Over Fear', price: 21.99, category: 'Accesorios', image: 'p-tote.jpg', verse: '2 Timoteo 1:7', description: 'Bolsa de lona con mensaje de valentía. Ideal para el día a día.', tags: [], stock: 25 },
  { name: 'Stickers Versículos Vol.2', price: 9.99, category: 'Detalles', image: 'p-stickers.jpg', verse: 'Josué 1:9', description: 'Segunda edición de stickers con nuevos diseños y versículos.', tags: ['nuevo'], stock: 80 },
  { name: 'Diario Gratitud Pastel', price: 27.99, category: 'Agendas', image: 'product-agenda-1.jpg', verse: '1 Tesalonicenses 5:18', description: 'Diario diseñado para escribir 3 razones de gratitud cada día. Portada floral.', tags: ['popular'], stock: 35 },
  { name: 'Mug Be Still', price: 17.99, category: 'Mugs', image: 'p-mug-lavender.jpg', verse: 'Salmo 46:10', description: 'Taza lavanda con frase "Be Still and Know". Acabado mate elegante.', tags: [], stock: 40 },
  { name: 'Kit Devocional Completo', price: 49.99, category: 'Detalles', image: 'product-detail-1.jpg', verse: 'Salmo 1:2', description: 'Incluye diario, bolígrafo dorado, stickers y separadores. Todo para tu quiet time.', tags: ['premium', 'popular'], stock: 15 },
  { name: 'Pulsera Set x3 Colores', price: 19.99, category: 'Accesorios', image: 'p-bracelet-faith.jpg', verse: '1 Corintios 13:13', description: 'Set de 3 pulseras: Fe, Esperanza y Amor. Colores coordinados para mezclar.', tags: ['nuevo'], stock: 50 },
  { name: 'Agenda Yearly Planner', price: 32.99, category: 'Agendas', image: 'product-agenda-2.jpg', verse: 'Jeremías 29:11', description: 'Planner anual con secciones de metas, oraciones y reflexiones mensuales.', tags: ['premium'], stock: 20 },
  { name: 'Mug Salmo 23', price: 16.99, category: 'Mugs', image: 'product-mug-1.jpg', verse: 'Salmo 23:1', description: 'Taza artesanal con el Salmo 23 completo. Pieza de colección.', tags: ['artesanal'], stock: 18 },
  { name: 'Case Dove Peace', price: 21.99, category: 'Accesorios', image: 'p-phonecase.jpg', verse: 'Juan 14:27', description: 'Funda con diseño de paloma de la paz en tonos suaves. Protección y estilo.', tags: [], stock: 30 },
  { name: 'Gift Box Bautizo', price: 39.99, category: 'Detalles', image: 'product-detail-1.jpg', verse: 'Marcos 10:14', description: 'Caja de regalo especial para bautizos. Incluye cruz, tarjeta y dulces.', tags: ['regalo'], stock: 10 },
  { name: 'Stickers Bible Journaling', price: 12.99, category: 'Detalles', image: 'p-stickers.jpg', verse: 'Proverbios 4:23', description: 'Pack de stickers diseñados para tu Biblia. Pestañas, marcos y decoraciones.', tags: ['popular'], stock: 70 },
  { name: 'Mini Agenda de Bolsillo', price: 14.99, category: 'Agendas', image: 'p-agenda-cute.jpg', verse: 'Salmo 90:12', description: 'Agenda tamaño bolsillo perfecta para llevar en tu cartera. Diseño cute.', tags: [], stock: 45 },
  { name: 'Mug Set Amigos x2', price: 29.99, category: 'Mugs', image: 'p-mug-pink.jpg', verse: 'Proverbios 17:17', description: 'Set de 2 tazas para mejores amigos. Una dice "Pray" y la otra "Together".', tags: ['regalo'], stock: 20 },
  { name: 'Tote Bag Jesús es Rey', price: 18.99, category: 'Accesorios', image: 'p-tote.jpg', verse: 'Apocalipsis 19:16', description: 'Bolsa con diseño bold y moderno. Statement piece para tu outfit.', tags: [], stock: 30 },
  { name: 'Kit Regalo Confirmación', price: 44.99, category: 'Detalles', image: 'product-detail-1.jpg', verse: 'Hechos 1:8', description: 'Set especial para confirmaciones. Incluye diario, pulsera y tarjeta personalizada.', tags: ['regalo', 'premium'], stock: 8 },
  { name: 'Pulsera Cross Charm', price: 14.99, category: 'Accesorios', image: 'p-bracelet-faith.jpg', verse: 'Gálatas 2:20', description: 'Pulsera con dije de cruz en dorado. Elegante y significativa.', tags: [], stock: 55 },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private productsService: ProductsService) {}

  async onApplicationBootstrap() {
    await this.productsService.seedProducts(SEED_PRODUCTS as any);
  }
}
