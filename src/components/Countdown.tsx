import { Button, Flex, Text, useTheme, View } from "@aws-amplify/ui-react";
import { CountdownEntity } from "../entities";
import { formatDistanceToNowStrict } from "date-fns";
import { Delete } from "@mui/icons-material";

export default function Countdown(props: {
  countdown: CountdownEntity;
  setCreateCountdown(val: boolean): void;
  setSelectedCountdown(val: CountdownEntity): void;
  deleteCountdown: (countdown: CountdownEntity) => void;
}) {
  const { tokens } = useTheme();

  const onDeleteCountdownClick = async (countdown: CountdownEntity) => {
    await props.deleteCountdown(countdown);
  };

  const countdownDate = new Date(props.countdown.date);
  const isToday = countdownDate.toDateString() === new Date().toDateString();
  const formattedDateString = isToday
    ? "today"
    : formatDistanceToNowStrict(countdownDate, {
        addSuffix: true,
        roundingMethod: "round",
        unit: "day",
      });

  return (
    <>
      <Flex
        key={props.countdown.id}
        margin={tokens.space.small}
        backgroundColor={props.countdown.hexColor}
        borderRadius={tokens.radii.xl}
        justifyContent={"space-between"}
        alignItems={"center"}
        textAlign={"center"}
        padding={tokens.space.medium}
        onClick={() => {
          props.setSelectedCountdown(props.countdown);
          props.setCreateCountdown(true);
        }}
      >
        <Text fontSize={tokens.fontSizes.xxxxl} as="span">
          {props.countdown.emoji}
        </Text>
        <View>
          <Text
            fontSize={tokens.fontSizes.xxl}
            color={tokens.colors.overlay[70]}
          >
            {props.countdown.title}
          </Text>
          <Text
            fontSize={tokens.fontSizes.medium}
            textAlign={"center"}
            color={tokens.colors.overlay[50]}
          >
            {formattedDateString}
          </Text>
        </View>
        <View>
          <Button
            variation="link"
            color={tokens.colors.overlay[50]}
            onClick={() => onDeleteCountdownClick(props.countdown)}
          >
            <Delete />
          </Button>
        </View>
      </Flex>
    </>
  );
}
