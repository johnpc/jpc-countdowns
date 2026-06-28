import { signIn } from "aws-amplify/auth";

const AUTO_LOGIN_CACHE_KEY = "autologin";

/**
 * Reads an `?autologin=<base64 signIn json>` param (persisting it to
 * localStorage so a refresh still works), decodes it, and signs in. No-op when
 * absent. Returns true if a sign-in was attempted.
 */
export const attemptAutoLogin = async (
  search: string = window.location.search,
): Promise<boolean> => {
  const params = new URLSearchParams(search);
  if (params.get(AUTO_LOGIN_CACHE_KEY)) {
    localStorage.setItem(
      AUTO_LOGIN_CACHE_KEY,
      params.get(AUTO_LOGIN_CACHE_KEY)!,
    );
  }
  const hash =
    params.get(AUTO_LOGIN_CACHE_KEY) ||
    localStorage.getItem(AUTO_LOGIN_CACHE_KEY);
  if (!hash) return false;
  try {
    const signInJson = JSON.parse(atob(hash));
    await signIn(signInJson);
    window.location.href = "/";
    return true;
  } catch (e) {
    console.error("Not signing in", e);
    return false;
  }
};
