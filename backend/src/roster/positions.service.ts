import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionsRepository: Repository<Position>,
  ) {}

  findAll(): Promise<Position[]> {
    return this.positionsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionsRepository.findOne({ where: { id } });
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    return position;
  }

  async create(dto: CreatePositionDto): Promise<Position> {
    const existing = await this.positionsRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Position name already in use');
    }
    return this.positionsRepository.save(this.positionsRepository.create(dto));
  }

  async update(id: string, dto: UpdatePositionDto): Promise<Position> {
    const position = await this.findOne(id);
    position.name = dto.name;
    return this.positionsRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);
    await this.positionsRepository.remove(position);
  }
}
