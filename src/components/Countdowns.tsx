import { useState } from "react";
import CreateCountdown from "./CreateCountdown";
import Settings from "./Settings";
import { CountdownEntity, deleteCountdown } from "../entities";
import { sortAndFilterFuture } from "../helpers/countdownSync";
import { useCountdowns } from "../helpers/useCountdowns";
import { Button, Divider, Loader, useTheme } from "@aws-amplify/ui-react";
import { Add, Settings as SettingsIcon } from "@mui/icons-material";
import Countdown from "./Countdown";

export default function Countdowns() {
  const { tokens } = useTheme();
  const { countdowns, loaded, user } = useCountdowns();
  const [selectedCountdown, setSelectedCountdown] = useState<CountdownEntity>();
  const [createCountdown, setCreateCountdown] = useState(false);
  const [settings, setSettings] = useState(false);

  if (createCountdown) {
    return (
      <CreateCountdown
        existingCountdown={selectedCountdown}
        onCreated={() => {
          setCreateCountdown(false);
          setSelectedCountdown(undefined);
        }}
      />
    );
  }

  if (settings && user) {
    return (
      <Settings
        countdowns={countdowns}
        user={user}
        onFinished={() => setSettings(false)}
      />
    );
  }

  const spacedDivider = (
    <Divider
      marginBottom={tokens.space.medium}
      paddingBottom={tokens.space.medium}
    />
  );

  return (
    <>
      {loaded || countdowns.length ? (
        sortAndFilterFuture(countdowns).map((c) => (
          <Countdown
            key={c.id}
            countdown={c}
            setCreateCountdown={setCreateCountdown}
            setSelectedCountdown={setSelectedCountdown}
            deleteCountdown={(countdown) => deleteCountdown(countdown)}
          />
        ))
      ) : (
        <Loader variation="linear" size="large" />
      )}
      {spacedDivider}
      <Button
        isFullWidth
        variation="primary"
        onClick={() => setCreateCountdown(true)}
      >
        Create Countdown <Add />
      </Button>
      {spacedDivider}
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
