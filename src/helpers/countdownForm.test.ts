import { describe, it, expect } from "vitest";
import {
  buildCountdownPayload,
  parseInputDate,
  toDateInputValue,
} from "./countdownForm";

describe("parseInputDate", () => {
  it("returns an end-of-day Date for a yyyy-MM-dd input", () => {
    const d = parseInputDate("2030-01-15");
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
  });
});

describe("toDateInputValue", () => {
  it("returns undefined when no iso string is given", () => {
    expect(toDateInputValue(undefined)).toBeUndefined();
  });

  it("formats an iso string as yyyy-MM-dd", () => {
    expect(toDateInputValue("2030-03-09T12:00:00.000Z")).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});

describe("buildCountdownPayload", () => {
  it("returns an error naming each missing field", () => {
    const { error, entity } = buildCountdownPayload({ title: "x" });
    expect(error).toBe("Still needed: a date, a color, an emoji.");
    expect(entity).toBeUndefined();
  });

  it("names only the missing fields", () => {
    const { error } = buildCountdownPayload({
      title: "x",
      date: new Date(),
      hexColor: "#fff",
    });
    expect(error).toBe("Still needed: an emoji.");
  });

  it("returns an entity with an iso date when all fields are set", () => {
    const date = new Date("2030-07-04T23:59:59.000Z");
    const { entity, error } = buildCountdownPayload({
      title: "July 4",
      date,
      hexColor: "#FF0000",
      emoji: "🇺🇸",
    });
    expect(error).toBeUndefined();
    expect(entity).toEqual({
      title: "July 4",
      date: date.toISOString(),
      hexColor: "#FF0000",
      emoji: "🇺🇸",
    });
  });
});
