'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { deleteChecklistTemplate } from '@/lib/server/checklist/actions';

export function DeleteTemplateButton({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName: string;
}) {
  const router = useRouter();

  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" variant="outline">
          Delete template
        </Button>
      }
      title={`Permanently delete ${templateName}?`}
      description="This removes every historical record and response ever generated from it, not just the template — archiving it (the Active toggle below) is usually what you want instead."
      variant="destructive"
      confirmLabel="Delete"
      onConfirm={async () => {
        const result = await deleteChecklistTemplate(templateId);
        if (result.error) return result;
        toast.success('Template deleted.');
        router.push('/checklist/templates');
      }}
    />
  );
}
