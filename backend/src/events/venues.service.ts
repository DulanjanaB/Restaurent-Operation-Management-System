import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venuesRepository: Repository<Venue>,
  ) {}

  findAll(branchId?: string): Promise<Venue[]> {
    return this.venuesRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venuesRepository.findOne({ where: { id } });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  create(dto: CreateVenueDto): Promise<Venue> {
    return this.venuesRepository.save(this.venuesRepository.create(dto));
  }

  async update(id: string, dto: UpdateVenueDto): Promise<Venue> {
    const venue = await this.findOne(id);
    this.venuesRepository.merge(venue, dto);
    return this.venuesRepository.save(venue);
  }

  async remove(id: string): Promise<void> {
    const venue = await this.findOne(id);
    await this.venuesRepository.remove(venue);
  }
}
