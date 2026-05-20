/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Control } from 'react-hook-form';

export function DateAndTimePicker({
    control,
    name,
    label,
}: {
    control: any;
    name: string;
    label: string;
}) {
    const [open, setOpen] = React.useState(false);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{label}</FormLabel>
                    <div className="grid grid-cols-2 items-center gap-4">
                        {/* Date Picker */}
                        <div className="flex flex-col gap-2">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-between font-normal',
                                                !field.value &&
                                                    'text-muted-foreground'
                                            )}
                                        >
                                            {field.value
                                                ? format(
                                                      field.value,
                                                      'dd/MM/yyyy'
                                                  )
                                                : 'Select date'}
                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            if (date) {
                                                const current =
                                                    field.value || new Date();
                                                const newDate = new Date(date);
                                                newDate.setHours(
                                                    current.getHours()
                                                );
                                                newDate.setMinutes(
                                                    current.getMinutes()
                                                );
                                                newDate.setSeconds(
                                                    current.getSeconds()
                                                );
                                                field.onChange(newDate);
                                                setOpen(false);
                                            }
                                        }}
                                        disabled={(date) =>
                                            date <
                                            new Date(
                                                new Date().setHours(0, 0, 0, 0)
                                            )
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time Picker */}
                        <div className="flex flex-col gap-2">
                            <Input
                                type="time"
                                step="60"
                                value={
                                    field.value
                                        ? format(field.value, 'HH:mm')
                                        : format(new Date(), 'HH:mm')
                                }
                                onChange={(e) => {
                                    const [hours, minutes] =
                                        e.target.value.split(':');
                                    const updated = new Date(
                                        field.value || new Date()
                                    );
                                    updated.setHours(Number(hours));
                                    updated.setMinutes(Number(minutes));
                                    updated.setSeconds(0);
                                    field.onChange(updated);
                                }}
                                className="bg-background [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                        </div>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
