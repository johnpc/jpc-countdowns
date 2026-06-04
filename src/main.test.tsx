import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRender = vi.fn();
const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });
const mockConfigure = vi.fn();

vi.mock("react-dom/client", () => ({
  createRoot: (...args: unknown[]) => mockCreateRoot(...args),
}));

vi.mock("aws-amplify", () => ({
  Amplify: { configure: (...args: unknown[]) => mockConfigure(...args) },
}));

vi.mock("../amplify_outputs.json", () => ({ default: { auth: {} } }));
vi.mock("@aws-amplify/ui-react/styles.css", () => ({}));
vi.mock("./main.css", () => ({}));

vi.mock("@aws-amplify/ui-react", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  defaultDarkModeOverride: {},
}));

vi.mock("./ThemeContext", () => ({
  ColorModeProvider: ({ children }: { children: React.ReactNode }) => children,
  useColorMode: () => ({ colorMode: "dark", toggleColorMode: () => {} }),
}));

vi.mock("./App", () => ({
  default: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '<div id="root"></div>';
});

describe("main.tsx", () => {
  it("configures Amplify, creates root, and renders the app", async () => {
    await import("./main");
    expect(mockConfigure).toHaveBeenCalledWith({ auth: {} });
    expect(mockCreateRoot).toHaveBeenCalledWith(
      document.getElementById("root"),
    );
    expect(mockRender).toHaveBeenCalled();
  });
});
