import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLog } from './storage-log.entity';
import { StorageLocation } from './storage-location.entity';
import { LogStorageDto } from './dto/log-storage.dto';

@Injectable()
export class StorageLogsService {
  constructor(
    @InjectRepository(StorageLog)
    private readonly storageLogsRepository: Repository<StorageLog>,
    @InjectRepository(StorageLocation)
    private readonly storageLocationsRepository: Repository<StorageLocation>,
  ) {}

  findAll(storageLocationId: string): Promise<StorageLog[]> {
    return this.storageLogsRepository.find({
      where: { storage_location_id: storageLocationId },
      order: { recorded_at: 'DESC' },
    });
  }

  async log(
    storageLocationId: string,
    dto: LogStorageDto,
    recordedBy: string,
  ): Promise<StorageLog> {
    const location = await this.storageLocationsRepository.findOne({
      where: { id: storageLocationId },
    });
    if (!location) {
      throw new NotFoundException('Storage location not found');
    }

    const temperature = Number(dto.temperature);
    const inRange =
      (location.target_temp_min == null ||
        temperature >= Number(location.target_temp_min)) &&
      (location.target_temp_max == null ||
        temperature <= Number(location.target_temp_max));

    return this.storageLogsRepository.save(
      this.storageLogsRepository.create({
        storage_location_id: storageLocationId,
        temperature: dto.temperature,
        condition_notes: dto.condition_notes,
        recorded_by: recordedBy,
        in_range: inRange,
      }),
    );
  }
}
