import { endOfDay } from "date-fns";
import { CountdownEntity } from "../entities";

/** Convert a <input type="date"> value to an end-of-day UTC Date. */
export const parseInputDate = (value: string): Date => {
  const inputtedDate = new Date(value);
  const utcDate = new Date(
    inputtedDate.toLocaleDateString("en-US", { timeZone: "utc" }),
  );
  return endOfDay(utcDate);
};

/** Format an ISO date string as the yyyy-MM-dd a <input type="date"> expects. */
export const toDateInputValue = (iso?: string): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  const month = d.toLocaleDateString(undefined, { month: "2-digit" });
  const day = d.toLocaleDateString(undefined, { day: "2-digit" });
  return `${d.getFullYear()}-${month}-${day}`;
};

export type CountdownDraft = {
  title?: string;
  date?: Date;
  hexColor?: string;
  emoji?: string;
};

/** Validate a draft and return the persistable entity, or an error message. */
export const buildCountdownPayload = (
  draft: CountdownDraft,
): { entity?: Omit<CountdownEntity, "id">; error?: string } => {
  const { title, date, hexColor, emoji } = draft;
  if (!title || !date || !hexColor || !emoji) {
    return { error: "Ensure all fields are set." };
  }
  return { entity: { title, date: date.toISOString(), hexColor, emoji } };
};
