import { lazy, Suspense } from "react";
import { Button, Label, Loader, Text, useTheme } from "@aws-amplify/ui-react";

const EmojiPicker = lazy(() => import("./EmojiPicker"));

/** The emoji form field: shows the picker until one is chosen, then a
 * "Change Emoji" button that reopens it. The picker itself is lazy-loaded —
 * it's by far the heaviest dependency in the app. */
export default function EmojiField(props: {
  emoji?: string;
  showSelector: boolean;
  onOpenSelector: () => void;
  onSelect: (native: string) => void;
}) {
  const { tokens } = useTheme();
  return (
    <>
      <Label>Emoji</Label>
      <Text>
        {props.emoji ? `You have chosen ${props.emoji}` : "Select an emoji"}
      </Text>
      {props.showSelector ? (
        <Suspense fallback={<Loader size="large" />}>
          <EmojiPicker onSelect={props.onSelect} />
        </Suspense>
      ) : (
        <Button margin={tokens.space.small} onClick={props.onOpenSelector}>
          Change Emoji
        </Button>
      )}
    </>
  );
}
