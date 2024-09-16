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
import { Button, Divider, Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { formatDistanceToNow } from "date-fns";
import { Delete, Add, Settings as SettingsIcon } from "@mui/icons-material";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";

export default function Countdowns() {
  const { tokens } = useTheme();
  const [createCountdown, setCreateCountdown] = useState<boolean>(false);
  const [settings, setSettings] = useState<boolean>(false);
  const [countdowns, setCountdowns] = useState<CountdownEntity[]>([]);
  const [user, setUser] = useState<AuthUser>();
  console.log("colors:", tokens.colors);
  useEffect(() => {
    const fetchCountdowns = async () => {
      const c = await listCountdowns();
      const u = await getCurrentUser();
      setUser(u);
      setCountdowns(c);
    };

    fetchCountdowns();
  }, []);

  useEffect(() => {
    const createCountdownSubscription = createCountdownListener((countdown) => {
      setCountdowns([...countdowns, countdown]);
    });
    const deleteCountdownSubscription = deleteCountdownListener((countdown) => {
      setCountdowns(countdowns.filter((c) => c.id !== countdown.id));
    });
    return () => {
      unsubscribeListener(createCountdownSubscription);
      unsubscribeListener(deleteCountdownSubscription);
    };
  }, [countdowns]);

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

  return (
    <>
      {countdowns.map((c) => (
        <Flex
          key={c.id}
          margin={tokens.space.small}
          backgroundColor={c.hexColor}
          borderRadius={tokens.radii.xl}
          justifyContent={"space-evenly"}
          alignItems={"center"}
          padding={tokens.space.medium}
        >
          <Text fontSize={tokens.fontSizes.xxxxl} as="span">
            {c.emoji}
          </Text>
          <Text
            as="span"
            fontSize={tokens.fontSizes.xxl}
            color={tokens.colors.white}
            fontFamily={"fantasy"}
          >
            {c.title}
          </Text>
          <Text
            as="span"
            fontSize={tokens.fontSizes.medium}
            textAlign={"right"}
            color={tokens.colors.white}
          >
            {formatDistanceToNow(new Date(c.date))}
          </Text>
          <Button onClick={() => onDeleteCountdownClick(c)}>
            <Delete />
          </Button>
        </Flex>
      ))}
      <Divider margin={tokens.space.medium} padding={tokens.space.medium} />
      <Button isFullWidth variation="primary" onClick={onCreateCountdownClick}>
        Create Countdown <Add />
      </Button>
      <Divider margin={tokens.space.medium} padding={tokens.space.medium} />
      <Button isFullWidth onClick={() => setSettings(true)}>
        Settings <SettingsIcon />
      </Button>
    </>
  );
}
