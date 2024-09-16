import {
  Card,
  Image,
  View,
  Heading,
  Flex,
  Text,
  Button,
  useTheme,
} from "@aws-amplify/ui-react";

export const Footer = () => {
  const { tokens } = useTheme();
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      padding={tokens.space.medium}
    >
      <Card>
        <Flex direction="row" alignItems="flex-start">
          <Flex
            direction="column"
            alignItems="flex-start"
            gap={tokens.space.xs}
          >
            <Heading level={6}>
              countdowns.jpc.io is free to use, but our hosting costs are not—
              donations are what keep us alive, free from ads, and fast.
            </Heading>
            <Text as="span"></Text>
            <Flex direction="row" alignItems="flex-start" gap={tokens.space.xs}>
              <Button
                as="a"
                href="bitcoin:bc1q5k3w6cn9sd263hyv8eamvwrnzm0l6slcn49xd0?label=countdowns.jpc.io&message=Hosting%20Costs"
              >
                <Image alt="bitcoin" src="/bitcoin.png" />
              </Button>
              <Button
                as="a"
                href="https://www.paypal.com/donate/?hosted_button_id=3T9XCAW5J5FSL"
              >
                <Image alt="paypal" src="/paypal.png" />
              </Button>
              <Button as="a" href="https://github.com/johnpc/jpc-countdowns">
                <Image alt="github" src="/github.png" />
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </View>
  );
};
