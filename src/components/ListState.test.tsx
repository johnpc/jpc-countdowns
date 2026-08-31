import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import ListState from "./ListState";

const renderState = (
  state: Partial<{ loading: boolean; error: boolean; empty: boolean }>,
  onRetry = vi.fn(),
) => {
  render(
    <ThemeProvider>
      <ListState
        loading={state.loading ?? false}
        error={state.error ?? false}
        empty={state.empty ?? false}
        onRetry={onRetry}
      >
        <div>content</div>
      </ListState>
    </ThemeProvider>,
  );
  return onRetry;
};

describe("ListState", () => {
  it("renders children when ready", () => {
    renderState({});
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders a loader while loading", () => {
    renderState({ loading: true });
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders a retryable error state", () => {
    const onRetry = renderState({ error: true });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("error takes priority over loading and empty", () => {
    renderState({ error: true, loading: true, empty: true });
    expect(screen.getByText(/Couldn't load/)).toBeInTheDocument();
  });

  it("renders a titled empty state distinct from loading", () => {
    renderState({ empty: true });
    expect(screen.getByText("Nothing coming up yet")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });
});
