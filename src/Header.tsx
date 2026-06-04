import {
  Card,
  View,
  Heading,
  Flex,
  Text,
  Button,
  useTheme,
} from "@aws-amplify/ui-react";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import { useColorMode } from "./ThemeContext";

export const Header = () => {
  const { tokens } = useTheme();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      paddingBottom={tokens.space.small}
      width={"100%"}
      textAlign={"center"}
    >
      <Card borderRadius={tokens.radii.large}>
        <Flex direction="row" alignItems="flex-start">
          <Flex
            direction="column"
            alignItems="flex-start"
            gap={tokens.space.xs}
          >
            <Heading color={tokens.colors.background.quaternary} level={5}>
              jpc.countdowns
            </Heading>
            <Text
              color={tokens.colors.background.quaternary}
              as="span"
              fontSize={"small"}
            >
              Keep track of what's coming up
            </Text>
          </Flex>
          <Button
            onClick={toggleColorMode}
            variation="link"
            aria-label="Toggle color mode"
            style={{ marginLeft: "auto" }}
          >
            {colorMode === "dark" ? (
              <LightMode fontSize="small" />
            ) : (
              <DarkMode fontSize="small" />
            )}
          </Button>
        </Flex>
      </Card>
    </View>
  );
};
