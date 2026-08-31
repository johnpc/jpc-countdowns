import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { CountdownEntity } from "../entities";

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
vi.mock("../entities", () => ({
  createCountdown: (...a: unknown[]) => mockCreate(...a),
  updateCountdown: (...a: unknown[]) => mockUpdate(...a),
  deleteCountdown: (...a: unknown[]) => mockDelete(...a),
}));

const mockShowToast = vi.fn();
vi.mock("./toast", () => ({
  showToast: (...a: unknown[]) => mockShowToast(...a),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));
vi.mock("capacitor-widgetsbridge-plugin", () => ({
  WidgetsBridgePlugin: {},
}));

const { useCountdownMutations } = await import("./useCountdownMutations");

const future = new Date(Date.now() + 86400_000 * 30).toISOString();
const row = (id: string): CountdownEntity => ({
  id,
  title: id,
  emoji: "🎉",
  date: future,
  hexColor: "#123456",
});

const setup = (initial: CountdownEntity[]) =>
  renderHook(() => {
    const [list, setList] = useState(initial);
    return { list, ...useCountdownMutations(setList) };
  });

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("addCountdown", () => {
  it("adds optimistically BEFORE the network resolves", () => {
    mockCreate.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = setup([]);
    act(() => result.current.addCountdown(row("a")));
    expect(result.current.list).toHaveLength(1);
  });

  it("swaps the temp id for the server row on success", async () => {
    mockCreate.mockResolvedValue(row("server-id"));
    const { result } = setup([]);
    act(() => result.current.addCountdown(row("a")));
    await waitFor(() =>
      expect(result.current.list.map((c) => c.id)).toEqual(["server-id"]),
    );
  });

  it("does not duplicate when the subscription already delivered the row", async () => {
    mockCreate.mockResolvedValue(row("server-id"));
    const { result } = setup([row("server-id")]);
    act(() => result.current.addCountdown(row("a")));
    await waitFor(() =>
      expect(result.current.list.map((c) => c.id)).toEqual(["server-id"]),
    );
  });

  it("rolls back and toasts on failure", async () => {
    mockCreate.mockRejectedValue(new Error("network"));
    const { result } = setup([]);
    act(() => result.current.addCountdown(row("a")));
    await waitFor(() => expect(result.current.list).toHaveLength(0));
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining("Couldn't save"),
      { variation: "error" },
    );
  });
});

describe("editCountdown", () => {
  it("applies the edit optimistically and keeps it on success", async () => {
    mockUpdate.mockResolvedValue(row("a"));
    const { result } = setup([row("a")]);
    act(() => result.current.editCountdown({ ...row("a"), title: "renamed" }));
    expect(result.current.list[0].title).toBe("renamed");
  });

  it("restores the previous row and toasts on failure", async () => {
    mockUpdate.mockRejectedValue(new Error("network"));
    const { result } = setup([row("a")]);
    act(() => result.current.editCountdown({ ...row("a"), title: "renamed" }));
    await waitFor(() => expect(result.current.list[0].title).toBe("a"));
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining("Couldn't update"),
      { variation: "error" },
    );
  });
});

describe("removeCountdown", () => {
  it("removes optimistically and offers Undo", () => {
    mockDelete.mockReturnValue(new Promise(() => {}));
    const { result } = setup([row("a")]);
    act(() => result.current.removeCountdown(row("a")));
    expect(result.current.list).toHaveLength(0);
    expect(mockShowToast).toHaveBeenCalledWith(
      'Deleted "a"',
      expect.objectContaining({ actionLabel: "Undo" }),
    );
  });

  it("Undo recreates the countdown", async () => {
    mockDelete.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue(row("recreated"));
    const { result } = setup([row("a")]);
    act(() => result.current.removeCountdown(row("a")));
    const undo = mockShowToast.mock.calls[0][1].onAction as () => void;
    act(() => undo());
    await waitFor(() =>
      expect(result.current.list.map((c) => c.id)).toEqual(["recreated"]),
    );
    expect(mockCreate).toHaveBeenCalledWith(
      expect.not.objectContaining({ id: expect.anything() }),
    );
  });

  it("restores the row and toasts on delete failure", async () => {
    mockDelete.mockRejectedValue(new Error("network"));
    const { result } = setup([row("a")]);
    act(() => result.current.removeCountdown(row("a")));
    await waitFor(() => expect(result.current.list).toHaveLength(1));
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining("Couldn't delete"),
      { variation: "error" },
    );
  });
});

describe("mutating a row whose create is still in flight", () => {
  it("edit waits for the real id and sends it upstream", async () => {
    let resolveCreate!: (c: CountdownEntity) => void;
    mockCreate.mockReturnValue(new Promise((r) => (resolveCreate = r)));
    mockUpdate.mockResolvedValue(undefined);
    const { result } = setup([]);
    act(() => result.current.addCountdown(row("draft")));
    const tempId = result.current.list[0].id!;
    expect(tempId).toMatch(/^optimistic-/);

    act(() =>
      result.current.editCountdown({
        ...row("draft"),
        id: tempId,
        title: "edited",
      }),
    );
    expect(mockUpdate).not.toHaveBeenCalled(); // must wait for the real id
    act(() => resolveCreate(row("server-id")));
    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: "server-id", title: "edited" }),
      ),
    );
    expect(result.current.list.map((c) => c.id)).toEqual(["server-id"]);
    expect(result.current.list[0].title).toBe("edited");
  });

  it("delete waits for the real id and sends it upstream", async () => {
    let resolveCreate!: (c: CountdownEntity) => void;
    mockCreate.mockReturnValue(new Promise((r) => (resolveCreate = r)));
    mockDelete.mockResolvedValue(undefined);
    const { result } = setup([]);
    act(() => result.current.addCountdown(row("draft")));
    const tempId = result.current.list[0].id!;

    act(() => result.current.removeCountdown({ ...row("draft"), id: tempId }));
    expect(result.current.list).toHaveLength(0);
    expect(mockDelete).not.toHaveBeenCalled();
    act(() => resolveCreate(row("server-id")));
    await waitFor(() =>
      expect(mockDelete).toHaveBeenCalledWith(
        expect.objectContaining({ id: "server-id" }),
      ),
    );
    expect(result.current.list).toHaveLength(0);
  });

  it("skips the server call when the pending create failed", async () => {
    mockCreate.mockRejectedValue(new Error("network"));
    const { result } = setup([]);
    act(() => result.current.addCountdown(row("draft")));
    const tempId = result.current.list[0].id!;
    act(() => result.current.removeCountdown({ ...row("draft"), id: tempId }));
    await waitFor(() => expect(result.current.list).toHaveLength(0));
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
