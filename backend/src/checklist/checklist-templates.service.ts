import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ChecklistTemplate } from './checklist-template.entity';
import { ChecklistItem } from './checklist-item.entity';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
import { AddChecklistItemDto } from './dto/add-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';

@Injectable()
export class ChecklistTemplatesService {
  constructor(
    @InjectRepository(ChecklistTemplate)
    private readonly templatesRepository: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistItem)
    private readonly itemsRepository: Repository<ChecklistItem>,
  ) {}

  findAll(branchId?: string): Promise<ChecklistTemplate[]> {
    return this.templatesRepository.find({
      where: branchId ? { branch_id: branchId } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(
    id: string,
  ): Promise<ChecklistTemplate & { items: ChecklistItem[] }> {
    const template = await this.getTemplate(id);
    const items = await this.itemsRepository.find({
      where: { checklist_template_id: id },
      order: { sequence: 'ASC' },
    });
    return { ...template, items };
  }

  async create(
    dto: CreateChecklistTemplateDto,
    createdBy: string,
  ): Promise<ChecklistTemplate> {
    const template = await this.templatesRepository.save(
      this.templatesRepository.create({
        branch_id: dto.branch_id,
        name: dto.name,
        area: dto.area,
        description: dto.description,
        created_by: createdBy,
      }),
    );

    await this.itemsRepository.save(
      dto.items.map((item) =>
        this.itemsRepository.create({
          checklist_template_id: template.id,
          sequence: item.sequence,
          label: item.label,
          requires_reason_on_no: item.requires_reason_on_no ?? true,
        }),
      ),
    );

    return template;
  }

  async update(
    id: string,
    dto: UpdateChecklistTemplateDto,
  ): Promise<ChecklistTemplate> {
    const template = await this.getTemplate(id);
    this.templatesRepository.merge(template, dto);
    return this.templatesRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.getTemplate(id);
    try {
      await this.templatesRepository.remove(template);
    } catch (error) {
      // Postgres 23503 = foreign_key_violation — ChecklistRecord.
      // checklist_template_id is a deliberate non-cascading snapshot FK
      // (see its entity comment), so any template that has ever generated
      // a daily record can't be hard-deleted. Archive (is_active=false)
      // is the intended path for those; this just turns the previously
      // unhandled 500 into a clear 409.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string } | undefined)?.code === '23503'
      ) {
        throw new ConflictException(
          'This template has recorded checklist history and cannot be deleted — archive it instead',
        );
      }
      throw error;
    }
  }

  async addItem(
    templateId: string,
    dto: AddChecklistItemDto,
  ): Promise<ChecklistItem> {
    await this.getTemplate(templateId);
    return this.itemsRepository.save(
      this.itemsRepository.create({
        checklist_template_id: templateId,
        sequence: dto.sequence,
        label: dto.label,
        requires_reason_on_no: dto.requires_reason_on_no ?? true,
      }),
    );
  }

  async updateItem(
    templateId: string,
    itemId: string,
    dto: UpdateChecklistItemDto,
  ): Promise<ChecklistItem> {
    const item = await this.itemsRepository.findOne({
      where: { id: itemId, checklist_template_id: templateId },
    });
    if (!item) {
      throw new NotFoundException('Checklist item not found on this template');
    }
    this.itemsRepository.merge(item, dto);
    return this.itemsRepository.save(item);
  }

  async removeItem(templateId: string, itemId: string): Promise<void> {
    const item = await this.itemsRepository.findOne({
      where: { id: itemId, checklist_template_id: templateId },
    });
    if (!item) {
      throw new NotFoundException('Checklist item not found on this template');
    }
    await this.itemsRepository.remove(item);
  }

  private async getTemplate(id: string): Promise<ChecklistTemplate> {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Checklist template not found');
    }
    return template;
  }
}
