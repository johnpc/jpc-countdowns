import {
  Card,
  View,
  Heading,
  Flex,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";

export const Header = () => {
  const { tokens } = useTheme();
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      padding={tokens.space.small}
      width={"100%"}
      textAlign={"center"}
    >
      <Card>
        <Flex direction="row" alignItems="flex-start">
          <Flex
            direction="column"
            alignItems="flex-start"
            gap={tokens.space.xs}
          >
            <Heading level={5}>jpc.countdowns</Heading>
            <Text as="span" fontSize={"small"}>
              Keep track of what's coming up
            </Text>
          </Flex>
        </Flex>
      </Card>
    </View>
  );
};