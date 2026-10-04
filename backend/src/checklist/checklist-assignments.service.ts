import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistAssignment } from './checklist-assignment.entity';
import { CreateChecklistAssignmentDto } from './dto/create-checklist-assignment.dto';

@Injectable()
export class ChecklistAssignmentsService {
  constructor(
    @InjectRepository(ChecklistAssignment)
    private readonly assignmentsRepository: Repository<ChecklistAssignment>,
  ) {}

  findAll(
    employeeId?: string,
    templateId?: string,
  ): Promise<ChecklistAssignment[]> {
    return this.assignmentsRepository.find({
      where: {
        ...(employeeId ? { employee_id: employeeId } : {}),
        ...(templateId ? { checklist_template_id: templateId } : {}),
      },
      relations: { employee: true, checklist_template: true },
    });
  }

  create(
    dto: CreateChecklistAssignmentDto,
    assignedBy: string,
  ): Promise<ChecklistAssignment> {
    return this.assignmentsRepository.save(
      this.assignmentsRepository.create({
        checklist_template_id: dto.checklist_template_id,
        employee_id: dto.employee_id,
        start_date: dto.start_date,
        end_date: dto.end_date ?? null,
        assigned_by: assignedBy,
      }),
    );
  }

  async deactivate(id: string): Promise<ChecklistAssignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
    });
    if (!assignment) {
      throw new NotFoundException('Checklist assignment not found');
    }
    assignment.active = false;
    return this.assignmentsRepository.save(assignment);
  }
}
