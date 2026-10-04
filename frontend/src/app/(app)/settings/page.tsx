import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMe } from '@/lib/auth/dal';
import { getSettingsByCategory } from '@/lib/server/settings/queries';
import { toSettingsMap } from '@/lib/server/settings/types';
import { hasPermission } from '@/lib/permissions';
import { BusinessProfileForm } from './business-profile-form';
import { AppearanceForm } from './appearance-form';
import { SystemForm } from './system-form';
import { SecurityForm } from './security-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function SettingsPage() {
  const [me, businessRows, appearanceRows, systemRows] = await Promise.all([
    getMe(),
    getSettingsByCategory('business_profile'),
    getSettingsByCategory('appearance'),
    getSettingsByCategory('system'),
  ]);

  const canUpdate = hasPermission(me, 'settings.update');
  const showSecurity = hasPermission(me, 'settings.manage_security');

  const business = toSettingsMap(businessRows);
  const appearance = toSettingsMap(appearanceRows);
  const system = toSettingsMap(systemRows);

  const securityRows = showSecurity
    ? await getSettingsByCategory('security')
    : [];
  const security = toSettingsMap(securityRows);

  return (
    <div className="space-y-6">
      <PageHeader
        tone="slate"
        title={<>Settings</>}
        description={<>Company-wide configuration — not scoped to a branch.</>}
      />

      <Tabs defaultValue="business_profile">
        <TabsList>
          <TabsTrigger value="business_profile">Business Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          {showSecurity && <TabsTrigger value="security">Security</TabsTrigger>}
        </TabsList>
        <TabsContent value="business_profile" className="pt-4">
          <BusinessProfileForm values={business} readOnly={!canUpdate} />
        </TabsContent>
        <TabsContent value="appearance" className="pt-4">
          <AppearanceForm
            values={appearance}
            logoUrl={business.logo_url as string | undefined}
            readOnly={!canUpdate}
          />
        </TabsContent>
        <TabsContent value="system" className="pt-4">
          <SystemForm values={system} readOnly={!canUpdate} />
        </TabsContent>
        {showSecurity && (
          <TabsContent value="security" className="pt-4">
            <SecurityForm
              passwordPolicy={
                (security.password_policy as Record<string, unknown>) ?? {}
              }
              sessionSettings={
                (security.session_settings as Record<string, unknown>) ?? {}
              }
              loginSettings={
                (security.login_settings as Record<string, unknown>) ?? {}
              }
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
