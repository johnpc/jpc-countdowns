import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignIn = vi.fn().mockResolvedValue({});
vi.mock("aws-amplify/auth", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

const { attemptAutoLogin } = await import("./autoLogin");

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("attemptAutoLogin", () => {
  it("returns false and does nothing when no autologin param is present", async () => {
    const result = await attemptAutoLogin("");
    expect(result).toBe(false);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("decodes the param, signs in, and persists the hash", async () => {
    const creds = { username: "u", password: "p" };
    const hash = btoa(JSON.stringify(creds));
    const result = await attemptAutoLogin(`?autologin=${hash}`);
    expect(result).toBe(true);
    expect(mockSignIn).toHaveBeenCalledWith(creds);
    expect(localStorage.getItem("autologin")).toBe(hash);
  });

  it("returns false when the stored hash is not valid base64 json", async () => {
    localStorage.setItem("autologin", "not-valid");
    const result = await attemptAutoLogin("");
    expect(result).toBe(false);
  });
});
