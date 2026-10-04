'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { updateEvent } from '@/lib/server/events/actions';
import type { ActionResult } from '@/lib/validation';
import type {
  Customer,
  Event,
  EventPackage,
  EventType,
  Venue,
} from '@/lib/server/events/types';
import { useCloseDialogOnSuccess } from '@/lib/hooks/use-close-dialog-on-success';

const initialState: ActionResult = {};

export function EditEventDialog({
  event,
  eventTypes,
  customers,
  venues,
  packages,
}: {
  event: Event;
  eventTypes: EventType[];
  customers: Customer[];
  venues: Venue[];
  packages: EventPackage[];
}) {
  const [open, setOpen] = useState(false);
  const action = updateEvent.bind(null, event.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseDialogOnSuccess(pending, state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="event_type_id">Event type</FieldLabel>
              <Select
                name="event_type_id"
                defaultValue={event.event_type_id}
                required
              >
                <SelectTrigger id="event_type_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="customer_id">Customer</FieldLabel>
              <Select
                name="customer_id"
                defaultValue={event.customer_id}
                required
              >
                <SelectTrigger id="customer_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="venue_id">Venue</FieldLabel>
              <Select name="venue_id" defaultValue={event.venue_id} required>
                <SelectTrigger id="venue_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="package_id">Package</FieldLabel>
              <Select
                name="package_id"
                defaultValue={event.package_id ?? 'none'}
              >
                <SelectTrigger id="package_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No package</SelectItem>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="event_date">Event date</FieldLabel>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                defaultValue={event.event_date.slice(0, 10)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="guest_count">Guest count</FieldLabel>
              <Input
                id="guest_count"
                name="guest_count"
                type="number"
                min="1"
                step="1"
                defaultValue={event.guest_count}
                required
              />
            </Field>
            {state.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
