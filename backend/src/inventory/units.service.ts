import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  findAll(): Promise<Unit[]> {
    return this.unitsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  async create(dto: CreateUnitDto): Promise<Unit> {
    const existing = await this.unitsRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Unit name already in use');
    }
    return this.unitsRepository.save(this.unitsRepository.create(dto));
  }

  async update(id: string, dto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);
    this.unitsRepository.merge(unit, dto);
    return this.unitsRepository.save(unit);
  }

  async remove(id: string): Promise<void> {
    const unit = await this.findOne(id);
    await this.unitsRepository.remove(unit);
  }
}
