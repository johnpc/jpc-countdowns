import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import { Header } from "./Header";

describe("Header", () => {
  it("renders the app name", () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );
    expect(screen.getByText("jpc.countdowns")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    );
    expect(
      screen.getByText("Keep track of what's coming up"),
    ).toBeInTheDocument();
  });
});
