import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import Toasts from "./Toasts";
import { showToast } from "../helpers/toast";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  act(() => vi.runAllTimers());
  vi.useRealTimers();
});

const renderToasts = () =>
  render(
    <ThemeProvider>
      <Toasts />
    </ThemeProvider>,
  );

describe("Toasts", () => {
  it("renders nothing when there are no toasts", () => {
    renderToasts();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a toast message and auto-dismisses", () => {
    renderToasts();
    act(() => {
      showToast("saved!", { durationMs: 1000 });
    });
    expect(screen.getByRole("status")).toHaveTextContent("saved!");
    act(() => vi.advanceTimersByTime(1001));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("runs the action and dismisses when the action button is clicked", () => {
    const onAction = vi.fn();
    renderToasts();
    act(() => {
      showToast("Deleted", { actionLabel: "Undo", onAction });
    });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
