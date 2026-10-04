import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './setting.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { BrandingController } from './branding.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [TypeOrmModule.forFeature([Setting]), RbacModule],
  controllers: [SettingsController, BrandingController],
  providers: [SettingsService],
  exports: [TypeOrmModule],
})
export class SettingsModule {}
