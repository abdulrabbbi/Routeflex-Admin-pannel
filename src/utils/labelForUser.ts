import { UserRef } from "../api/feedbackService";

export function labelForUser(u?: UserRef): string {
  if (!u) return "—";
  if (typeof u === "string") return u;
  const { name, firstName, lastName, email, _id } = u;
  const full = name || [firstName, lastName].filter(Boolean).join(" ").trim();
  return full || email || _id || "—";
}
