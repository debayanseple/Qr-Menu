import { z } from "zod";

/** Staff roles — mirrors PRD FR-26. */
export const StaffRoleSchema = z.enum(["ADMIN", "KITCHEN", "BAR", "FLOOR"]);
export type StaffRole = z.infer<typeof StaffRoleSchema>;

/** Station assigned to each menu item — PRD FR-13. */
export const StationSchema = z.enum(["KITCHEN", "BAR"]);
export type Station = z.infer<typeof StationSchema>;

/** Ticket lifecycle — PRD G5 / FR-18. */
export const TicketStatusSchema = z.enum(["NEW", "PREPARING", "READY", "SERVED", "CANCELLED"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

/** Consistent API error shape (quality bar: every endpoint). */
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** UI strings kept in one place so translation is easy later (prompt.md assumption). */
export const STRINGS = {
  appName: "QR Table Ordering",
  tableLabelPrefix: "Table",
  invalidTable: "This QR code is invalid or has been disabled. Please ask staff for help.",
  soldOut: "Sold out",
  currencySymbol: "₹",
} as const;

/** Aging thresholds in minutes (configurable in admin settings later). */
export const AGING_THRESHOLDS_MIN = {
  amber: 10,
  red: 20,
} as const;

/** Money helper: amounts are integer paise, never floats. */
export function formatPaise(paise: number): string {
  return `${STRINGS.currencySymbol}${(paise / 100).toFixed(2)}`;
}
