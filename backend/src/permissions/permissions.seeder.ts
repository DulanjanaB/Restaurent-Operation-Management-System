import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { PERMISSION_SEED } from './permission-seed.data';

export function buildPermissionKey(
  module: string,
  action: string,
  resource?: string,
): string {
  return resource ? `${module}.${resource}.${action}` : `${module}.${action}`;
}

// Upserts the permission catalog on boot so the seed list in
// permission-seed.data.ts is the single source of truth — adding a
// permission there is enough, no separate migration/script to run.
@Injectable()
export class PermissionsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionsSeeder.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async onApplicationBootstrap() {
    let created = 0;

    for (const seed of PERMISSION_SEED) {
      const key = buildPermissionKey(seed.module, seed.action, seed.resource);
      const existing = await this.permissionsRepository.findOne({
        where: { key },
      });

      if (existing) {
        continue;
      }

      await this.permissionsRepository.save(
        this.permissionsRepository.create({
          key,
          module: seed.module,
          resource: seed.resource,
          action: seed.action,
          description: seed.description,
        }),
      );
      created++;
    }

    if (created > 0) {
      this.logger.log(`Seeded ${created} new permission(s)`);
    }
  }
}
