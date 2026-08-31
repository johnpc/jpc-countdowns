import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { CountdownEntity } from "../entities";

const mockList = vi.fn();
const subs = { create: vi.fn(), update: vi.fn(), del: vi.fn() };
let createListener: ((c: CountdownEntity) => void) | null = null;
vi.mock("../entities", () => ({
  listCountdowns: (...a: unknown[]) => mockList(...a),
  createCountdown: vi.fn(),
  updateCountdown: vi.fn(),
  deleteCountdown: vi.fn(),
  createCountdownListener: (fn: (c: CountdownEntity) => void) => {
    createListener = fn;
    return subs.create;
  },
  updateCountdownListener: () => subs.update,
  deleteCountdownListener: () => subs.del,
  unsubscribeListener: vi.fn(),
}));
vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ userId: "u1" }),
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));
vi.mock("@capacitor/app", () => ({
  App: { addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }) },
}));
vi.mock("capacitor-widgetsbridge-plugin", () => ({
  WidgetsBridgePlugin: {},
}));

const { useCountdowns } = await import("./useCountdowns");

const future = new Date(Date.now() + 86400_000 * 10).toISOString();
const row: CountdownEntity = {
  id: "a",
  title: "a",
  emoji: "🎉",
  date: future,
  hexColor: "#123",
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  createListener = null;
});

describe("useCountdowns", () => {
  it("loads countdowns and reports loaded", async () => {
    mockList.mockResolvedValue([row]);
    const { result } = renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.countdowns.map((c) => c.id)).toEqual(["a"]);
    expect(result.current.loadFailed).toBe(false);
  });

  it("sets loadFailed on error and recovers via retry", async () => {
    mockList.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.loadFailed).toBe(true));
    expect(result.current.loaded).toBe(false);

    mockList.mockResolvedValue([row]);
    await act(() => result.current.retry());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.loadFailed).toBe(false);
    expect(result.current.countdowns).toHaveLength(1);
  });

  it("upserts rows delivered by the create subscription", async () => {
    mockList.mockResolvedValue([]);
    const { result } = renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    act(() => createListener!(row));
    expect(result.current.countdowns.map((c) => c.id)).toEqual(["a"]);
    // The same event delivered twice must not duplicate the row.
    act(() => createListener!(row));
    expect(result.current.countdowns).toHaveLength(1);
  });

  it("starts from the localStorage cache before the network resolves", () => {
    localStorage.setItem("countdowns", JSON.stringify([row]));
    mockList.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCountdowns());
    expect(result.current.countdowns).toHaveLength(1);
    expect(result.current.loaded).toBe(false);
  });
});
