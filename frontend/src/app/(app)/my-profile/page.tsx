import { Building2, KeyRound, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyProfile } from '@/lib/server/profile/queries';
import { getBranches } from '@/lib/server/administration/queries';
import { ProfileForm } from './profile-form';
import { ChangePasswordForm } from './change-password-form';

const TAB_CLASS =
  'gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white data-[state=active]:shadow-md';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

// Self-service — every logged-in user can reach this (it's linked from
// the user menu, not the main sidebar, same as the nav design for
// zero-permission self-service pages elsewhere in the app).
export default async function MyProfilePage() {
  const [user, branches] = await Promise.all([
    getMyProfile(),
    getBranches().catch(() => []),
  ]);
  const primaryBranch =
    user.primary_branch?.name ??
    branches.find((branch) => branch.id === user.primary_branch_id)?.name ??
    'Not set';

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg">
        <div
          aria-hidden
          className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10"
        />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar className="size-20 ring-4 ring-white/30">
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
            <AvatarFallback className="bg-white/20 text-2xl font-semibold text-white">
              {initials(user.name) || <UserRound className="size-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.name}
            </h1>
            <p className="text-sm text-white/80">@{user.username}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <Building2 className="size-4" />
              Primary branch:{' '}
              <span className="font-medium text-white">{primaryBranch}</span>
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-card p-1.5 shadow-sm ring-1 ring-foreground/5">
          <TabsTrigger value="details" className={TAB_CLASS}>
            <UserRound className="size-4" />
            Profile details
          </TabsTrigger>
          <TabsTrigger value="password" className={TAB_CLASS}>
            <KeyRound className="size-4" />
            Change password
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="details"
          className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5"
        >
          <ProfileForm user={user} />
        </TabsContent>
        <TabsContent
          value="password"
          className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/5"
        >
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
