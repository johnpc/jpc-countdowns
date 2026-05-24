import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@aws-amplify/ui-react";

const { mockSignIn, hubState, authState } = vi.hoisted(() => ({
  mockSignIn: vi.fn().mockResolvedValue({}),
  hubState: {
    callback: null as ((data: { payload: { event: string } }) => void) | null,
  },
  authState: {
    Header: null as React.ComponentType | null,
    Footer: null as React.ComponentType | null,
  },
}));

vi.mock("aws-amplify/auth", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  getCurrentUser: vi.fn().mockResolvedValue({
    userId: "user-1",
    username: "testuser",
    signInDetails: { loginId: "test@test.com" },
  }),
}));

vi.mock("aws-amplify/utils", () => ({
  Hub: {
    listen: (
      _channel: string,
      cb: (data: { payload: { event: string } }) => void,
    ) => {
      hubState.callback = cb;
    },
  },
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: vi.fn().mockReturnValue("web") },
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

vi.mock("./entities", () => ({
  listCountdowns: vi.fn().mockResolvedValue([]),
  createCountdownListener: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  updateCountdownListener: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  deleteCountdownListener: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  unsubscribeListener: vi.fn(),
  deleteCountdown: vi.fn(),
}));

vi.mock("@aws-amplify/ui-react", async () => {
  const actual = await vi.importActual<typeof import("@aws-amplify/ui-react")>(
    "@aws-amplify/ui-react",
  );
  return {
    ...actual,
    withAuthenticator: (
      Component: React.ComponentType,
      options?: {
        components?: {
          Header?: React.ComponentType;
          Footer?: React.ComponentType;
        };
      },
    ) => {
      if (options?.components?.Header) {
        authState.Header = options.components.Header;
      }
      if (options?.components?.Footer) {
        authState.Footer = options.components.Footer;
      }
      return Component;
    },
  };
});

import App from "./App";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("App", () => {
  it("renders the header with app name", () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
    expect(screen.getByText("jpc.countdowns")).toBeInTheDocument();
  });

  it("renders the footer", () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
    expect(
      screen.getByText(/countdowns\.jpc\.io is free to use/),
    ).toBeInTheDocument();
  });

  it("renders the Create Countdown button", () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole("button", { name: /Create Countdown/i }),
    ).toBeInTheDocument();
  });
});

describe("Hub auth listener", () => {
  it("handles all auth events without throwing", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const events = [
      "signedIn",
      "signedOut",
      "tokenRefresh",
      "tokenRefresh_failure",
      "signInWithRedirect",
      "signInWithRedirect_failure",
      "customOAuthState",
      "unknownEvent",
    ];

    expect(hubState.callback).not.toBeNull();
    for (const event of events) {
      expect(() => hubState.callback!({ payload: { event } })).not.toThrow();
    }

    consoleSpy.mockRestore();
    infoSpy.mockRestore();
  });
});

describe("withAuthenticator Header", () => {
  it("captures the authenticator Header component", () => {
    expect(authState.Header).not.toBeNull();
  });

  it("renders the authenticator Header with logo and title", () => {
    const AuthHeader = authState.Header!;
    render(
      <ThemeProvider>
        <AuthHeader />
      </ThemeProvider>,
    );
    expect(screen.getByAltText("logo")).toBeInTheDocument();
    expect(screen.getAllByText("jpc.countdowns").length).toBeGreaterThan(0);
  });

  it("handles autologin param from URL", () => {
    const credentials = btoa(
      JSON.stringify({ username: "test", password: "pass" }),
    );
    Object.defineProperty(window, "location", {
      value: { search: `?autologin=${credentials}`, href: "/" },
      writable: true,
    });
    const AuthHeader = authState.Header!;
    render(
      <ThemeProvider>
        <AuthHeader />
      </ThemeProvider>,
    );
    expect(screen.getAllByText("jpc.countdowns").length).toBeGreaterThan(0);
  });
});

describe("withAuthenticator Footer", () => {
  it("captures the authenticator Footer component", () => {
    expect(authState.Footer).not.toBeNull();
  });

  it("renders the iOS download link on web", () => {
    const AuthFooter = authState.Footer!;
    render(
      <ThemeProvider>
        <AuthFooter />
      </ThemeProvider>,
    );
    expect(
      screen.getByText("Download the app for iOS devices"),
    ).toBeInTheDocument();
  });
});
