import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventType } from './event-type.entity';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectRepository(EventType)
    private readonly eventTypesRepository: Repository<EventType>,
  ) {}

  findAll(): Promise<EventType[]> {
    return this.eventTypesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<EventType> {
    const eventType = await this.eventTypesRepository.findOne({
      where: { id },
    });
    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }
    return eventType;
  }

  async create(dto: CreateEventTypeDto): Promise<EventType> {
    const existing = await this.eventTypesRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Event type name already in use');
    }
    return this.eventTypesRepository.save(
      this.eventTypesRepository.create(dto),
    );
  }

  async update(id: string, dto: UpdateEventTypeDto): Promise<EventType> {
    const eventType = await this.findOne(id);
    this.eventTypesRepository.merge(eventType, dto);
    return this.eventTypesRepository.save(eventType);
  }

  async remove(id: string): Promise<void> {
    const eventType = await this.findOne(id);
    await this.eventTypesRepository.remove(eventType);
  }
}
