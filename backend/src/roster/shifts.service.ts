import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from './shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftsRepository: Repository<Shift>,
  ) {}

  findAll(rosterPeriodId?: string): Promise<Shift[]> {
    return this.shiftsRepository.find({
      where: rosterPeriodId ? { roster_period_id: rosterPeriodId } : {},
      relations: { department: true, shift_template: true },
      order: { date: 'ASC', start_time: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: { department: true, shift_template: true },
    });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    return shift;
  }

  create(dto: CreateShiftDto): Promise<Shift> {
    return this.shiftsRepository.save(this.shiftsRepository.create(dto));
  }

  async update(id: string, dto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findOne(id);
    this.shiftsRepository.merge(shift, dto);
    return this.shiftsRepository.save(shift);
  }

  async remove(id: string): Promise<void> {
    const shift = await this.findOne(id);
    await this.shiftsRepository.remove(shift);
  }
}
