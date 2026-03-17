import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async findAll(query: {
    search?: string;
    category?: string;
    tag?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, category, tag, sort, page = 1, limit = 50 } = query;
    const filter: any = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { verse: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'Todos') {
      filter.category = category;
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { soldCount: -1 };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel.find(filter).sort(sortOption).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productModel.findByIdAndUpdate(id, { isActive: false }).exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
  }

  async seedProducts(products: CreateProductDto[]): Promise<void> {
    const count = await this.productModel.countDocuments();
    if (count === 0) {
      await this.productModel.insertMany(products);
      console.log(`✅ ${products.length} productos cargados en la base de datos`);
    }
  }
}
