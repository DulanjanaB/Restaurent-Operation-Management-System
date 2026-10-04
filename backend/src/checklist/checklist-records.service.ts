import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ChecklistRecord } from './checklist-record.entity';
import { ChecklistRecordStatus } from './checklist-record-status.enum';
import { ChecklistRecordResponse } from './checklist-record-response.entity';
import { ChecklistAssignment } from './checklist-assignment.entity';
import { ChecklistTemplate } from './checklist-template.entity';
import { ChecklistItem } from './checklist-item.entity';
import { AnswerChecklistItemDto } from './dto/answer-checklist-item.dto';
import { EmployeesService } from '../roster/employees.service';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';
import { resolveBranchId } from '../rbac/branch-context.util';
import { User } from '../users/user.entity';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class ChecklistRecordsService {
  constructor(
    @InjectRepository(ChecklistRecord)
    private readonly recordsRepository: Repository<ChecklistRecord>,
    @InjectRepository(ChecklistRecordResponse)
    private readonly responsesRepository: Repository<ChecklistRecordResponse>,
    @InjectRepository(ChecklistAssignment)
    private readonly assignmentsRepository: Repository<ChecklistAssignment>,
    @InjectRepository(ChecklistTemplate)
    private readonly templatesRepository: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistItem)
    private readonly itemsRepository: Repository<ChecklistItem>,
    private readonly employeesService: EmployeesService,
    private readonly permissionsResolver: PermissionsResolverService,
  ) {}

  // Lazily creates today's (and any other still-missing, still-`active`
  // assignment) records rather than relying on a scheduled job — same
  // pattern as Food Preservation's active -> expired sync. See
  // docs/checklist-design.md#checklistrecord-one-days-instance--the-sheet.
  private async ensureRecordsExist(date: string): Promise<void> {
    const activeAssignments = await this.assignmentsRepository.find({
      where: { active: true, start_date: LessThanOrEqual(date) },
    });

    for (const assignment of activeAssignments) {
      if (assignment.end_date && assignment.end_date < date) continue;

      const existing = await this.recordsRepository.findOne({
        where: { checklist_assignment_id: assignment.id, date },
      });
      if (existing) continue;

      const template = await this.templatesRepository.findOne({
        where: { id: assignment.checklist_template_id },
      });
      if (!template) continue;

      await this.recordsRepository.save(
        this.recordsRepository.create({
          checklist_assignment_id: assignment.id,
          checklist_template_id: assignment.checklist_template_id,
          employee_id: assignment.employee_id,
          branch_id: template.branch_id,
          date,
          status: ChecklistRecordStatus.PENDING,
        }),
      );
    }
  }

  // Listing "for employee X" is self-service if X is the caller's own
  // employee record; anything broader (all employees, or someone else's)
  // needs checklist.view.
  async assertCanList(
    employeeId: string | undefined,
    actor: User,
    request: any,
  ): Promise<void> {
    if (employeeId) {
      const ownEmployee = await this.employeesService.findByUserId(actor.id);
      if (ownEmployee && ownEmployee.id === employeeId) {
        return;
      }
    }
    const branchId = resolveBranchId(request, actor);
    const allowed = await this.permissionsResolver.hasPermission(
      actor.id,
      branchId,
      'checklist.view',
    );
    if (!allowed) {
      throw new ForbiddenException(
        'Missing required permission: checklist.view',
      );
    }
  }

  async findAll(filters: {
    employeeId?: string;
    status?: ChecklistRecordStatus;
    date?: string;
  }): Promise<ChecklistRecord[]> {
    await this.ensureRecordsExist(filters.date ?? today());
    return this.recordsRepository.find({
      where: {
        ...(filters.employeeId ? { employee_id: filters.employeeId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.date ? { date: filters.date } : {}),
      },
      relations: { checklist_template: true, employee: true },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<
    ChecklistRecord & {
      responses: ChecklistRecordResponse[];
      items: ChecklistItem[];
    }
  > {
    const record = await this.getRecord(id);
    const [responses, items] = await Promise.all([
      this.responsesRepository.find({
        where: { checklist_record_id: id },
        relations: { checklist_item: true },
      }),
      this.itemsRepository.find({
        where: { checklist_template_id: record.checklist_template_id },
        order: { sequence: 'ASC' },
      }),
    ]);
    return { ...record, responses, items };
  }

  async resolveOwnEmployeeId(actor: User): Promise<string> {
    const employee = await this.employeesService.findByUserId(actor.id);
    if (!employee) {
      throw new NotFoundException(
        'No employee record is linked to your account',
      );
    }
    return employee.id;
  }

  // Self-service exception — the assigned employee (via their linked
  // User) can always view/complete their own records, no permission
  // needed. Everyone else needs checklist.view / .complete. See
  // docs/checklist-design.md#permissions.
  async assertCanAccess(
    recordId: string,
    actor: User,
    request: any,
    permissionIfNotSelf: string,
  ): Promise<ChecklistRecord> {
    const record = await this.getRecord(recordId);
    const ownEmployee = await this.employeesService.findByUserId(actor.id);
    if (ownEmployee && ownEmployee.id === record.employee_id) {
      return record;
    }

    const branchId = resolveBranchId(request, actor);
    const allowed = await this.permissionsResolver.hasPermission(
      actor.id,
      branchId,
      permissionIfNotSelf,
    );
    if (!allowed) {
      throw new ForbiddenException(
        `Missing required permission: ${permissionIfNotSelf}`,
      );
    }
    return record;
  }

  async answerItem(
    recordId: string,
    itemId: string,
    dto: AnswerChecklistItemDto,
    actor: User,
  ): Promise<ChecklistRecordResponse> {
    const record = await this.getRecord(recordId);
    const item = await this.itemsRepository.findOne({
      where: {
        id: itemId,
        checklist_template_id: record.checklist_template_id,
      },
    });
    if (!item) {
      throw new NotFoundException(
        'Checklist item not found on this record’s template',
      );
    }

    if (!dto.answer && item.requires_reason_on_no && !dto.reason) {
      throw new BadRequestException(
        'A reason is required when the answer is No',
      );
    }

    const existing = await this.responsesRepository.findOne({
      where: { checklist_record_id: recordId, checklist_item_id: itemId },
    });

    const response = existing
      ? Object.assign(existing, {
          answer: dto.answer,
          reason: dto.reason ?? null,
          answered_by: actor.id,
          answered_at: new Date(),
        })
      : this.responsesRepository.create({
          checklist_record_id: recordId,
          checklist_item_id: itemId,
          answer: dto.answer,
          reason: dto.reason ?? null,
          answered_by: actor.id,
        });

    const saved = await this.responsesRepository.save(response);
    await this.maybeCompleteRecord(record, actor.id);
    return saved;
  }

  private async maybeCompleteRecord(
    record: ChecklistRecord,
    actorId: string,
  ): Promise<void> {
    const [items, responses] = await Promise.all([
      this.itemsRepository.find({
        where: { checklist_template_id: record.checklist_template_id },
      }),
      this.responsesRepository.find({
        where: { checklist_record_id: record.id },
      }),
    ]);

    if (items.length > 0 && responses.length >= items.length) {
      record.status = ChecklistRecordStatus.COMPLETED;
      record.completed_at = new Date();
      record.completed_by = actorId;
      await this.recordsRepository.save(record);
    }
  }

  private async getRecord(id: string): Promise<ChecklistRecord> {
    const record = await this.recordsRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('Checklist record not found');
    }
    return record;
  }
}
