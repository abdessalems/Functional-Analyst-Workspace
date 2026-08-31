import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats an ISO date (yyyy-mm-dd) as `12 Mar 2025` without locale drift between server and client. */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${String(day).padStart(2, "0")} ${MONTHS[month - 1]} ${year}`;
}

export function formatDateTime(iso: string): string {
  const [datePart, timePart] = iso.split("T");
  if (!timePart) return formatDate(datePart);
  return `${formatDate(datePart)} · ${timePart.slice(0, 5)}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Case-insensitive "does any of these fields contain the query" helper used by list filters. */
export function matchesQuery(query: string, ...fields: (string | undefined | null)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => field?.toLowerCase().includes(q));
}

/**
 * The pathname as the navigation declares it, without the trailing slash.
 *
 * The site is exported with `trailingSlash: true`, so a page published at
 * `/requirements/` reports that path while every href in the menu is written
 * `/requirements`. Comparing the two directly meant nothing ever matched on the
 * live site: the sidebar highlighted no row, the breadcrumb named no section
 * and the previous/next step links disappeared — all of it working in
 * development, where the slash is not added, which is why it went unseen.
 */
export function normalisePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
