import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * On a narrow screen a wide table becomes a stack: each row is a card and each
 * cell is labelled with its column heading, taken from `data-label`. Reading a
 * six-column table by dragging it sideways on a phone is unusable, so below
 * `md` the table stops being a grid.
 */
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="app-scrollbar w-full md:overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom border-collapse text-sm",
          "max-md:block",
          "max-md:[&_thead]:hidden",
          "max-md:[&_tbody]:block",
          "max-md:[&_tr]:mb-3 max-md:[&_tr]:block max-md:[&_tr]:rounded-lg max-md:[&_tr]:border max-md:[&_tr]:border-border max-md:[&_tr]:p-3",
          "max-md:[&_td]:flex max-md:[&_td]:justify-between max-md:[&_td]:gap-4 max-md:[&_td]:px-0 max-md:[&_td]:py-1.5 max-md:[&_td]:text-left",
          "max-md:[&_td]:before:shrink-0 max-md:[&_td]:before:text-[11px] max-md:[&_td]:before:font-semibold max-md:[&_td]:before:uppercase max-md:[&_td]:before:tracking-wide max-md:[&_td]:before:text-muted-foreground max-md:[&_td]:before:content-[attr(data-label)]",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-surface-muted", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border transition-colors last:border-b-0 hover:bg-accent/40 data-[state=selected]:bg-accent",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 whitespace-nowrap border-b border-border px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-4 py-3 align-top text-sm", className)} {...props} />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-3 text-xs text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption };
