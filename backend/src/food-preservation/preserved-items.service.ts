import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreservedItem } from './preserved-item.entity';
import { CreatePreservedItemDto } from './dto/create-preserved-item.dto';
import { UpdatePreservedItemDto } from './dto/update-preserved-item.dto';

@Injectable()
export class PreservedItemsService {
  constructor(
    @InjectRepository(PreservedItem)
    private readonly preservedItemsRepository: Repository<PreservedItem>,
  ) {}

  findAll(): Promise<PreservedItem[]> {
    return this.preservedItemsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<PreservedItem> {
    const item = await this.preservedItemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Preserved item not found');
    }
    return item;
  }

  async create(dto: CreatePreservedItemDto): Promise<PreservedItem> {
    const existing = await this.preservedItemsRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('Code already in use');
    }
    return this.preservedItemsRepository.save(
      this.preservedItemsRepository.create(dto),
    );
  }

  async update(
    id: string,
    dto: UpdatePreservedItemDto,
  ): Promise<PreservedItem> {
    const item = await this.findOne(id);
    this.preservedItemsRepository.merge(item, dto);
    return this.preservedItemsRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.preservedItemsRepository.remove(item);
  }
}
