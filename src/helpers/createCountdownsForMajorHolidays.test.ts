import { describe, it, expect, vi, beforeEach } from "vitest";
import { CountdownEntity } from "../entities";

vi.mock("../entities", () => ({
  createCountdown: vi.fn().mockResolvedValue({}),
}));

const mockShowToast = vi.fn();
vi.mock("./toast", () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
}));

const { createCountdownsForMajorHolidays } =
  await import("./createCountdownsForMajorHolidays");
const { createCountdown } = await import("../entities");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createCountdownsForMajorHolidays", () => {
  it("creates countdowns for all 13 holidays when none exist", async () => {
    await createCountdownsForMajorHolidays([]);
    expect(createCountdown).toHaveBeenCalledTimes(13);
  });

  it("does not create duplicates when holidays already exist", async () => {
    const existing: CountdownEntity[] = [
      {
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T00:00:00.000Z",
        hexColor: "#FFFFFF",
      },
      {
        emoji: "🎃",
        title: "Halloween",
        date: "2026-10-31T00:00:00.000Z",
        hexColor: "#FF4500",
      },
    ];
    await createCountdownsForMajorHolidays(existing);
    expect(createCountdown).toHaveBeenCalledTimes(11);
  });

  it("is case-insensitive when matching existing titles", async () => {
    const existing: CountdownEntity[] = [
      {
        emoji: "🎄",
        title: "CHRISTMAS",
        date: "2026-12-25T00:00:00.000Z",
        hexColor: "#FFFFFF",
      },
    ];
    await createCountdownsForMajorHolidays(existing);
    expect(createCountdown).toHaveBeenCalledTimes(12);
  });

  it("shows a toast with the count of created countdowns", async () => {
    await createCountdownsForMajorHolidays([]);
    expect(mockShowToast).toHaveBeenCalledWith(
      "Created 13 holiday countdowns.",
      undefined,
    );
  });

  it("shows an error toast when some creates fail", async () => {
    vi.mocked(createCountdown).mockRejectedValueOnce(new Error("boom"));
    await createCountdownsForMajorHolidays([]);
    expect(mockShowToast).toHaveBeenCalledWith(
      "Created 12 countdowns (1 failed — try again).",
      { variation: "error" },
    );
  });

  it("shows an info toast when nothing is missing", async () => {
    const all = (await import("./majorHolidays")).majorHolidaySpecs.map(
      (h) => ({
        title: h.title,
        emoji: h.emoji,
        hexColor: h.hexColor,
        date: "",
      }),
    );
    await createCountdownsForMajorHolidays(all);
    expect(createCountdown).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      "All major holidays are already in your list.",
    );
  });

  it("passes correct shape to createCountdown", async () => {
    await createCountdownsForMajorHolidays([]);
    const firstCall = vi.mocked(createCountdown).mock.calls[0][0];
    expect(firstCall).toHaveProperty("title");
    expect(firstCall).toHaveProperty("date");
    expect(firstCall).toHaveProperty("hexColor");
    expect(firstCall).toHaveProperty("emoji");
    expect(typeof firstCall.date).toBe("string");
  });
});
