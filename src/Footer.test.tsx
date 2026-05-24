import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: vi.fn(),
  },
}));

import { Capacitor } from "@capacitor/core";

describe("Footer", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("renders donation messaging on web platform", async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("web");
    const { Footer } = await import("./Footer");
    render(
      <ThemeProvider>
        <Footer />
      </ThemeProvider>,
    );
    expect(
      screen.getByText(/countdowns\.jpc\.io is free to use/),
    ).toBeInTheDocument();
  });

  it("renders payment buttons on web", async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("web");
    const { Footer } = await import("./Footer");
    render(
      <ThemeProvider>
        <Footer />
      </ThemeProvider>,
    );
    expect(screen.getByAltText("bitcoin")).toBeInTheDocument();
    expect(screen.getByAltText("paypal")).toBeInTheDocument();
    expect(screen.getByAltText("github")).toBeInTheDocument();
  });

  it("renders open source message on iOS", async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("ios");
    const { Footer } = await import("./Footer");
    render(
      <ThemeProvider>
        <Footer />
      </ThemeProvider>,
    );
    expect(
      screen.getByText(/jpc\.countdowns is open source/),
    ).toBeInTheDocument();
    expect(screen.getByAltText("github")).toBeInTheDocument();
  });
});
