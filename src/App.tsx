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
