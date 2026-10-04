import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find({
      relations: { category: true, unit: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: { category: true, unit: true },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async create(dto: CreateItemDto): Promise<Item> {
    const existing = await this.itemsRepository.findOne({
      where: { sku: dto.sku },
    });
    if (existing) {
      throw new ConflictException('SKU already in use');
    }
    return this.itemsRepository.save(this.itemsRepository.create(dto));
  }

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);
    this.itemsRepository.merge(item, dto);
    return this.itemsRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);
  }
}
