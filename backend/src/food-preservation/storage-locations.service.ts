import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocation } from './storage-location.entity';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from './dto/update-storage-location.dto';

@Injectable()
export class StorageLocationsService {
  constructor(
    @InjectRepository(StorageLocation)
    private readonly storageLocationsRepository: Repository<StorageLocation>,
  ) {}

  findAll(branchId?: string): Promise<StorageLocation[]> {
    return this.storageLocationsRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<StorageLocation> {
    const location = await this.storageLocationsRepository.findOne({
      where: { id },
    });
    if (!location) {
      throw new NotFoundException('Storage location not found');
    }
    return location;
  }

  create(dto: CreateStorageLocationDto): Promise<StorageLocation> {
    return this.storageLocationsRepository.save(
      this.storageLocationsRepository.create(dto),
    );
  }

  async update(
    id: string,
    dto: UpdateStorageLocationDto,
  ): Promise<StorageLocation> {
    const location = await this.findOne(id);
    this.storageLocationsRepository.merge(location, dto);
    return this.storageLocationsRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.storageLocationsRepository.remove(location);
  }
}
