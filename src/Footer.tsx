import {
  Card,
  Image,
  View,
  Heading,
  Flex,
  Button,
  useTheme,
  Text,
} from "@aws-amplify/ui-react";
import { Capacitor } from "@capacitor/core";

export const Footer = () => {
  const { tokens } = useTheme();
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      paddingTop={tokens.space.medium}
    >
      <Card borderRadius={tokens.radii.large}>
        {Capacitor.getPlatform() === "ios" ? (
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            alignContent="flex-start"
          >
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="flex-start"
              alignContent="flex-start"
              gap={tokens.space.xs}
            >
              <Flex
                as="span"
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                alignContent="flex-start"
                gap={tokens.space.xs}
              >
                <Button
                  variation="primary"
                  as="a"
                  href="https://github.com/johnpc/jpc-countdowns"
                >
                  <Image alt="github" src="/github.png" />
                </Button>
                <Text as="span">jpc.countdowns is open source.</Text>
              </Flex>
            </Flex>
          </Flex>
        ) : (
          <Flex direction="row" alignItems="flex-start">
            <Flex
              direction="column"
              alignItems="flex-start"
              gap={tokens.space.xs}
            >
              <Heading color={tokens.colors.background.quaternary} level={6}>
                countdowns.jpc.io is free to use, but our hosting costs are not—
                donations are what keep us alive, free from ads, and fast.
              </Heading>
              <Flex
                direction="row"
                alignItems="flex-start"
                gap={tokens.space.xs}
              >
                <Button
                  variation="primary"
                  as="a"
                  href="bitcoin:bc1q5k3w6cn9sd263hyv8eamvwrnzm0l6slcn49xd0?label=countdowns.jpc.io&message=Hosting%20Costs"
                >
                  <Image alt="bitcoin" src="/bitcoin.png" />
                </Button>
                <Button
                  variation="primary"
                  as="a"
                  href="https://www.paypal.com/donate/?hosted_button_id=3T9XCAW5J5FSL"
                >
                  <Image alt="paypal" src="/paypal.png" />
                </Button>
                <Button
                  as="a"
                  variation="primary"
                  href="https://github.com/johnpc/jpc-countdowns"
                >
                  <Image alt="github" src="/github.png" />
                </Button>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Card>
    </View>
  );
};
