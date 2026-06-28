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

export const getUpcomingHoliday = (holidayFn: (year: number) => Date): Date => {
  const today = new Date();
  const holidayThisYear = holidayFn(today.getFullYear());
  const relevantYear =
    holidayThisYear < today
      ? holidayThisYear.getFullYear() + 1
      : holidayThisYear.getFullYear();
  return holidayFn(relevantYear);
};

const getCincoDeMayo = (year: number) =>
  new Date(`${year}-05-05T00:00:00.000Z`);
const getStPatricksDay = (year: number) =>
  new Date(`${year}-03-17T00:00:00.000Z`);

type HolidaySpec = {
  title: string;
  fn: (year: number) => Date;
  hexColor: string;
  emoji: string;
};

export const majorHolidaySpecs: HolidaySpec[] = [
  {
    title: "New Year's Day",
    fn: getNewYearsDay,
    hexColor: "#FF0000",
    emoji: "🪩",
  },
  {
    title: "Valentine's Day",
    fn: getValentinesDay,
    hexColor: "#FF69B4",
    emoji: "❤️",
  },
  {
    title: "St. Patrick's Day",
    fn: getStPatricksDay,
    hexColor: "#008000",
    emoji: "🍻",
  },
  { title: "Easter", fn: getEaster, hexColor: "#FFD700", emoji: "🐰" },
  {
    title: "Cinco de Mayo",
    fn: getCincoDeMayo,
    hexColor: "#FFAB01",
    emoji: "🍾",
  },
  {
    title: "Mother's Day",
    fn: getMothersDay,
    hexColor: "#FF1493",
    emoji: "🌺",
  },
  {
    title: "Memorial Day",
    fn: getMemorialDay,
    hexColor: "#E22400",
    emoji: "🗽",
  },
  {
    title: "Father's Day",
    fn: getFathersDay,
    hexColor: "#00CED1",
    emoji: "👨",
  },
  {
    title: "Independence Day",
    fn: getIndependenceDay,
    hexColor: "#FF8C00",
    emoji: "🇺🇸",
  },
  { title: "Labor Day", fn: getLaborDay, hexColor: "#551029", emoji: "👷‍♂️" },
  { title: "Halloween", fn: getHalloween, hexColor: "#FF4500", emoji: "🎃" },
  {
    title: "Thanksgiving",
    fn: getThanksgiving,
    hexColor: "#982ABC",
    emoji: "🦃",
  },
  { title: "Christmas", fn: getChristmas, hexColor: "#FFFFFF", emoji: "🎄" },
];
