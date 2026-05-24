import { describe, it, expect, vi, beforeEach } from "vitest";

const mockList = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockOnCreate = vi.fn();
const mockOnUpdate = vi.fn();
const mockOnDelete = vi.fn();

vi.mock("aws-amplify/data", () => ({
  generateClient: () => ({
    models: {
      Countdown: {
        list: mockList,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
        onCreate: mockOnCreate,
        onUpdate: mockOnUpdate,
        onDelete: mockOnDelete,
      },
    },
  }),
}));

const {
  listCountdowns,
  createCountdown,
  updateCountdown,
  deleteCountdown,
  createCountdownListener,
  updateCountdownListener,
  deleteCountdownListener,
  unsubscribeListener,
} = await import("./entities");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listCountdowns", () => {
  it("returns mapped countdowns on success", async () => {
    mockList.mockResolvedValue({
      data: [
        {
          id: "1",
          emoji: "🎄",
          title: "Christmas",
          date: "2026-12-25",
          hexColor: "#FFF",
        },
      ],
      errors: undefined,
    });
    const result = await listCountdowns();
    expect(result).toEqual([
      {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25",
        hexColor: "#FFF",
      },
    ]);
  });

  it("throws on errors", async () => {
    mockList.mockResolvedValue({
      data: [],
      errors: [{ message: "Network error" }],
    });
    await expect(listCountdowns()).rejects.toThrow("Network error");
  });
});

describe("createCountdown", () => {
  it("returns the created countdown", async () => {
    const input = {
      emoji: "🎃",
      title: "Halloween",
      date: "2026-10-31",
      hexColor: "#F00",
    };
    mockCreate.mockResolvedValue({
      data: { id: "2", ...input },
      errors: undefined,
    });
    const result = await createCountdown(input);
    expect(result).toEqual({ id: "2", ...input });
  });

  it("throws on errors", async () => {
    mockCreate.mockResolvedValue({
      data: null,
      errors: [{ message: "Forbidden" }],
    });
    await expect(
      createCountdown({ emoji: "x", title: "x", date: "x", hexColor: "x" }),
    ).rejects.toThrow("Forbidden");
  });
});

describe("updateCountdown", () => {
  it("updates and returns the countdown", async () => {
    const input = {
      id: "1",
      emoji: "🎄",
      title: "Xmas",
      date: "2026-12-25",
      hexColor: "#FFF",
    };
    mockUpdate.mockResolvedValue({ data: input, errors: undefined });
    const result = await updateCountdown(input);
    expect(result).toEqual(input);
  });

  it("returns undefined if no id", async () => {
    const result = await updateCountdown({
      emoji: "x",
      title: "x",
      date: "x",
      hexColor: "x",
    });
    expect(result).toBeUndefined();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws on errors", async () => {
    mockUpdate.mockResolvedValue({
      data: null,
      errors: [{ message: "Not found" }],
    });
    await expect(
      updateCountdown({
        id: "1",
        emoji: "x",
        title: "x",
        date: "x",
        hexColor: "x",
      }),
    ).rejects.toThrow("Not found");
  });
});

describe("deleteCountdown", () => {
  it("calls delete with the countdown id", async () => {
    mockDelete.mockResolvedValue({ errors: undefined });
    await deleteCountdown({
      id: "1",
      emoji: "x",
      title: "x",
      date: "x",
      hexColor: "x",
    });
    expect(mockDelete).toHaveBeenCalledWith({ id: "1" });
  });

  it("does nothing if no id", async () => {
    await deleteCountdown({ emoji: "x", title: "x", date: "x", hexColor: "x" });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("throws on errors", async () => {
    mockDelete.mockResolvedValue({ errors: [{ message: "Server error" }] });
    await expect(
      deleteCountdown({
        id: "1",
        emoji: "x",
        title: "x",
        date: "x",
        hexColor: "x",
      }),
    ).rejects.toThrow("Server error");
  });
});

describe("listeners", () => {
  it("createCountdownListener invokes callback on next", () => {
    let nextHandler: (data: unknown) => void = () => {};
    const mockSubscribe = vi.fn().mockImplementation((observer) => {
      nextHandler = observer.next;
      return { unsubscribe: vi.fn() };
    });
    mockOnCreate.mockReturnValue({ subscribe: mockSubscribe });
    const fn = vi.fn();
    createCountdownListener(fn);
    const countdown = {
      id: "1",
      emoji: "x",
      title: "x",
      date: "x",
      hexColor: "x",
    };
    nextHandler(countdown);
    expect(fn).toHaveBeenCalledWith(countdown);
  });

  it("createCountdownListener logs error on subscription error", () => {
    let errorHandler: (err: Error) => void = () => {};
    const mockSubscribe = vi.fn().mockImplementation((observer) => {
      errorHandler = observer.error;
      return { unsubscribe: vi.fn() };
    });
    mockOnCreate.mockReturnValue({ subscribe: mockSubscribe });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    createCountdownListener(vi.fn());
    errorHandler(new Error("test error"));
    expect(consoleSpy).toHaveBeenCalledWith(
      "Subscription error",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("updateCountdownListener invokes callback on next", () => {
    let nextHandler: (data: unknown) => void = () => {};
    const mockSubscribe = vi.fn().mockImplementation((observer) => {
      nextHandler = observer.next;
      return { unsubscribe: vi.fn() };
    });
    mockOnUpdate.mockReturnValue({ subscribe: mockSubscribe });
    const fn = vi.fn();
    updateCountdownListener(fn);
    const countdown = {
      id: "2",
      emoji: "y",
      title: "y",
      date: "y",
      hexColor: "y",
    };
    nextHandler(countdown);
    expect(fn).toHaveBeenCalledWith(countdown);
  });

  it("updateCountdownListener logs error on subscription error", () => {
    let errorHandler: (err: Error) => void = () => {};
    const mockSubscribe = vi.fn().mockImplementation((observer) => {
      errorHandler = observer.error;
      return { unsubscribe: vi.fn() };
    });
    mockOnUpdate.mockReturnValue({ subscribe: mockSubscribe });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    updateCountdownListener(vi.fn());
    errorHandler(new Error("update error"));
    expect(consoleSpy).toHaveBeenCalledWith(
      "Subscription error",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("deleteCountdownListener invokes callback on next", () => {
    let nextHandler: (data: unknown) => void = () => {};
    const mockSubscribe = vi.fn().mockImplementation((observer) => {
      nextHandler = observer.next;
      return { unsubscribe: vi.fn() };
    });
    mockOnDelete.mockReturnValue({ subscribe: mockSubscribe });
    const fn = vi.fn();
    deleteCountdownListener(fn);
    const countdown = {
      id: "3",
      emoji: "z",
      title: "z",
      date: "z",
      hexColor: "z",
    };
    nextHandler(countdown);
    expect(fn).toHaveBeenCalledWith(countdown);
  });

  it("deleteCountdownListener logs error on subscription error", () => {
    let errorHandler: (err: Error) => void = () => {};
    const mockSubscribe = vi.fn().mockImplementation((observer) => {
      errorHandler = observer.error;
      return { unsubscribe: vi.fn() };
    });
    mockOnDelete.mockReturnValue({ subscribe: mockSubscribe });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    deleteCountdownListener(vi.fn());
    errorHandler(new Error("delete error"));
    expect(consoleSpy).toHaveBeenCalledWith(
      "Subscription error",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("unsubscribeListener calls unsubscribe", () => {
    const mockUnsub = vi.fn();
    const subscription = {
      unsubscribe: mockUnsub,
    } as unknown as import("rxjs").Subscription;
    unsubscribeListener(subscription);
    expect(mockUnsub).toHaveBeenCalled();
  });
});
