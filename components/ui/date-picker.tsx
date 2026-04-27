"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ISO_FORMAT = "yyyy-MM-dd";
const DISPLAY_FORMAT = "PPP";

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, ISO_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  clearable = true,
  id,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseIsoDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, DISPLAY_FORMAT) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              onChange("");
            } else {
              onChange(format(date, ISO_FORMAT));
            }
            setOpen(false);
          }}
          captionLayout="dropdown"
          autoFocus
        />
        {clearable && selected && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
