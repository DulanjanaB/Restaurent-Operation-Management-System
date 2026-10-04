import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './document-type.entity';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@Injectable()
export class DocumentTypesService {
  constructor(
    @InjectRepository(DocumentType)
    private readonly documentTypesRepository: Repository<DocumentType>,
  ) {}

  findAll(): Promise<DocumentType[]> {
    return this.documentTypesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<DocumentType> {
    const documentType = await this.documentTypesRepository.findOne({
      where: { id },
    });
    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }
    return documentType;
  }

  async create(dto: CreateDocumentTypeDto): Promise<DocumentType> {
    const existing = await this.documentTypesRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Document type name already in use');
    }
    return this.documentTypesRepository.save(
      this.documentTypesRepository.create(dto),
    );
  }

  async update(id: string, dto: UpdateDocumentTypeDto): Promise<DocumentType> {
    const documentType = await this.findOne(id);
    this.documentTypesRepository.merge(documentType, dto);
    return this.documentTypesRepository.save(documentType);
  }

  async remove(id: string): Promise<void> {
    const documentType = await this.findOne(id);
    await this.documentTypesRepository.remove(documentType);
  }
}
