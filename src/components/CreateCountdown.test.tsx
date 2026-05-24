import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import CreateCountdown from "./CreateCountdown";
import { CountdownEntity } from "../entities";

const mockCreateCountdown = vi.fn().mockResolvedValue({});
const mockUpdateCountdown = vi.fn().mockResolvedValue({});

vi.mock("../entities", () => ({
  createCountdown: (...args: unknown[]) => mockCreateCountdown(...args),
  updateCountdown: (...args: unknown[]) => mockUpdateCountdown(...args),
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

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

function renderCreateCountdown(props?: {
  existingCountdown?: CountdownEntity;
  onCreated?: () => void;
}) {
  const onCreated = props?.onCreated ?? vi.fn();
  return {
    ...render(
      <ThemeProvider>
        <CreateCountdown
          existingCountdown={props?.existingCountdown}
          onCreated={onCreated}
        />
      </ThemeProvider>,
    ),
    onCreated,
  };
}

describe("CreateCountdown", () => {
  it("renders title, color, date, and emoji fields", () => {
    renderCreateCountdown();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Color")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByText("Emoji")).toBeInTheDocument();
  });

  it("renders Create button for new countdown", () => {
    renderCreateCountdown();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders Update button for existing countdown", () => {
    renderCreateCountdown({
      existingCountdown: {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T23:59:59.999Z",
        hexColor: "#FF0000",
      },
    });
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  it("shows alert if fields are missing on submit", () => {
    renderCreateCountdown();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(window.alert).toHaveBeenCalledWith("Ensure all fields are set.");
    expect(mockCreateCountdown).not.toHaveBeenCalled();
  });

  it("calls createCountdown with correct data on submit", async () => {
    renderCreateCountdown();

    const titleInput = screen.getByLabelText("Title");
    const colorInput = screen.getByLabelText("Color");
    const dateInput = screen.getByLabelText("Date");

    fireEvent.change(titleInput, { target: { value: "New Year" } });
    fireEvent.change(colorInput, { target: { value: "#00FF00" } });
    fireEvent.change(dateInput, { target: { value: "2026-12-31" } });
    fireEvent.click(screen.getByTestId("emoji-picker"));

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockCreateCountdown).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Year",
          emoji: "🎉",
        }),
      );
    });
  });

  it("calls updateCountdown for existing countdown", async () => {
    renderCreateCountdown({
      existingCountdown: {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T23:59:59.999Z",
        hexColor: "#FF0000",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() => {
      expect(mockUpdateCountdown).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" }),
      );
    });
  });

  it("calls onCreated when Back button is clicked", () => {
    const onCreated = vi.fn();
    renderCreateCountdown({ onCreated });
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onCreated).toHaveBeenCalled();
  });

  it("shows emoji picker for new countdown", () => {
    renderCreateCountdown();
    expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();
  });

  it("shows Change Emoji button for existing countdown with emoji", () => {
    renderCreateCountdown({
      existingCountdown: {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T23:59:59.999Z",
        hexColor: "#FF0000",
      },
    });
    expect(
      screen.getByRole("button", { name: "Change Emoji" }),
    ).toBeInTheDocument();
  });

  it("shows emoji picker when Change Emoji is clicked", () => {
    renderCreateCountdown({
      existingCountdown: {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T23:59:59.999Z",
        hexColor: "#FF0000",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Change Emoji" }));
    expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();
  });

  it("displays descriptive text when title is set", () => {
    renderCreateCountdown({
      existingCountdown: {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T23:59:59.999Z",
        hexColor: "#FF0000",
      },
    });
    expect(screen.getByText(/Title Added/)).toBeInTheDocument();
  });

  it("displays color description when hexColor is set", () => {
    renderCreateCountdown({
      existingCountdown: {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T23:59:59.999Z",
        hexColor: "#FF0000",
      },
    });
    expect(screen.getByText(/You have chosen #FF0000/)).toBeInTheDocument();
  });

  it("displays date description when date is set", () => {
    renderCreateCountdown({
      existingCountdown: {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T23:59:59.999Z",
        hexColor: "#FF0000",
      },
    });
    expect(screen.getByText(/You have chosen.*Dec.*2026/)).toBeInTheDocument();
  });

  it("displays emoji description when emoji is set", () => {
    renderCreateCountdown({
      existingCountdown: {
        id: "1",
        emoji: "🎄",
        title: "Christmas",
        date: "2026-12-25T23:59:59.999Z",
        hexColor: "#FF0000",
      },
    });
    expect(screen.getByText(/You have chosen 🎄/)).toBeInTheDocument();
  });
});
