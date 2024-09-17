import { useEffect, useState } from "react";
import CreateCountdown from "./CreateCountdown";
import Settings from "./Settings";
import {
  CountdownEntity,
  createCountdownListener,
  deleteCountdownListener,
  listCountdowns,
  unsubscribeListener,
  deleteCountdown,
} from "../entities";
import {
  Button,
  Divider,
  Flex,
  Text,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import { formatDistanceToNow } from "date-fns";
import { Delete, Add, Settings as SettingsIcon } from "@mui/icons-material";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { App as CapacitorApp } from "@capacitor/app";
import { WidgetsBridgePlugin } from "capacitor-widgetsbridge-plugin";

const WIDGET_PREFERENCES_GROUP = "group.com.johncorser.countdowns.prefs";
const PREFERENCES_KEY = "countdownEntities";

const setWidgetPreferences = async (entities: CountdownEntity[]) => {
  await WidgetsBridgePlugin.setItem({
    group: WIDGET_PREFERENCES_GROUP,
    key: PREFERENCES_KEY,
    value: JSON.stringify(entities),
  });
  await WidgetsBridgePlugin.reloadAllTimelines();
};

export default function Countdowns() {
  const { tokens } = useTheme();
  const [createCountdown, setCreateCountdown] = useState<boolean>(false);
  const [settings, setSettings] = useState<boolean>(false);
  const [countdowns, setCountdowns] = useState<CountdownEntity[]>([]);
  const [tick, setTick] = useState<number>(0);
  const [user, setUser] = useState<AuthUser>();

  useEffect(() => {
    const fetchCountdowns = async () => {
      const c = await listCountdowns();
      const u = await getCurrentUser();
      setUser(u);
      setCountdowns(c);
      setWidgetPreferences(c);
    };

    fetchCountdowns();
  }, []);

  useEffect(() => {
    // Every minute, reattach listeners
    const tickInterval = 1000 * 60;
    const interval = setInterval(() => setTick(() => tick + 1), tickInterval);
    const createCountdownSubscription = createCountdownListener((countdown) => {
      const updatedCountdowns = [...countdowns, countdown];
      updatedCountdowns.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setCountdowns(updatedCountdowns);
      setWidgetPreferences(updatedCountdowns);
    });
    const deleteCountdownSubscription = deleteCountdownListener((countdown) => {
      const updatedCountdowns = countdowns.filter((c) => c.id !== countdown.id);
      setCountdowns(updatedCountdowns);
      setWidgetPreferences(updatedCountdowns);
    });
    CapacitorApp.addListener("appStateChange", async ({ isActive }) => {
      WidgetsBridgePlugin.reloadAllTimelines();
      if (isActive) {
        setTick(() => tick + 1);
      }
    });
    return () => {
      unsubscribeListener(createCountdownSubscription);
      unsubscribeListener(deleteCountdownSubscription);
      clearInterval(interval);
      CapacitorApp.removeAllListeners();
    };
  }, [countdowns, tick]);

  if (createCountdown) {
    return <CreateCountdown onCreated={() => setCreateCountdown(false)} />;
  }

  if (settings && user) {
    return <Settings user={user} onFinished={() => setSettings(false)} />;
  }

  const onCreateCountdownClick = async () => {
    setCreateCountdown(true);
  };

  const onDeleteCountdownClick = async (countdown: CountdownEntity) => {
    await deleteCountdown(countdown);
  };

  countdowns.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <>
      {countdowns
        .filter((c) => new Date(c.date).getTime() > new Date().getTime())
        .map((c) => (
          <Flex
            key={c.id}
            margin={tokens.space.small}
            backgroundColor={c.hexColor}
            borderRadius={tokens.radii.xl}
            justifyContent={"space-between"}
            alignItems={"center"}
            padding={tokens.space.medium}
          >
            <Text fontSize={tokens.fontSizes.xxxxl} as="span">
              {c.emoji}
            </Text>
            <View>
              <Text
                fontSize={tokens.fontSizes.xxl}
                color={tokens.colors.overlay[70]}
              >
                {c.title}
              </Text>
              <Text
                fontSize={tokens.fontSizes.medium}
                textAlign={"center"}
                color={tokens.colors.overlay[50]}
              >
                {formatDistanceToNow(new Date(c.date))}
              </Text>
            </View>
            <View>
              <Button
                variation="link"
                color={tokens.colors.overlay[50]}
                onClick={() => onDeleteCountdownClick(c)}
              >
                <Delete />
              </Button>
            </View>
          </Flex>
        ))}
      <Divider
        marginBottom={tokens.space.medium}
        paddingBottom={tokens.space.medium}
      />
      <Button isFullWidth variation="primary" onClick={onCreateCountdownClick}>
        Create Countdown <Add />
      </Button>
      <Divider
        marginBottom={tokens.space.medium}
        paddingBottom={tokens.space.medium}
      />
      <Button
        color={tokens.colors.background.quaternary}
        isFullWidth
        onClick={() => setSettings(true)}
      >
        Settings <SettingsIcon />
      </Button>
    </>
  );
}
