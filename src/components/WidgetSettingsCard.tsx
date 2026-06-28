import {
  Card,
  Heading,
  SelectField,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { useState } from "react";
import { WidgetsBridgePlugin } from "capacitor-widgetsbridge-plugin";
import Countdown from "./Countdown";
import { CountdownEntity } from "../entities";
import {
  WIDGET_OVERRIDE_COUNTDOWN_ID_KEY,
  WIDGET_PREFERENCES_GROUP,
} from "../helpers/countdownSync";

const localStorageWidgetCountdownIdKey = "widgetCountdownId";

export default function WidgetSettingsCard(props: {
  countdowns: CountdownEntity[];
}) {
  const { tokens } = useTheme();
  const [updateCount, setUpdateCount] = useState(0);
  void updateCount;

  const widgetCountdownId = localStorage.getItem(
    localStorageWidgetCountdownIdKey,
  );
  const selectedWidgetCountdown =
    props.countdowns.find((c) => c.id === widgetCountdownId) ??
    props.countdowns[0];

  const handleUpdateWidget = async (countdown: CountdownEntity) => {
    localStorage.setItem(localStorageWidgetCountdownIdKey, countdown.id!);
    await WidgetsBridgePlugin.setItem({
      group: WIDGET_PREFERENCES_GROUP,
      key: WIDGET_OVERRIDE_COUNTDOWN_ID_KEY,
      value: countdown.id!,
    });
    setUpdateCount((n) => n + 1);
  };

  return (
    <Card
      variation="elevated"
      borderRadius={tokens.radii.large}
      marginBottom={tokens.space.medium}
    >
      <Heading level={5}>Widget Settings</Heading>
      <Text>Widget Preview:</Text>
      {props.countdowns.length ? (
        <Countdown
          countdown={selectedWidgetCountdown}
          setCreateCountdown={() => {}}
          setSelectedCountdown={() => {}}
          deleteCountdown={() => {}}
        />
      ) : (
        <Text>No countdowns found</Text>
      )}
      <SelectField
        label="Update Widget Countdown"
        descriptiveText="The countdown to appear on Home Screen widget"
        onChange={(e) =>
          handleUpdateWidget(
            props.countdowns.find((c) => c.id == e.target.value)!,
          )
        }
      >
        {props.countdowns.map((countdown) => (
          <option key={countdown.id} value={countdown.id}>
            {countdown.title}
          </option>
        ))}
      </SelectField>
    </Card>
  );
}
