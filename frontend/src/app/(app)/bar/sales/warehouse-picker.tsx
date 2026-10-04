import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Warehouse } from '@/lib/server/inventory/types';

export function WarehousePicker({
  warehouses,
  currentId,
}: {
  warehouses: Warehouse[];
  currentId?: string;
}) {
  if (warehouses.length <= 1) return null;

  return (
    <form method="get" className="flex items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="warehouse_id">Warehouse</Label>
        <Select name="warehouse_id" defaultValue={currentId}>
          <SelectTrigger id="warehouse_id" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" variant="outline">
        Switch
      </Button>
    </form>
  );
}
