"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ComboboxItem = { id: string; name: string };

export function CreatableCombobox({
  label,
  placeholder = "Select...",
  items,
  value,
  onChange,
  onCreate,
}: {
  label: string;
  placeholder?: string;
  items: ComboboxItem[];
  value: ComboboxItem | null;
  onChange: (item: ComboboxItem | null) => void;
  onCreate: (name: string) => Promise<ComboboxItem>;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const normalizedQuery = query.trim().replace(/\s+/g, " ");
  const lowerQuery = normalizedQuery.toLowerCase();

  const filtered = React.useMemo(() => {
    if (!lowerQuery) return items;
    return items.filter((i) => i.name.toLowerCase().includes(lowerQuery));
  }, [items, lowerQuery]);

  const exactMatch = React.useMemo(() => {
    if (!lowerQuery) return false;
    return items.some((i) => i.name.toLowerCase() === lowerQuery);
  }, [items, lowerQuery]);

  async function handleCreate() {
    if (!normalizedQuery || creating) return;
    setCreating(true);
    setError(null);

    try {
      const created = await onCreate(normalizedQuery);
      onChange(created);
      setQuery("");
      setOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? value.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={query}
              onValueChange={setQuery}
            />

            <CommandEmpty>
              <div className="p-2 text-sm text-muted-foreground">
                No results.
              </div>

              {!exactMatch && normalizedQuery && (
                <div className="p-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    disabled={creating}
                    onClick={handleCreate}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {creating ? "Creating..." : `Create "${normalizedQuery}"`}
                  </Button>
                </div>
              )}
            </CommandEmpty>

            <CommandGroup>
              {filtered.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value?.id === item.id ? "opacity-100" : "opacity-0")} />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>

            {!exactMatch && normalizedQuery && filtered.length > 0 && (
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={creating}
                  onClick={handleCreate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {creating ? "Creating..." : `Create "${normalizedQuery}"`}
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
