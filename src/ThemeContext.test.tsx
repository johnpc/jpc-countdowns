import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ColorModeProvider, useColorMode } from "./ThemeContext";

const TestConsumer = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <div>
      <span data-testid="mode">{colorMode}</span>
      <button onClick={toggleColorMode}>toggle</button>
    </div>
  );
};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-color-mode");
});

describe("ThemeContext", () => {
  it("defaults to dark when localStorage is empty", () => {
    render(
      <ColorModeProvider>
        <TestConsumer />
      </ColorModeProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("dark");
  });

  it("respects localStorage value of light", () => {
    localStorage.setItem("colorMode", "light");
    render(
      <ColorModeProvider>
        <TestConsumer />
      </ColorModeProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("light");
  });

  it("toggles from dark to light and back", () => {
    render(
      <ColorModeProvider>
        <TestConsumer />
      </ColorModeProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("dark");

    act(() => {
      screen.getByText("toggle").click();
    });
    expect(screen.getByTestId("mode").textContent).toBe("light");

    act(() => {
      screen.getByText("toggle").click();
    });
    expect(screen.getByTestId("mode").textContent).toBe("dark");
  });

  it("persists colorMode to localStorage on toggle", () => {
    render(
      <ColorModeProvider>
        <TestConsumer />
      </ColorModeProvider>,
    );
    expect(localStorage.getItem("colorMode")).toBe("dark");

    act(() => {
      screen.getByText("toggle").click();
    });
    expect(localStorage.getItem("colorMode")).toBe("light");
  });

  it("sets data-color-mode attribute on document.documentElement", () => {
    render(
      <ColorModeProvider>
        <TestConsumer />
      </ColorModeProvider>,
    );
    expect(document.documentElement.getAttribute("data-color-mode")).toBe(
      "dark",
    );

    act(() => {
      screen.getByText("toggle").click();
    });
    expect(document.documentElement.getAttribute("data-color-mode")).toBe(
      "light",
    );
  });
});
