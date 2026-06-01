"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronDown,
  List,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FilterDialog,
  FilterDialogSection,
} from "@/components/ui/filter-dialog";
import { cn } from "@/lib/utils";

type InvoiceStatus = "issued" | "due" | "overdue" | "paid";
type StatusFilter = "all" | InvoiceStatus;
type ViewMode = "list" | "grouped";

const INVOICES_VIEW_STORAGE_KEY = "invoices:view";
const INVOICES_EXPANDED_RECIPIENTS_STORAGE_KEY =
  "invoices:expanded-recipients";
const UNASSIGNED_RECIPIENT_LABEL = "Unassigned";

export type InvoiceListItem = {
  id: string;
  invoice_number: string;
  invoice_date: string | null;
  due_date: string | null;
  subtotal_cents: number | null;
  bill_to_name: string | null;
  contractor_name: string | null;
  created_at: string | null;
  is_paid: boolean | null;
};

type RecipientInvoiceGroup = {
  key: string;
  label: string;
  invoices: InvoiceListItem[];
  invoiceCount: number;
  totalCents: number;
  paidCount: number;
  overdueCount: number;
};

function money(cents: number | null) {
  const value = cents ?? 0;
  return (value / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(value: string | null): string {
  if (!value) return "N/A";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInvoiceStatus(
  dueDate: string | null,
  isPaid: boolean | null,
): InvoiceStatus {
  if (isPaid) return "paid";
  if (!dueDate) return "issued";

  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return "issued";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return due < today ? "overdue" : "due";
}

function statusLabel(status: InvoiceStatus): string {
  if (status === "overdue") return "Overdue";
  if (status === "due") return "Due";
  if (status === "paid") return "Paid";
  return "Issued";
}

function statusClasses(status: InvoiceStatus): string {
  if (status === "overdue") {
    return "border-red-300 bg-red-100 text-red-800";
  }
  if (status === "due") {
    return "border-amber-300 bg-amber-100 text-amber-800";
  }
  if (status === "paid") {
    return "border-green-300 bg-green-100 text-green-800";
  }
  return "border-blue-300 bg-blue-100 text-blue-800";
}

function parseStoredKeys(raw: string | null): string[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return null;
  }
}

function getRecipientLabel(invoice: InvoiceListItem): string {
  return invoice.bill_to_name?.trim() || UNASSIGNED_RECIPIENT_LABEL;
}

export function InvoicesPageClient({
  invoices,
}: {
  invoices: InvoiceListItem[];
}) {
  const [query, setQuery] = useState("");
  const [billToFilter, setBillToFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    const savedView = window.localStorage.getItem(INVOICES_VIEW_STORAGE_KEY);
    return savedView === "grouped" ? "grouped" : "list";
  });
  const [expandedRecipients, setExpandedRecipients] = useState<string[] | null>(
    () => {
      if (typeof window === "undefined") return null;
      return parseStoredKeys(
        window.localStorage.getItem(INVOICES_EXPANDED_RECIPIENTS_STORAGE_KEY),
      );
    },
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    invoices[0]?.id ?? null,
  );
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    window.localStorage.setItem(INVOICES_VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    if (expandedRecipients === null) {
      window.localStorage.removeItem(INVOICES_EXPANDED_RECIPIENTS_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      INVOICES_EXPANDED_RECIPIENTS_STORAGE_KEY,
      JSON.stringify(expandedRecipients),
    );
  }, [expandedRecipients]);

  const billToOptions = useMemo(() => {
    const set = new Set<string>();
    for (const invoice of invoices) {
      const billTo = (invoice.bill_to_name ?? "").trim();
      if (billTo) set.add(billTo);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();

    return invoices
      .filter((invoice) => {
        const status = getInvoiceStatus(invoice.due_date, invoice.is_paid);
        const matchesBillTo =
          billToFilter === "all" || getRecipientLabel(invoice) === billToFilter;
        const matchesStatus = statusFilter === "all" || statusFilter === status;
        const matchesQuery =
          q.length === 0 ||
          (invoice.invoice_number ?? "").toLowerCase().includes(q) ||
          (invoice.bill_to_name ?? "").toLowerCase().includes(q) ||
          (invoice.contractor_name ?? "").toLowerCase().includes(q);

        return matchesBillTo && matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        const aCreated = a.created_at ?? "";
        const bCreated = b.created_at ?? "";
        return bCreated.localeCompare(aCreated);
      });
  }, [invoices, query, billToFilter, statusFilter]);

  const groupedInvoices = useMemo<RecipientInvoiceGroup[]>(() => {
    const recipientMap = new Map<string, InvoiceListItem[]>();

    // Build the grouped invoice view from the already-filtered list so search,
    // recipient, and status filters apply identically in both views.
    for (const invoice of filteredInvoices) {
      const label = getRecipientLabel(invoice);
      const key = label.toLowerCase();
      const recipientInvoices = recipientMap.get(key) ?? [];
      recipientInvoices.push(invoice);
      recipientMap.set(key, recipientInvoices);
    }

    return Array.from(recipientMap.entries())
      .map(([key, recipientInvoices]) => {
        const sortedInvoices = [...recipientInvoices].sort((a, b) => {
          const aCreated = a.created_at ?? "";
          const bCreated = b.created_at ?? "";
          return bCreated.localeCompare(aCreated);
        });

        return {
          key,
          label: sortedInvoices[0]
            ? getRecipientLabel(sortedInvoices[0])
            : UNASSIGNED_RECIPIENT_LABEL,
          invoices: sortedInvoices,
          invoiceCount: sortedInvoices.length,
          totalCents: sortedInvoices.reduce(
            (sum, invoice) => sum + (invoice.subtotal_cents ?? 0),
            0,
          ),
          paidCount: sortedInvoices.filter((invoice) =>
            getInvoiceStatus(invoice.due_date, invoice.is_paid) === "paid",
          ).length,
          overdueCount: sortedInvoices.filter((invoice) =>
            getInvoiceStatus(invoice.due_date, invoice.is_paid) === "overdue",
          ).length,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredInvoices]);

  const effectiveExpandedRecipients = useMemo(() => {
    const recipientKeys = new Set(groupedInvoices.map((group) => group.key));
    const defaultExpanded = groupedInvoices[0] ? [groupedInvoices[0].key] : [];
    const currentExpanded = expandedRecipients ?? defaultExpanded;

    return currentExpanded.filter((key) => recipientKeys.has(key));
  }, [expandedRecipients, groupedInvoices]);

  const effectiveSelectedInvoiceId = useMemo(() => {
    if (filteredInvoices.length === 0) return null;
    if (!selectedInvoiceId) return filteredInvoices[0].id;
    const exists = filteredInvoices.some(
      (invoice) => invoice.id === selectedInvoiceId,
    );
    return exists ? selectedInvoiceId : filteredInvoices[0].id;
  }, [filteredInvoices, selectedInvoiceId]);

  const selectedInvoice = useMemo(() => {
    if (!effectiveSelectedInvoiceId) return null;
    return (
      filteredInvoices.find(
        (invoice) => invoice.id === effectiveSelectedInvoiceId,
      ) ?? null
    );
  }, [filteredInvoices, effectiveSelectedInvoiceId]);

  const activeFilterCount =
    Number(query.trim().length > 0) +
    Number(billToFilter !== "all") +
    Number(statusFilter !== "all");

  function resetFilters() {
    setQuery("");
    setBillToFilter("all");
    setStatusFilter("all");
  }

  function toggleRecipient(recipientKey: string) {
    setExpandedRecipients((prev) => {
      const defaultExpanded = groupedInvoices[0] ? [groupedInvoices[0].key] : [];
      const currentExpanded = prev ?? defaultExpanded;

      if (currentExpanded.includes(recipientKey)) {
        return currentExpanded.filter((key) => key !== recipientKey);
      }

      return [...currentExpanded, recipientKey];
    });
  }

  if (invoices.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-primary">Invoices</h1>
          <Link href="/invoices/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Create Invoice</Button>
          </Link>
        </div>
        <Card className="p-8">
          <div className="flex justify-center">
            <Image
              src="/empty_project.png"
              alt="Invoice"
              width={192}
              height={192}
            />
          </div>
          <div className="text-lg text-muted-foreground text-center">You currently don&apos;t have any invoices.</div>
          <div className="text-md text-center"> Want to create an invoice? <br/> Create one here.</div>
        <div className="flex justify-center">
          <Link href="/invoices/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Create Invoice</Button>
          </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              {filteredInvoices.length} Invoice
              {filteredInvoices.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
              <FilterDialog
                title="Invoice Filters"
                description="Search and narrow invoices from a single modal."
                activeCount={activeFilterCount}
                onClear={resetFilters}
              >
                <FilterDialogSection title="Search">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search invoices..."
                  />
                </FilterDialogSection>

                <FilterDialogSection title="Bill To">
                  <Select value={billToFilter} onValueChange={setBillToFilter}>
                    <SelectTrigger className="w-full justify-between">
                      <SelectValue placeholder="All Builders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Builders</SelectItem>
                      {billToOptions.map((builderName) => (
                        <SelectItem key={builderName} value={builderName}>
                          {builderName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterDialogSection>

                <FilterDialogSection title="Status">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                  >
                    <SelectTrigger className="w-full justify-between">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="due">Due</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterDialogSection>
              </FilterDialog>
              <div className="ml-auto inline-flex overflow-hidden rounded-md border bg-background sm:ml-0">
                <Button
                  type="button"
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none border-0 cursor-pointer"
                  onClick={() => setView("list")}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={view === "grouped" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none border-0 cursor-pointer"
                  onClick={() => setView("grouped")}
                  aria-label="Grouped view"
                >
                  <Building2 className="size-4" />
                </Button>
              </div>
            </div>

            <Link href="/invoices/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create Invoice</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <Card className="p-8">
              <div className="text-sm text-muted-foreground">
                No invoices match the current filters.
              </div>
            </Card>
          ) : view === "grouped" ? (
            <div className="space-y-3">
              {groupedInvoices.map((recipientGroup) => {
                const isRecipientExpanded =
                  effectiveExpandedRecipients.includes(recipientGroup.key);

                return (
                  <Card
                    key={recipientGroup.key}
                    className="overflow-hidden border-primary/20"
                  >
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        className="flex flex-1 flex-col items-start gap-2 text-left transition-colors hover:text-primary cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                        onClick={() => toggleRecipient(recipientGroup.key)}
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={cn(
                              "size-4 shrink-0 transition-transform cursor-pointer",
                              isRecipientExpanded && "rotate-180",
                            )}
                          />
                          <div className="text-base font-semibold">
                            {recipientGroup.label}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground sm:text-right">
                          {recipientGroup.invoiceCount}{" "}
                          {recipientGroup.invoiceCount === 1
                            ? "invoice"
                            : "invoices"}{" "}
                          • {money(recipientGroup.totalCents)} total •{" "}
                          {recipientGroup.paidCount} paid
                          {recipientGroup.overdueCount > 0
                            ? ` • ${recipientGroup.overdueCount} overdue`
                            : ""}
                        </div>
                      </button>
                    </div>

                    {isRecipientExpanded && (
                      <div className="space-y-2 border-t p-3 sm:p-4">
                        {recipientGroup.invoices.map((invoice) => {
                          const status = getInvoiceStatus(
                            invoice.due_date,
                            invoice.is_paid,
                          );
                          const isSelected =
                            effectiveSelectedInvoiceId === invoice.id;

                          return (
                            <Card
                              key={invoice.id}
                              className={cn(
                                "border-primary/10 p-3 transition-colors cursor-pointer",
                                isSelected
                                  ? "bg-primary/[0.03] ring-2 ring-primary/20"
                                  : "hover:bg-primary/5",
                              )}
                              onClick={() => {
                                setSelectedInvoiceId(invoice.id);
                                if (isMobile) {
                                  router.push(`/invoices/${invoice.id}`);
                                }
                              }}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="break-words font-medium">
                                      {invoice.invoice_number}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={statusClasses(status)}
                                    >
                                      {statusLabel(status)}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {money(invoice.subtotal_cents)} • Invoice{" "}
                                    {formatDate(invoice.invoice_date)} • Due{" "}
                                    {formatDate(invoice.due_date)}
                                  </div>
                                </div>

                                <div
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Button asChild variant="outline" size="sm">
                                    <Link
                                      href={`/invoices/${invoice.id}`}
                                      onClick={() => setSelectedInvoiceId(invoice.id)}
                                    >
                                      View Invoice
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const status = getInvoiceStatus(invoice.due_date, invoice.is_paid);
              const isSelected = effectiveSelectedInvoiceId === invoice.id;

              return (
                <Card
                  key={invoice.id}
                  className={cn(
                    "border-primary/10 p-3 transition-colors sm:p-5 cursor-pointer",
                    isSelected
                      ? "bg-primary/[0.03] ring-2 ring-primary/20"
                      : "hover:bg-primary/5",
                  )}
                  onClick={() => {
                    setSelectedInvoiceId(invoice.id);
                    if (isMobile) {
                      router.push(`/invoices/${invoice.id}`);
                    }
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                          {money(invoice.subtotal_cents)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-xl font-semibold leading-tight">
                              {invoice.invoice_number}
                            </div>
                            <Badge
                              variant="outline"
                              className={statusClasses(status)}
                            >
                              {statusLabel(status)}
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <UserRound className="size-4" />
                              Bill To: {invoice.bill_to_name ?? "Unassigned"}
                            </div>
                            <div className="flex items-center gap-2">
                              <ReceiptText className="size-4" />
                              From: {invoice.contractor_name ?? "Unknown"}
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="size-4" />
                              Invoice Date: {formatDate(invoice.invoice_date)}
                            </div>
                            <div>Due Date: {formatDate(invoice.due_date)}</div>
                          </div>
                        </div>
                      </div>

                      <div onClick={(event) => event.stopPropagation()}>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                          >
                            View Invoice
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="inline-flex items-center gap-1 text-lg font-medium text-primary dark:text-white dark:hover:text-muted-foreground/90 transition delay-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedInvoiceId(invoice.id);
                        }}
                      >
                        Open Invoice
                        <ArrowRight className="size-5" />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Card className="hidden h-fit border-primary/20 p-5 xl:block xl:sticky xl:top-4">
          {selectedInvoice ? (
            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium text-primary/80">
                  Selected Invoice
                </div>
                <div className="mt-2 text-3xl font-semibold leading-tight">
                  {selectedInvoice.invoice_number}
                </div>
              </div>

              <div className="rounded-md border border-primary/20 bg-primary/[0.03] p-4">
                <div className="space-y-2">
                  <div className="text-sm text-primary/80">Total</div>
                  <div className="text-4xl font-semibold leading-none">
                    {money(selectedInvoice.subtotal_cents)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UserRound className="size-4" />
                  Bill To: {selectedInvoice.bill_to_name ?? "Unassigned"}
                </div>
                <div className="flex items-center gap-2">
                  <ReceiptText className="size-4" />
                  From: {selectedInvoice.contractor_name ?? "Unknown"}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  Invoice Date: {formatDate(selectedInvoice.invoice_date)}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  Due Date: {formatDate(selectedInvoice.due_date)}
                </div>
              </div>

              <div className="border-t pt-4">
                <Link
                  href={`/invoices/${selectedInvoice.id}`}
                  className="inline-flex items-center gap-1 text-lg font-medium text-muted-foreground hover:text-primary dark:text-white dark:hover:text-muted-foreground/90 transition delay-100"
                >
                  View Invoice
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Select an invoice to view details.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
