import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  findAll(branchId?: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      relations: { position: true, department: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: { position: true, department: true },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  findByUserId(userId: string): Promise<Employee | null> {
    return this.employeesRepository.findOne({ where: { user_id: userId } });
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeesRepository.findOne({
      where: { employee_code: dto.employee_code },
    });
    if (existing) {
      throw new ConflictException('Employee code already in use');
    }
    const linked = await this.employeesRepository.findOne({
      where: { user_id: dto.user_id },
    });
    if (linked) {
      throw new ConflictException(
        'This login is already linked to an employee',
      );
    }
    return this.employeesRepository.save(this.employeesRepository.create(dto));
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    this.employeesRepository.merge(employee, dto);
    return this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeesRepository.remove(employee);
  }
}
