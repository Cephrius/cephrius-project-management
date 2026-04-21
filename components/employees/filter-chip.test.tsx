import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FilterChip } from "./filter-chip";

describe("FilterChip", () => {
  it("renders the count inside a centered badge so it stays aligned with the label", () => {
    const markup = renderToStaticMarkup(
      <FilterChip label="Active" count={12} active={false} onClick={vi.fn()} />,
    );

    expect(markup).toMatch(
      /<span class="[^"]*inline-flex[^"]*min-w-5[^"]*items-center[^"]*justify-center[^"]*leading-none[^"]*tabular-nums[^"]*">12<\/span>/,
    );
  });
});
