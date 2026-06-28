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
import { Capacitor } from "@capacitor/core";
import { Hub } from "aws-amplify/utils";
import { attemptAutoLogin } from "./helpers/autoLogin";

Hub.listen("auth", ({ payload }) => {
  console.log(`auth event: ${payload.event}`);
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
        attemptAutoLogin();
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
      <div style={{ textAlign: "center" }}>
        {Capacitor.getPlatform() === "ios" ? null : (
          <Link
            href="https://apps.apple.com/us/app/jpc-countdown/id6689494969"
            style={{ color: "white" }}
          >
            Download the app for iOS devices
          </Link>
        )}
      </div>
    ),
  },
});
