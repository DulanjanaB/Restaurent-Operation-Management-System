import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStaffAssignment } from './event-staff-assignment.entity';
import { AssignStaffDto } from './dto/assign-staff.dto';

@Injectable()
export class EventStaffAssignmentsService {
  constructor(
    @InjectRepository(EventStaffAssignment)
    private readonly assignmentsRepository: Repository<EventStaffAssignment>,
  ) {}

  findAll(eventId: string): Promise<EventStaffAssignment[]> {
    return this.assignmentsRepository.find({
      where: { event_id: eventId },
      relations: { staff: true },
    });
  }

  assign(eventId: string, dto: AssignStaffDto): Promise<EventStaffAssignment> {
    return this.assignmentsRepository.save(
      this.assignmentsRepository.create({
        event_id: eventId,
        staff_id: dto.staff_id,
        role_in_event: dto.role_in_event,
      }),
    );
  }

  async remove(eventId: string, assignmentId: string): Promise<void> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id: assignmentId, event_id: eventId },
    });
    if (!assignment) {
      throw new NotFoundException('Staff assignment not found on this event');
    }
    await this.assignmentsRepository.remove(assignment);
  }
}
