"use client";

// Onboarding: shared assignee picker for jobs. Add/Edit Job dialogs pass
// employees grouped by company; payroll later reads the chosen
// `completed_by_type` and `completed_by_id` from the job row.
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type CompletedByOption = {
  id: string;
  name: string;
  companyId?: string | null;
  companyName?: string | null;
};

function optionValue(type: "employee" | "crew", id: string) {
  return `${type}:${id}`;
}

function companyHeading(companyName: string | null | undefined) {
  return companyName?.trim() || "Other company";
}

function optionLabel(option: CompletedByOption, typeLabel: string) {
  const company = option.companyName?.trim();
  return company
    ? `${option.name} (${company} ${typeLabel})`
    : `${option.name} (${typeLabel})`;
}

function groupByCompany(options: CompletedByOption[]) {
  const groups = new Map<
    string,
    { key: string; heading: string; options: CompletedByOption[] }
  >();

  for (const option of options) {
    const key = option.companyId ?? option.companyName ?? "__unknown__";
    const group = groups.get(key) ?? {
      key,
      heading: companyHeading(option.companyName),
      options: [],
    };
    group.options.push(option);
    groups.set(key, group);
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.heading.localeCompare(b.heading),
  );
}

export function CompletedByCombobox({
  value,
  onChange,
  employees,
  crews,
  label = "Completed By (Optional)",
  helperText,
}: {
  value: string;
  onChange: (value: string) => void;
  employees: CompletedByOption[];
  crews: CompletedByOption[];
  label?: string;
  helperText?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return "Unassigned";

    const employee = employees.find((item) => optionValue("employee", item.id) === value);
    if (employee) return optionLabel(employee, "Employee");

    const crew = crews.find((item) => optionValue("crew", item.id) === value);
    if (crew) return optionLabel(crew, "Crew");

    return "Unassigned";
  }, [crews, employees, value]);

  const employeeGroups = useMemo(() => groupByCompany(employees), [employees]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search employee or crew..." />
            <CommandEmpty>No assignee found.</CommandEmpty>
            <CommandGroup heading="Selection">
              <CommandItem
                value="unassigned"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 size-4", value === "" ? "opacity-100" : "opacity-0")} />
                Unassigned
              </CommandItem>
            </CommandGroup>
            {employeeGroups.map((group) => (
              <CommandGroup
                key={group.key}
                heading={`Employees - ${group.heading}`}
              >
                {group.options.map((employee) => {
                  const nextValue = optionValue("employee", employee.id);
                  return (
                    <CommandItem
                      key={employee.id}
                      value={`${employee.name} ${employee.companyName ?? ""} employee`}
                      onSelect={() => {
                        onChange(nextValue);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 size-4", value === nextValue ? "opacity-100" : "opacity-0")} />
                      {employee.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
            {crews.length > 0 && (
              <CommandGroup heading="Crews">
                {crews.map((crew) => {
                  const nextValue = optionValue("crew", crew.id);
                  return (
                    <CommandItem
                      key={crew.id}
                      value={`${crew.name} crew`}
                      onSelect={() => {
                        onChange(nextValue);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 size-4", value === nextValue ? "opacity-100" : "opacity-0")} />
                      {crew.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
