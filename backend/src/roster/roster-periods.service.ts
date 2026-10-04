import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RosterPeriod } from './roster-period.entity';
import { RosterPeriodStatus } from './roster-period.enums';
import { CreateRosterPeriodDto } from './dto/create-roster-period.dto';
import { UpdateRosterPeriodDto } from './dto/update-roster-period.dto';

@Injectable()
export class RosterPeriodsService {
  constructor(
    @InjectRepository(RosterPeriod)
    private readonly rosterPeriodsRepository: Repository<RosterPeriod>,
  ) {}

  findAll(branchId?: string): Promise<RosterPeriod[]> {
    return this.rosterPeriodsRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      order: { start_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RosterPeriod> {
    const period = await this.rosterPeriodsRepository.findOne({
      where: { id },
    });
    if (!period) {
      throw new NotFoundException('Roster period not found');
    }
    return period;
  }

  create(dto: CreateRosterPeriodDto): Promise<RosterPeriod> {
    return this.rosterPeriodsRepository.save(
      this.rosterPeriodsRepository.create(dto),
    );
  }

  // Draft is freely editable; once published, dates are locked — see
  // docs/roster-management-design.md's RosterPeriod status note.
  async update(id: string, dto: UpdateRosterPeriodDto): Promise<RosterPeriod> {
    const period = await this.findOne(id);
    if (period.status !== RosterPeriodStatus.DRAFT) {
      throw new BadRequestException('Only a draft roster period can be edited');
    }
    this.rosterPeriodsRepository.merge(period, dto);
    return this.rosterPeriodsRepository.save(period);
  }

  async remove(id: string): Promise<void> {
    const period = await this.findOne(id);
    if (period.status !== RosterPeriodStatus.DRAFT) {
      throw new BadRequestException(
        'Only a draft roster period can be deleted',
      );
    }
    await this.rosterPeriodsRepository.remove(period);
  }

  async publish(id: string, publishedByUserId: string): Promise<RosterPeriod> {
    const period = await this.findOne(id);
    if (period.status === RosterPeriodStatus.PUBLISHED) {
      throw new BadRequestException('Roster period is already published');
    }
    period.status = RosterPeriodStatus.PUBLISHED;
    period.published_at = new Date();
    period.published_by = publishedByUserId;
    return this.rosterPeriodsRepository.save(period);
  }
}
