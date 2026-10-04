import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,
  ) {}

  findAll(branchId?: string): Promise<Package[]> {
    return this.packagesRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Package> {
    const pkg = await this.packagesRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    return pkg;
  }

  create(dto: CreatePackageDto): Promise<Package> {
    return this.packagesRepository.save(this.packagesRepository.create(dto));
  }

  async update(id: string, dto: UpdatePackageDto): Promise<Package> {
    const pkg = await this.findOne(id);
    this.packagesRepository.merge(pkg, dto);
    return this.packagesRepository.save(pkg);
  }

  async remove(id: string): Promise<void> {
    const pkg = await this.findOne(id);
    await this.packagesRepository.remove(pkg);
  }
}
