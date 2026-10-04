import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftAssignment } from './shift-assignment.entity';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto';

@Injectable()
export class ShiftAssignmentsService {
  constructor(
    @InjectRepository(ShiftAssignment)
    private readonly shiftAssignmentsRepository: Repository<ShiftAssignment>,
  ) {}

  findAll(shiftId?: string): Promise<ShiftAssignment[]> {
    return this.shiftAssignmentsRepository.find({
      where: shiftId ? { shift_id: shiftId } : {},
      relations: { employee: true, position: true },
    });
  }

  async findOne(id: string): Promise<ShiftAssignment> {
    const assignment = await this.shiftAssignmentsRepository.findOne({
      where: { id },
      relations: { employee: true, position: true },
    });
    if (!assignment) {
      throw new NotFoundException('Shift assignment not found');
    }
    return assignment;
  }

  create(dto: CreateShiftAssignmentDto): Promise<ShiftAssignment> {
    return this.shiftAssignmentsRepository.save(
      this.shiftAssignmentsRepository.create(dto),
    );
  }

  async update(
    id: string,
    dto: UpdateShiftAssignmentDto,
  ): Promise<ShiftAssignment> {
    const assignment = await this.findOne(id);
    this.shiftAssignmentsRepository.merge(assignment, dto);
    return this.shiftAssignmentsRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.shiftAssignmentsRepository.remove(assignment);
  }
}
