import {
  Heading,
  Image,
  Link,
  View,
  useTheme,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import Countdowns from "./components/Countdowns";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { useEffect } from "react";
import { signIn } from "aws-amplify/auth";
import { Capacitor } from "@capacitor/core";
import { Hub } from "aws-amplify/utils";
Hub.listen("auth", ({ payload }) => {
  switch (payload.event) {
    case "signedIn":
      console.log(
        "user have been signedIn successfully.",
        JSON.stringify({ payload }, null, 2)
      );
      break;
    case "signedOut":
      console.log("user have been signedOut successfully.", { payload });
      break;
    case "tokenRefresh":
      console.log("auth tokens have been refreshed.");
      break;
    case "tokenRefresh_failure":
      console.log("failure while refreshing auth tokens.");
      break;
    case "signInWithRedirect":
      console.log("signInWithRedirect API has successfully been resolved.");
      break;
    case "signInWithRedirect_failure":
      console.log("failure while trying to resolve signInWithRedirect API.");
      break;
    case "customOAuthState":
      console.info("custom state returned from CognitoHosted UI");
      break;
  }
});
function App() {
  return (
    <>
      <Header />
      <Countdowns />
      <Footer />
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default withAuthenticator(App, {
  components: {
    Header() {
      useEffect(() => {
        const autoLoginCacheKey = "autologin";
        const setup = async () => {
          const urlSearchString = window.location.search;
          const params = new URLSearchParams(urlSearchString);
          if (params.get(autoLoginCacheKey)) {
            localStorage.setItem(
              autoLoginCacheKey,
              params.get(autoLoginCacheKey)!
            );
          }
          const hash =
            params.get(autoLoginCacheKey) ||
            localStorage.getItem(autoLoginCacheKey);
          if (!hash) {
            return;
          }
          try {
            const decodedStringAtoB = atob(hash);
            console.log({ decodedStringAtoB });
            const signInJson = JSON.parse(decodedStringAtoB);
            console.log({ signInJson });
            const signInResponse = await signIn(signInJson);
            console.log({ signInResponse });
            window.location.href = "/";
          } catch (e) {
            console.error("Not signing in");
            console.error(e);
          }
        };
        setup();
      });

      const { tokens } = useTheme();
      return (
        <View textAlign="center" backgroundColor={"#9b59b6"} padding={"15px"}>
          <Image
            alt="logo"
            borderRadius={tokens.radii.xl}
            width={"100px"}
            src="/maskable.png"
          />
          <Heading
            fontSize={tokens.fontSizes.xl}
            color={tokens.colors.primary[90]}
          >
            jpc.countdowns
          </Heading>
        </View>
      );
    },
    Footer: () => (
      <div
        style={{
          textAlign: "center",
        }}
      >
        {Capacitor.getPlatform() === "ios" ? null : (
          <Link
            href="https://apps.apple.com/us/app/jpc-countdown/id6689494969"
            style={{
              color: "white",
            }}
          >
            Download the app for iOS devices
          </Link>
        )}
      </div>
    ),
  },
});
