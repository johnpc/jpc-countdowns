import { useState } from "react";
import CreateCountdown from "./CreateCountdown";
import ListState from "./ListState";
import Settings from "./Settings";
import Toasts from "./Toasts";
import { CountdownEntity } from "../entities";
import { useCountdowns } from "../helpers/useCountdowns";
import { Button, Divider, useTheme } from "@aws-amplify/ui-react";
import { Add, Settings as SettingsIcon } from "@mui/icons-material";
import Countdown from "./Countdown";

export default function Countdowns() {
  const { tokens } = useTheme();
  const {
    countdowns,
    loaded,
    loadFailed,
    retry,
    user,
    addCountdown,
    editCountdown,
    removeCountdown,
  } = useCountdowns();
  const [selectedCountdown, setSelectedCountdown] = useState<CountdownEntity>();
  const [createCountdown, setCreateCountdown] = useState(false);
  const [settings, setSettings] = useState(false);

  if (createCountdown) {
    return (
      <CreateCountdown
        existingCountdown={selectedCountdown}
        save={addCountdown}
        update={editCountdown}
        onDone={() => {
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
      <ListState
        loading={!loaded && !countdowns.length && !loadFailed}
        error={loadFailed && !countdowns.length}
        empty={!countdowns.length}
        onRetry={retry}
      >
        {countdowns.map((c) => (
          <Countdown
            key={c.id}
            countdown={c}
            setCreateCountdown={setCreateCountdown}
            setSelectedCountdown={setSelectedCountdown}
            deleteCountdown={removeCountdown}
          />
        ))}
      </ListState>
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
      <Toasts />
    </>
  );
}
