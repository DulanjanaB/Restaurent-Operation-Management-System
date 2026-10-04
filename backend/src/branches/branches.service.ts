import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Branch } from './branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchesRepository: Repository<Branch>,
  ) {}

  findAll(): Promise<Branch[]> {
    return this.branchesRepository.find({ order: { name: 'ASC' } });
  }

  findByIds(ids: string[]): Promise<Branch[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.branchesRepository.find({
      where: { id: In(ids) },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async create(dto: CreateBranchDto): Promise<Branch> {
    const existing = await this.branchesRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('Branch code already in use');
    }
    return this.branchesRepository.save(this.branchesRepository.create(dto));
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    this.branchesRepository.merge(branch, dto);
    return this.branchesRepository.save(branch);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchesRepository.remove(branch);
  }
}
