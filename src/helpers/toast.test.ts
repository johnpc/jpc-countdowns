import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { dismissToast, showToast, subscribeToToasts, Toast } from "./toast";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
});

describe("toast", () => {
  it("notifies subscribers when a toast is shown and dismissed", () => {
    const seen: Toast[][] = [];
    const unsubscribe = subscribeToToasts((t) => seen.push(t));
    const id = showToast("hello", { variation: "error" });
    expect(seen.at(-1)).toEqual([
      expect.objectContaining({ id, message: "hello", variation: "error" }),
    ]);
    dismissToast(id);
    expect(seen.at(-1)).toEqual([]);
    unsubscribe();
  });

  it("auto-dismisses after the duration", () => {
    const seen: Toast[][] = [];
    const unsubscribe = subscribeToToasts((t) => seen.push(t));
    showToast("bye", { durationMs: 1000 });
    expect(seen.at(-1)).toHaveLength(1);
    vi.advanceTimersByTime(1001);
    expect(seen.at(-1)).toEqual([]);
    unsubscribe();
  });

  it("defaults to the info variation and carries action metadata", () => {
    const onAction = vi.fn();
    const seen: Toast[][] = [];
    const unsubscribe = subscribeToToasts((t) => seen.push(t));
    showToast("deleted", { actionLabel: "Undo", onAction });
    const toast = seen.at(-1)![0];
    expect(toast.variation).toBe("info");
    expect(toast.actionLabel).toBe("Undo");
    toast.onAction!();
    expect(onAction).toHaveBeenCalled();
    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToToasts(listener);
    unsubscribe();
    const before = listener.mock.calls.length;
    showToast("silent");
    expect(listener.mock.calls.length).toBe(before);
  });
});
