import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

// The business name and logo are shown on the login screen too, before anyone
// has signed in, so this route is deliberately unguarded.
@Controller('branding')
export class BrandingController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  brand() {
    return this.settingsService.getBrand();
  }
}
