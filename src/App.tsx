import {
  Heading,
  Image,
  View,
  useTheme,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import Countdowns from "./components/Countdowns";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { useEffect } from "react";
import { signIn } from "aws-amplify/auth";

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
        const setup = async () => {
          const urlSearchString = window.location.search;
          const params = new URLSearchParams(urlSearchString);
          const hash = params.get("autologin");
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
      }, []);

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
  },
});
