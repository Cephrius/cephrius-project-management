"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

function getPrintDocumentTitle(documentTitle?: string) {
  const normalizedTitle = documentTitle?.trim();
  if (!normalizedTitle) {
    return "Invoice";
  }

  const safeTitle = normalizedTitle.replace(/[\\/:*?"<>|]+/g, "-").trim();
  return safeTitle || "Invoice";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function PrintButton({
  documentTitle,
}: {
  documentTitle?: string;
}) {
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  async function handlePrint() {
    const invoiceRoot = document.getElementById("invoice-print-root");
    const printDocumentTitle = getPrintDocumentTitle(documentTitle);
    const escapedPrintDocumentTitle = escapeHtml(printDocumentTitle);

    if (!invoiceRoot) {
      window.print();
      return;
    }

    setIsPreparingPrint(true);

    // Print from an isolated document so app-shell layout and global print rules
    // cannot hide the invoice content and produce a blank preview.
    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("aria-hidden", "true");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";

    // Reuse the current page styles so the cloned invoice keeps the same layout.
    const styles = Array.from(
      document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
        'link[rel="stylesheet"], style',
      ),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    const cleanup = () => {
      window.setTimeout(() => {
        printFrame.remove();
      }, 0);
    };

    try {
      document.body.appendChild(printFrame);

      const printDocument = printFrame.contentDocument;
      const printWindow = printFrame.contentWindow;

      if (!printDocument || !printWindow) {
        cleanup();
        window.print();
        return;
      }

      printDocument.open();
      printDocument.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapedPrintDocumentTitle}</title>
    ${styles}
    <style>
      @page {
        margin: 0.4in;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        color: #111827;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      #invoice-print-root {
        position: static !important;
        inset: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        font-size: 9px !important;
        line-height: 1.25 !important;
        color: #111827 !important;
        background: #ffffff !important;
      }

      #invoice-print-root .print\\:hidden {
        display: none !important;
      }

      #invoice-print-root .print\\:border-0 {
        border: 0 !important;
      }

      #invoice-print-root .print\\:p-0 {
        padding: 0 !important;
      }

      #invoice-print-root .print\\:shadow-none {
        box-shadow: none !important;
      }

      #invoice-print-root .print\\:min-w-0 {
        min-width: 0 !important;
      }
    </style>
  </head>
  <body>
    ${invoiceRoot.outerHTML}
  </body>
</html>`);
      printDocument.close();
  printDocument.title = printDocumentTitle;

      // Give copied styles and fonts a moment to resolve before opening print.
      await printDocument.fonts.ready.catch(() => undefined);
      await new Promise((resolve) => window.setTimeout(resolve, 150));

      printWindow.addEventListener(
        "afterprint",
        () => {
          cleanup();
        },
        { once: true },
      );

      printWindow.focus();
      printWindow.print();
      window.setTimeout(cleanup, 1000);
    } finally {
      setIsPreparingPrint(false);
    }
  }

  return (
    <Button
      className="rounded-md border px-3 py-2 text-sm hover:bg-primary/70 print:hidden cursor-pointer"
      disabled={isPreparingPrint}
      onClick={handlePrint}
      type="button"
    >
      <Printer className="h-4 w-4" />
      {isPreparingPrint ? "Preparing..." : "Print"}
    </Button>
  );
}
