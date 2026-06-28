import { CountdownEntity, createCountdown } from "../entities";
import { getUpcomingHoliday, majorHolidaySpecs } from "./majorHolidays";

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
  for (const holiday of newCountdowns) {
    await createCountdown(holiday);
  }
  alert(`Created ${newCountdowns.length} countdowns`);
};
