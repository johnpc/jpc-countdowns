import { CountdownEntity, createCountdown } from "../entities";
import { getUpcomingHoliday, majorHolidaySpecs } from "./majorHolidays";
import { showToast } from "./toast";

const normalize = (title: string) => title.toLowerCase().trim();

/** Holiday countdowns not already present, resolved to their next occurrence. */
export const upcomingHolidayCountdowns = (
  existingCountdowns: CountdownEntity[],
): CountdownEntity[] => {
  const existingTitles = existingCountdowns.map((c) => normalize(c.title));
  return majorHolidaySpecs
    .filter((holiday) => !existingTitles.includes(normalize(holiday.title)))
    .map((h) => ({
      title: h.title,
      hexColor: h.hexColor,
      emoji: h.emoji,
      date: getUpcomingHoliday(h.fn).toISOString(),
    }));
};

export const createCountdownsForMajorHolidays = async (
  existingCountdowns: CountdownEntity[],
) => {
  const newCountdowns = upcomingHolidayCountdowns(existingCountdowns);
  if (!newCountdowns.length) {
    showToast("All major holidays are already in your list.");
    return;
  }
  const results = await Promise.allSettled(newCountdowns.map(createCountdown));
  const failed = results.filter((r) => r.status === "rejected").length;
  showToast(
    failed
      ? `Created ${newCountdowns.length - failed} countdowns (${failed} failed — try again).`
      : `Created ${newCountdowns.length} holiday countdowns.`,
    failed ? { variation: "error" } : undefined,
  );
};
