import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import Countdown from "./Countdown";
import { CountdownEntity } from "../entities";

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 10);

const mockCountdown: CountdownEntity = {
  id: "test-1",
  emoji: "🎄",
  title: "Christmas",
  date: futureDate.toISOString(),
  hexColor: "#FF0000",
};

const todayCountdown: CountdownEntity = {
  id: "test-2",
  emoji: "🎃",
  title: "Halloween",
  date: new Date().toISOString(),
  hexColor: "#FF4500",
};

function renderCountdown(
  countdown: CountdownEntity,
  overrides?: Partial<{
    setCreateCountdown: (val: boolean) => void;
    setSelectedCountdown: (val: CountdownEntity) => void;
    deleteCountdown: (countdown: CountdownEntity) => void;
  }>,
) {
  const props = {
    countdown,
    setCreateCountdown: vi.fn(),
    setSelectedCountdown: vi.fn(),
    deleteCountdown: vi.fn(),
    ...overrides,
  };
  return {
    ...render(
      <ThemeProvider>
        <Countdown {...props} />
      </ThemeProvider>,
    ),
    props,
  };
}

describe("Countdown", () => {
  it("renders the countdown title", () => {
    renderCountdown(mockCountdown);
    expect(screen.getByText("Christmas")).toBeInTheDocument();
  });

  it("renders the emoji", () => {
    renderCountdown(mockCountdown);
    expect(screen.getByText("🎄")).toBeInTheDocument();
  });

  it("shows 'today' for countdowns due today", () => {
    renderCountdown(todayCountdown);
    expect(screen.getByText("today")).toBeInTheDocument();
  });

  it("shows relative date for future countdowns", () => {
    renderCountdown(mockCountdown);
    expect(screen.getByText(/\d+ days/)).toBeInTheDocument();
  });

  it("calls deleteCountdown when delete button is clicked", async () => {
    const deleteCountdown = vi.fn();
    renderCountdown(mockCountdown, { deleteCountdown });
    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);
    expect(deleteCountdown).toHaveBeenCalledWith(mockCountdown);
  });

  it("calls setSelectedCountdown and setCreateCountdown on title click", () => {
    const setSelectedCountdown = vi.fn();
    const setCreateCountdown = vi.fn();
    renderCountdown(mockCountdown, {
      setSelectedCountdown,
      setCreateCountdown,
    });
    fireEvent.click(screen.getByText("Christmas"));
    expect(setSelectedCountdown).toHaveBeenCalledWith(mockCountdown);
    expect(setCreateCountdown).toHaveBeenCalledWith(true);
  });
});
