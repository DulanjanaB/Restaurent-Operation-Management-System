import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  findAll(
    employeeId?: string,
    date?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: {
        ...(employeeId ? { employee_id: employeeId } : {}),
        ...(date ? { date } : {}),
        ...(dateFrom && dateTo ? { date: Between(dateFrom, dateTo) } : {}),
      },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }

  mark(dto: CreateAttendanceDto): Promise<Attendance> {
    return this.attendanceRepository.save(
      this.attendanceRepository.create(dto),
    );
  }

  async update(id: string, dto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    this.attendanceRepository.merge(attendance, dto);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }
}
