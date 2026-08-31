import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetItem = vi.fn().mockResolvedValue(undefined);
const mockReload = vi.fn().mockResolvedValue(undefined);

vi.mock("capacitor-widgetsbridge-plugin", () => ({
  WidgetsBridgePlugin: {
    setItem: (...args: unknown[]) => mockSetItem(...args),
    reloadAllTimelines: () => mockReload(),
  },
}));

// The sync funnel only talks to the widget bridge inside the native shell.
const mockIsNative = vi.hoisted(() => ({ value: true }));
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => mockIsNative.value },
}));

const {
  sortAndFilterFuture,
  persistCountdowns,
  setWidgetPreferences,
  reloadWidgetTimelines,
} = await import("./countdownSync");

const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
const past = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
const make = (id: string, date: string) => ({
  id,
  date,
  title: id,
  emoji: "x",
  hexColor: "#000",
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockIsNative.value = true;
});

describe("sortAndFilterFuture", () => {
  it("drops past countdowns and sorts ascending by date", () => {
    const soon = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const later = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();
    const result = sortAndFilterFuture([
      make("later", later),
      make("past", past),
      make("soon", soon),
    ]);
    expect(result.map((c) => c.id)).toEqual(["soon", "later"]);
  });

  it("does not mutate the input array", () => {
    const input = [make("a", future)];
    sortAndFilterFuture(input);
    expect(input).toHaveLength(1);
  });
});

describe("persistCountdowns", () => {
  it("writes the filtered list to localStorage and the widget", async () => {
    const result = persistCountdowns([make("a", future), make("b", past)]);
    expect(result.map((c) => c.id)).toEqual(["a"]);
    expect(JSON.parse(localStorage.getItem("countdowns")!)).toHaveLength(1);
    // setWidgetPreferences is fired without await; flush microtasks first.
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSetItem).toHaveBeenCalled();
    expect(mockReload).toHaveBeenCalled();
  });
});

describe("setWidgetPreferences", () => {
  it("serializes entities and reloads timelines", async () => {
    await setWidgetPreferences([make("a", future)]);
    expect(mockSetItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: "countdownEntities" }),
    );
    expect(mockReload).toHaveBeenCalled();
  });

  it("is a no-op on web where the bridge does not exist", async () => {
    mockIsNative.value = false;
    await setWidgetPreferences([make("a", future)]);
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});

describe("reloadWidgetTimelines", () => {
  it("reloads on native and no-ops on web", async () => {
    await reloadWidgetTimelines();
    expect(mockReload).toHaveBeenCalledTimes(1);
    mockIsNative.value = false;
    await reloadWidgetTimelines();
    expect(mockReload).toHaveBeenCalledTimes(1);
  });
});
