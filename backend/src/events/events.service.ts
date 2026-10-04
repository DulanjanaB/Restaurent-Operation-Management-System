import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { EventStatus } from './event-status.enum';
import { EventExpense } from './event-expense.entity';
import { Package } from './package.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventExpense)
    private readonly eventExpensesRepository: Repository<EventExpense>,
    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,
  ) {}

  findAll(branchId?: string): Promise<Event[]> {
    return this.eventsRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      relations: {
        event_type: true,
        customer: true,
        venue: true,
        package: true,
      },
      order: { event_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: {
        event_type: true,
        customer: true,
        venue: true,
        package: true,
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  create(dto: CreateEventDto, createdBy: string): Promise<Event> {
    return this.eventsRepository.save(
      this.eventsRepository.create({ ...dto, created_by: createdBy }),
    );
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.getEvent(id);
    // merge() (not Object.assign) — class-transformer's plainToInstance
    // gives every UpdateEventDto field an own `undefined` entry for
    // whichever ones this PATCH omitted (TS class-field semantics), and
    // Object.assign would copy those onto `event`, wiping already-correct
    // values to undefined/null on the object this method returns (the DB
    // itself stays correct since TypeORM skips genuinely-undefined columns
    // in the UPDATE — this was a response-only bug). merge() skips
    // undefined source properties by design.
    this.eventsRepository.merge(event, dto);
    return this.eventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.getEvent(id);
    await this.eventsRepository.remove(event);
  }

  // requested -> confirmed
  async approve(id: string): Promise<Event> {
    const event = await this.requireStatus(id, EventStatus.REQUESTED);
    event.status = EventStatus.CONFIRMED;
    return this.eventsRepository.save(event);
  }

  // confirmed -> completed
  async complete(id: string): Promise<Event> {
    const event = await this.requireStatus(id, EventStatus.CONFIRMED);
    event.status = EventStatus.COMPLETED;
    return this.eventsRepository.save(event);
  }

  // completed -> closed
  async close(id: string): Promise<Event> {
    const event = await this.requireStatus(id, EventStatus.COMPLETED);
    event.status = EventStatus.CLOSED;
    return this.eventsRepository.save(event);
  }

  // requested/confirmed/completed -> cancelled
  async cancel(id: string): Promise<Event> {
    const event = await this.getEvent(id);
    if (
      event.status === EventStatus.CLOSED ||
      event.status === EventStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot cancel an event that is already ${event.status}`,
      );
    }
    event.status = EventStatus.CANCELLED;
    return this.eventsRepository.save(event);
  }

  // Cost/Revenue/Profit are computed, not stored — see
  // docs/event-management-design.md#costrevenue.
  async getFinancials(
    id: string,
  ): Promise<{ cost: string; revenue: string; profit: string }> {
    const event = await this.getEvent(id);
    const expenses = await this.eventExpensesRepository.find({
      where: { event_id: id },
    });
    const cost = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    let revenue = 0;
    if (event.revenue_override != null) {
      revenue = Number(event.revenue_override);
    } else if (event.package_id) {
      const pkg = await this.packagesRepository.findOne({
        where: { id: event.package_id },
      });
      if (pkg?.price_per_guest != null) {
        revenue = Number(pkg.price_per_guest) * event.guest_count;
      } else if (pkg?.flat_price != null) {
        revenue = Number(pkg.flat_price);
      }
    }

    return {
      cost: cost.toFixed(2),
      revenue: revenue.toFixed(2),
      profit: (revenue - cost).toFixed(2),
    };
  }

  private async getEvent(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  private async requireStatus(id: string, status: EventStatus): Promise<Event> {
    const event = await this.getEvent(id);
    if (event.status !== status) {
      throw new BadRequestException(
        `Event must be ${status} for this action (currently ${event.status})`,
      );
    }
    return event;
  }
}
