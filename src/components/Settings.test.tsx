import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";
import Settings from "./Settings";
import { CountdownEntity } from "../entities";
import { AuthUser } from "aws-amplify/auth";

vi.mock("aws-amplify/auth", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("capacitor-widgetsbridge-plugin", () => ({
  WidgetsBridgePlugin: {
    setItem: vi.fn().mockResolvedValue(undefined),
    reloadAllTimelines: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../helpers/createCountdownsForMajorHolidays", () => ({
  createCountdownsForMajorHolidays: vi.fn().mockResolvedValue(undefined),
}));

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 10);

const mockCountdowns: CountdownEntity[] = [
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

const mockUser: AuthUser = {
  userId: "user-1",
  username: "testuser",
  signInDetails: { loginId: "test@test.com", authFlowType: "USER_SRP_AUTH" },
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

function renderSettings(overrides?: {
  countdowns?: CountdownEntity[];
  onFinished?: () => void;
}) {
  const onFinished = overrides?.onFinished ?? vi.fn();
  return {
    ...render(
      <ThemeProvider>
        <Settings
          user={mockUser}
          countdowns={overrides?.countdowns ?? mockCountdowns}
          onFinished={onFinished}
        />
      </ThemeProvider>,
    ),
    onFinished,
  };
}

describe("Settings", () => {
  it("renders Widget Settings heading", () => {
    renderSettings();
    expect(screen.getByText("Widget Settings")).toBeInTheDocument();
  });

  it("renders the user email", () => {
    renderSettings();
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
  });

  it("renders Sign Out button", () => {
    renderSettings();
    expect(
      screen.getByRole("button", { name: "Sign Out" }),
    ).toBeInTheDocument();
  });

  it("renders Generate Holiday Countdowns button", () => {
    renderSettings();
    expect(
      screen.getByRole("button", { name: "Generate Holiday Countdowns" }),
    ).toBeInTheDocument();
  });

  it("renders Back button that calls onFinished", () => {
    const onFinished = vi.fn();
    renderSettings({ onFinished });
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onFinished).toHaveBeenCalled();
  });

  it("renders widget countdown select with options", () => {
    renderSettings();
    expect(
      screen.getByLabelText("Update Widget Countdown"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Christmas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Halloween").length).toBeGreaterThan(0);
  });

  it("shows No countdowns found when countdowns list is empty", () => {
    renderSettings({ countdowns: [] });
    expect(screen.getByText("No countdowns found")).toBeInTheDocument();
  });

  it("renders support email link", () => {
    renderSettings();
    expect(screen.getByText("john@johncorser.com")).toBeInTheDocument();
  });

  it("calls createCountdownsForMajorHolidays when button clicked", async () => {
    const { createCountdownsForMajorHolidays } =
      await import("../helpers/createCountdownsForMajorHolidays");
    renderSettings();
    fireEvent.click(
      screen.getByRole("button", { name: "Generate Holiday Countdowns" }),
    );
    expect(createCountdownsForMajorHolidays).toHaveBeenCalledWith(
      mockCountdowns,
    );
  });

  it("updates widget when select changes", () => {
    renderSettings();
    const select = screen.getByLabelText("Update Widget Countdown");
    fireEvent.change(select, { target: { value: "2" } });
    expect(localStorage.getItem("widgetCountdownId")).toBe("2");
  });

  it("calls signOut when Sign Out button clicked", async () => {
    const { signOut } = await import("aws-amplify/auth");
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(signOut).toHaveBeenCalled();
  });
});
