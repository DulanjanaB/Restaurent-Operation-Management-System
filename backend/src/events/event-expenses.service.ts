import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventExpense } from './event-expense.entity';
import { CreateEventExpenseDto } from './dto/create-event-expense.dto';

@Injectable()
export class EventExpensesService {
  constructor(
    @InjectRepository(EventExpense)
    private readonly eventExpensesRepository: Repository<EventExpense>,
  ) {}

  findAll(eventId: string): Promise<EventExpense[]> {
    return this.eventExpensesRepository.find({
      where: { event_id: eventId },
      order: { incurred_at: 'DESC' },
    });
  }

  create(eventId: string, dto: CreateEventExpenseDto): Promise<EventExpense> {
    return this.eventExpensesRepository.save(
      this.eventExpensesRepository.create({ ...dto, event_id: eventId }),
    );
  }

  async remove(eventId: string, expenseId: string): Promise<void> {
    const expense = await this.eventExpensesRepository.findOne({
      where: { id: expenseId, event_id: eventId },
    });
    if (!expense) {
      throw new NotFoundException('Expense not found on this event');
    }
    await this.eventExpensesRepository.remove(expense);
  }
}
