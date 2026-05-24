import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 5);

const mockCountdowns = [
  {
    id: "1",
    emoji: "🎄",
    title: "Christmas",
    date: futureDate.toISOString(),
    hexColor: "#FF0000",
  },
  {
    id: "2",
    emoji: "🎃",
    title: "Halloween",
    date: futureDate.toISOString(),
    hexColor: "#FF4500",
  },
];

const mockListCountdowns = vi.fn().mockResolvedValue(mockCountdowns);
const mockDeleteCountdown = vi.fn().mockResolvedValue(undefined);
type ListenerCallback = (countdown: {
  id: string;
  emoji: string;
  title: string;
  date: string;
  hexColor: string;
}) => void;

let createListener: ListenerCallback | null = null;
let updateListener: ListenerCallback | null = null;
let deleteListener: ListenerCallback | null = null;

const mockCreateCountdownListener = vi
  .fn()
  .mockImplementation((fn: ListenerCallback) => {
    createListener = fn;
    return { unsubscribe: vi.fn() };
  });
const mockUpdateCountdownListener = vi
  .fn()
  .mockImplementation((fn: ListenerCallback) => {
    updateListener = fn;
    return { unsubscribe: vi.fn() };
  });
const mockDeleteCountdownListener = vi
  .fn()
  .mockImplementation((fn: ListenerCallback) => {
    deleteListener = fn;
    return { unsubscribe: vi.fn() };
  });
const mockUnsubscribeListener = vi.fn();

vi.mock("../entities", () => ({
  listCountdowns: (...args: unknown[]) => mockListCountdowns(...args),
  deleteCountdown: (...args: unknown[]) => mockDeleteCountdown(...args),
  createCountdownListener: (...args: unknown[]) =>
    mockCreateCountdownListener(...args),
  updateCountdownListener: (...args: unknown[]) =>
    mockUpdateCountdownListener(...args),
  deleteCountdownListener: (...args: unknown[]) =>
    mockDeleteCountdownListener(...args),
  unsubscribeListener: (...args: unknown[]) => mockUnsubscribeListener(...args),
}));

vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    userId: "user-1",
    username: "testuser",
    signInDetails: { loginId: "test@test.com" },
  }),
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    removeAllListeners: vi.fn(),
  },
}));

vi.mock("capacitor-widgetsbridge-plugin", () => ({
  WidgetsBridgePlugin: {
    setItem: vi.fn().mockResolvedValue(undefined),
    reloadAllTimelines: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@emoji-mart/data", () => ({
  default: { categories: [], emojis: {} },
}));
vi.mock("@emoji-mart/react", () => ({
  default: (props: { onEmojiSelect: (e: { native: string }) => void }) => (
    <button
      data-testid="emoji-picker"
      onClick={() => props.onEmojiSelect({ native: "🎉" })}
    >
      Pick Emoji
    </button>
  ),
}));
vi.mock("emoji-mart", () => ({}));

import Countdowns from "./Countdowns";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockListCountdowns.mockResolvedValue(mockCountdowns);
});

function renderCountdowns() {
  return render(
    <ThemeProvider>
      <Countdowns />
    </ThemeProvider>,
  );
}

describe("Countdowns", () => {
  it("renders countdown items after loading", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    expect(screen.getByText("Halloween")).toBeInTheDocument();
  });

  it("shows loader when no cached countdowns and not yet loaded", () => {
    mockListCountdowns.mockReturnValue(new Promise(() => {}));
    renderCountdowns();
    expect(screen.queryByText("Christmas")).not.toBeInTheDocument();
  });

  it("shows Create Countdown button", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /Create Countdown/i }),
    ).toBeInTheDocument();
  });

  it("shows Settings button", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /Settings/i }),
    ).toBeInTheDocument();
  });

  it("switches to create countdown view when button clicked", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Countdown/i }));
    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
  });

  it("switches to settings view when button clicked", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
    await waitFor(() => {
      expect(screen.getByText("Widget Settings")).toBeInTheDocument();
    });
  });

  it("filters out past countdowns", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    mockListCountdowns.mockResolvedValue([
      ...mockCountdowns,
      {
        id: "3",
        emoji: "⏰",
        title: "Past Event",
        date: pastDate.toISOString(),
        hexColor: "#000",
      },
    ]);
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    expect(screen.queryByText("Past Event")).not.toBeInTheDocument();
  });

  it("uses cached countdowns from localStorage", () => {
    localStorage.setItem("countdowns", JSON.stringify(mockCountdowns));
    mockListCountdowns.mockReturnValue(new Promise(() => {}));
    renderCountdowns();
    expect(screen.getByText("Christmas")).toBeInTheDocument();
  });

  it("calls deleteCountdown when delete button clicked", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    const deleteButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("svg") !== null);
    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteCountdown).toHaveBeenCalled();
  });

  it("subscribes to create/update/delete listeners", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    expect(mockCreateCountdownListener).toHaveBeenCalled();
    expect(mockUpdateCountdownListener).toHaveBeenCalled();
    expect(mockDeleteCountdownListener).toHaveBeenCalled();
  });

  it("sorts countdowns by date", async () => {
    const earlier = new Date();
    earlier.setDate(earlier.getDate() + 2);
    const later = new Date();
    later.setDate(later.getDate() + 10);
    mockListCountdowns.mockResolvedValue([
      {
        id: "2",
        emoji: "🎃",
        title: "Later Event",
        date: later.toISOString(),
        hexColor: "#F00",
      },
      {
        id: "1",
        emoji: "🎄",
        title: "Earlier Event",
        date: earlier.toISOString(),
        hexColor: "#0F0",
      },
    ]);
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Earlier Event")).toBeInTheDocument();
    });
    const texts = screen.getAllByText(/Event/);
    expect(texts[0].textContent).toBe("Earlier Event");
    expect(texts[1].textContent).toBe("Later Event");
  });

  it("adds a countdown via createCountdownListener", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 3);
    const newCountdown = {
      id: "3",
      emoji: "🎆",
      title: "New Year",
      date: newDate.toISOString(),
      hexColor: "#00F",
    };
    await waitFor(() => {
      createListener!(newCountdown);
    });
    await waitFor(() => {
      expect(screen.getByText("New Year")).toBeInTheDocument();
    });
  });

  it("updates a countdown via updateCountdownListener", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    const updatedCountdown = {
      id: "1",
      emoji: "🎄",
      title: "Updated Christmas",
      date: futureDate.toISOString(),
      hexColor: "#0F0",
    };
    await waitFor(() => {
      updateListener!(updatedCountdown);
    });
    await waitFor(() => {
      expect(screen.getByText("Updated Christmas")).toBeInTheDocument();
    });
  });

  it("removes a countdown via deleteCountdownListener", async () => {
    renderCountdowns();
    await waitFor(() => {
      expect(screen.getByText("Christmas")).toBeInTheDocument();
    });
    await waitFor(() => {
      deleteListener!(mockCountdowns[0]);
    });
    await waitFor(() => {
      expect(screen.queryByText("Christmas")).not.toBeInTheDocument();
    });
  });
});
