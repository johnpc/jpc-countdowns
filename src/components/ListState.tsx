import { ReactNode } from "react";
import { Button, Flex, Loader, Text, useTheme } from "@aws-amplify/ui-react";

/**
 * The four outcomes of a fetched list: loading, error (retryable), empty
 * (loaded but nothing to show), and ready (children). Error beats empty.
 */
export default function ListState(props: {
  loading: boolean;
  error: boolean;
  empty: boolean;
  onRetry: () => void;
  children: ReactNode;
}) {
  const { tokens } = useTheme();

  if (props.error) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        padding={tokens.space.large}
        gap={tokens.space.small}
      >
        <Text>Couldn't load your countdowns.</Text>
        <Button variation="primary" onClick={props.onRetry}>
          Try again
        </Button>
      </Flex>
    );
  }

  if (props.loading) {
    return <Loader variation="linear" size="large" />;
  }

  if (props.empty) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        padding={tokens.space.large}
        gap={tokens.space.xs}
      >
        <Text fontSize={tokens.fontSizes.xxxl}>🗓️</Text>
        <Text fontSize={tokens.fontSizes.large}>Nothing coming up yet</Text>
        <Text color={tokens.colors.font.tertiary} textAlign="center">
          Create a countdown to start tracking what's next.
        </Text>
      </Flex>
    );
  }

  return <>{props.children}</>;
}
