/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface MultiSelectOption {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    className?: string;
    placeholder?: string;
    maxDisplayed?: number;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    className,
    placeholder = 'Select options...',
    maxDisplayed = 3,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const handleRemove = (value: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(selected.filter((item) => item !== value));
    };

    const handleDone = () => {
        setOpen(false);
    };

    const displayedItems = selected.slice(0, maxDisplayed);
    const remainingCount = selected.length - maxDisplayed;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'w-full justify-between min-h-[40px] h-auto px-3 py-2',
                        className
                    )}
                >
                    <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
                        {selected.length > 0 ? (
                            <>
                                {displayedItems.map((value) => {
                                    const option = options.find(
                                        (option) => option.value === value
                                    );
                                    return (
                                        <Badge
                                            key={value}
                                            variant="secondary"
                                            className="flex items-center gap-1 pl-2 pr-1 py-1"
                                        >
                                            <span className="text-xs">
                                                {option?.label}
                                            </span>
                                            <button
                                                type="button"
                                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleRemove(
                                                            value,
                                                            e as any
                                                        );
                                                    }
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) =>
                                                    handleRemove(value, e)
                                                }
                                            >
                                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                                {remainingCount > 0 && (
                                    <Badge
                                        variant="outline"
                                        className="px-2 py-1"
                                    >
                                        <span className="text-xs">
                                            +{remainingCount} more
                                        </span>
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground text-sm">
                                {placeholder}
                            </span>
                        )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
            >
                <Command>
                    <CommandInput
                        placeholder="Search options..."
                        className="h-9"
                    />
                    <CommandEmpty>No options found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto p-1">
                        {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={() => handleSelect(option.value)}
                                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                            >
                                <div className="flex h-4 w-4 items-center justify-center">
                                    <Check
                                        className={cn(
                                            'h-4 w-4',
                                            selected.includes(option.value)
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                </div>
                                <span className="flex-1 text-sm">
                                    {option.label}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    {selected.length > 0 && (
                        <div className="border-t p-2">
                            <Button
                                onClick={handleDone}
                                size="sm"
                                className="w-full h-8 text-xs"
                            >
                                Done ({selected.length} selected)
                            </Button>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
