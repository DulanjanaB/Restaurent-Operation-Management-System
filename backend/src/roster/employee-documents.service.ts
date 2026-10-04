import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeDocument } from './employee-document.entity';
import { Employee } from './employee.entity';
import { CreateEmployeeDocumentDto } from './dto/create-employee-document.dto';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';
import { resolveBranchId } from '../rbac/branch-context.util';
import { User } from '../users/user.entity';

// Self-service exception: an employee can always see/manage their own
// documents, no permission needed — same pattern as Tip Sharing balances.
// Everyone else needs roster.view_documents / roster.manage_documents. This
// can't be expressed with a static @RequirePermissions() decorator (the
// requirement depends on whose data it is), so the check happens here.
@Injectable()
export class EmployeeDocumentsService {
  constructor(
    @InjectRepository(EmployeeDocument)
    private readonly employeeDocumentsRepository: Repository<EmployeeDocument>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    private readonly permissionsResolver: PermissionsResolverService,
  ) {}

  async findAllForEmployee(
    employeeId: string,
    actor: User,
    request: any,
  ): Promise<EmployeeDocument[]> {
    await this.assertCanAccess(
      employeeId,
      actor,
      request,
      'roster.view_documents',
    );
    return this.employeeDocumentsRepository.find({
      where: { employee_id: employeeId },
      relations: { document_type: true },
      order: { uploaded_at: 'DESC' },
    });
  }

  async create(
    dto: CreateEmployeeDocumentDto,
    actor: User,
    request: any,
  ): Promise<EmployeeDocument> {
    await this.assertCanAccess(
      dto.employee_id,
      actor,
      request,
      'roster.manage_documents',
    );
    return this.employeeDocumentsRepository.save(
      this.employeeDocumentsRepository.create({
        ...dto,
        uploaded_by: actor.id,
      }),
    );
  }

  async remove(id: string, actor: User, request: any): Promise<void> {
    const document = await this.employeeDocumentsRepository.findOne({
      where: { id },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    await this.assertCanAccess(
      document.employee_id,
      actor,
      request,
      'roster.manage_documents',
    );
    await this.employeeDocumentsRepository.remove(document);
  }

  private async assertCanAccess(
    employeeId: string,
    actor: User,
    request: any,
    permissionIfNotSelf: string,
  ): Promise<void> {
    const ownEmployee = await this.employeesRepository.findOne({
      where: { user_id: actor.id },
    });
    if (ownEmployee && ownEmployee.id === employeeId) {
      return;
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
  }
}
