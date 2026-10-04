import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftTemplate } from './shift-template.entity';
import { CreateShiftTemplateDto } from './dto/create-shift-template.dto';
import { UpdateShiftTemplateDto } from './dto/update-shift-template.dto';

@Injectable()
export class ShiftTemplatesService {
  constructor(
    @InjectRepository(ShiftTemplate)
    private readonly shiftTemplatesRepository: Repository<ShiftTemplate>,
  ) {}

  findAll(branchId?: string): Promise<ShiftTemplate[]> {
    return this.shiftTemplatesRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ShiftTemplate> {
    const template = await this.shiftTemplatesRepository.findOne({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException('Shift template not found');
    }
    return template;
  }

  create(dto: CreateShiftTemplateDto): Promise<ShiftTemplate> {
    return this.shiftTemplatesRepository.save(
      this.shiftTemplatesRepository.create(dto),
    );
  }

  async update(
    id: string,
    dto: UpdateShiftTemplateDto,
  ): Promise<ShiftTemplate> {
    const template = await this.findOne(id);
    this.shiftTemplatesRepository.merge(template, dto);
    return this.shiftTemplatesRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.shiftTemplatesRepository.remove(template);
  }
}
