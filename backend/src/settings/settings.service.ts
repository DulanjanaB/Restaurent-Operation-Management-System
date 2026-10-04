import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';
import { PermissionsResolverService } from '../rbac/permissions-resolver.service';
import { resolveBranchId } from '../rbac/branch-context.util';
import { User } from '../users/user.entity';

const SECURITY_CATEGORY = 'security';

// Read-heavy by nature (business name/logo/theme load on every page) — the
// design doc calls for an in-memory cache invalidated on write. Not added
// here; direct reads are fine until this is a proven bottleneck, same
// "correct first" reasoning as the Inventory stock ledger.
@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
    private readonly permissionsResolver: PermissionsResolverService,
  ) {}

  findAll(category?: string): Promise<Setting[]> {
    return this.settingsRepository.find({
      where: category ? { category } : {},
      order: { category: 'ASC', key: 'ASC' },
    });
  }

  // Public, non-sensitive display values every signed-in user needs: the
  // business identity plus the currency and number/date formatting from
  // System settings, so amounts render the same for everyone.
  async getBrand(): Promise<{
    business_name: string | null;
    logo_url: string | null;
    currency: string | null;
    number_format: string | null;
    timezone: string | null;
  }> {
    const [profile, system] = await Promise.all([
      this.findAll('business_profile'),
      this.findAll('system'),
    ]);
    const valueOf = (rows: Setting[], key: string) => {
      const value = rows.find((row) => row.key === key)?.value;
      return typeof value === 'string' && value.length > 0 ? value : null;
    };
    return {
      business_name: valueOf(profile, 'business_name'),
      logo_url: valueOf(profile, 'logo_url'),
      currency: valueOf(system, 'currency'),
      number_format: valueOf(system, 'number_format'),
      timezone: valueOf(system, 'timezone'),
    };
  }

  findOne(category: string, key: string): Promise<Setting | null> {
    return this.settingsRepository.findOne({ where: { category, key } });
  }

  // The `security` category needs settings.manage_security rather than
  // the general settings.update — password policy, sessions, and login
  // lockout affect the whole system's security posture. See
  // docs/settings-design.md#permissions.
  async upsert(
    category: string,
    key: string,
    value: unknown,
    actor: User,
    request: any,
  ): Promise<Setting> {
    const requiredPermission =
      category === SECURITY_CATEGORY
        ? 'settings.manage_security'
        : 'settings.update';
    const branchId = resolveBranchId(request, actor);
    const allowed = await this.permissionsResolver.hasPermission(
      actor.id,
      branchId,
      requiredPermission,
    );
    if (!allowed) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermission}`,
      );
    }

    const existing = await this.findOne(category, key);
    if (existing) {
      existing.value = value;
      existing.updated_by = actor.id;
      existing.updated_at = new Date();
      return this.settingsRepository.save(existing);
    }

    return this.settingsRepository.save(
      this.settingsRepository.create({
        category,
        key,
        value,
        updated_by: actor.id,
      }),
    );
  }
}
