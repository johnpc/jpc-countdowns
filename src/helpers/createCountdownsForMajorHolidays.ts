import {
  getChristmas,
  getEaster,
  getFathersDay,
  getHalloween,
  getIndependenceDay,
  getLaborDay,
  getMemorialDay,
  getMothersDay,
  getNewYearsDay,
  getThanksgiving,
  getValentinesDay,
} from "date-fns-holiday-us";
import { CountdownEntity, createCountdown } from "../entities";
const getUpcomingHoliday = (holidayFn: (year: number) => Date): Date => {
  const today = new Date();
  const holidayThisYear = holidayFn(today.getFullYear());
  const relevantYear =
    holidayThisYear < today
      ? holidayThisYear.getFullYear() + 1
      : holidayThisYear.getFullYear();
  return holidayFn(relevantYear);
};
const getCincoDeMayo = (year: number) => {
  return new Date(`${year}-05-05T00:00:00.000Z`);
};
const getStPatricksDay = (year: number) => {
  return new Date(`${year}-03-17T00:00:00.000Z`);
};
const majorHolidays = [
  {
    title: "New Year's Day",
    date: getUpcomingHoliday(getNewYearsDay),
    hexColor: "#FF0000",
    emoji: "🪩",
  },
  {
    title: "Valentine's Day",
    date: getUpcomingHoliday(getValentinesDay),
    hexColor: "#FF69B4",
    emoji: "❤️",
  },
  {
    title: "St. Patrick's Day",
    date: getUpcomingHoliday(getStPatricksDay),
    hexColor: "#008000",
    emoji: "🍻",
  },
  {
    title: "Easter",
    date: getUpcomingHoliday(getEaster),
    hexColor: "#FFD700",
    emoji: "🐰",
  },
  {
    title: "Cinco de Mayo",
    date: getUpcomingHoliday(getCincoDeMayo),
    hexColor: "#FFAB01",
    emoji: "🍾",
  },
  {
    title: "Mother's Day",
    date: getUpcomingHoliday(getMothersDay),
    hexColor: "#FF1493",
    emoji: "🌺",
  },
  {
    title: "Memorial Day",
    date: getUpcomingHoliday(getMemorialDay),
    hexColor: "#E22400",
    emoji: "🗽",
  },
  {
    title: "Father's Day",
    date: getUpcomingHoliday(getFathersDay),
    hexColor: "#00CED1",
    emoji: "👨",
  },
  {
    title: "Independence Day",
    date: getUpcomingHoliday(getIndependenceDay),
    hexColor: "#FF8C00",
    emoji: "🇺🇸",
  },
  {
    title: "Labor Day",
    date: getUpcomingHoliday(getLaborDay),
    hexColor: "#551029",
    emoji: "👷‍♂️",
  },
  {
    title: "Halloween",
    date: getUpcomingHoliday(getHalloween),
    hexColor: "#FF4500",
    emoji: "🎃",
  },
  {
    title: "Thanksgiving",
    date: getUpcomingHoliday(getThanksgiving),
    hexColor: "#982ABC",
    emoji: "🦃",
  },
  {
    title: "Christmas",
    date: getUpcomingHoliday(getChristmas),
    hexColor: "#FFFFFF",
    emoji: "🎄",
  },
];
export const createCountdownsForMajorHolidays = async (
  existingCountdowns: CountdownEntity[]
) => {
  const existingTitles = existingCountdowns.map((countdown) =>
    countdown.title.toLowerCase().trim()
  );
  const newCountdowns = majorHolidays
    .filter(
      (holiday) => !existingTitles.includes(holiday.title.toLowerCase().trim())
    )
    .map((d) => ({ ...d, date: d.date.toISOString() }));
  for (const holiday of newCountdowns) {
    await createCountdown(holiday);
  }
  alert(`Created ${newCountdowns.length} countdowns`);
};
