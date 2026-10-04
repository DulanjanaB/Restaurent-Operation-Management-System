import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave } from './leave.entity';
import { LeaveStatus } from './leave.enums';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
  ) {}

  findAll(employeeId?: string): Promise<Leave[]> {
    return this.leaveRepository.find({
      where: employeeId ? { employee_id: employeeId } : {},
      order: { start_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Leave> {
    const leave = await this.leaveRepository.findOne({ where: { id } });
    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }
    return leave;
  }

  create(dto: CreateLeaveDto): Promise<Leave> {
    return this.leaveRepository.save(this.leaveRepository.create(dto));
  }

  async remove(id: string): Promise<void> {
    const leave = await this.findOne(id);
    await this.leaveRepository.remove(leave);
  }

  async decide(
    id: string,
    approve: boolean,
    approverUserId: string,
  ): Promise<Leave> {
    const leave = await this.findOne(id);
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request has already been decided');
    }
    leave.status = approve ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    leave.approved_by = approverUserId;
    return this.leaveRepository.save(leave);
  }
}
