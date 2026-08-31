import { useCallback, useEffect, useState } from "react";
import {
  CountdownEntity,
  createCountdownListener,
  deleteCountdownListener,
  listCountdowns,
  unsubscribeListener,
  updateCountdownListener,
} from "../entities";
import { persistCountdowns, reloadWidgetTimelines } from "./countdownSync";
import { useCountdownMutations } from "./useCountdownMutations";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { App as CapacitorApp } from "@capacitor/app";

const readCached = (): CountdownEntity[] => {
  const cached = localStorage.getItem("countdowns");
  return cached ? JSON.parse(cached) : [];
};

/**
 * Owns the countdown list: initial load (with error + retry), optimistic
 * mutations, realtime create/update/delete subscriptions (subscribed exactly
 * once — they are the reconciliation layer for the optimistic writes), a
 * per-minute tick to re-evaluate "future", and widget reloads on app
 * foreground. Every change flows through persistCountdowns so the cache +
 * home-screen widget stay in sync.
 */
export const useCountdowns = () => {
  const [countdowns, setCountdowns] = useState<CountdownEntity[]>(readCached);
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [user, setUser] = useState<AuthUser>();
  const mutations = useCountdownMutations(setCountdowns);

  // Re-filter so a countdown disappears (and "in N days" re-renders) the
  // minute it passes — persistCountdowns returns a fresh array, so React
  // re-renders, and localStorage + the widget drop the passed row too.
  const refreshNow = useCallback(
    () => setCountdowns((list) => persistCountdowns(list)),
    [],
  );

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const [c, u] = await Promise.all([listCountdowns(), getCurrentUser()]);
      setCountdowns(persistCountdowns(c));
      setUser(u);
      setLoaded(true);
    } catch {
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = setInterval(refreshNow, 1000 * 60);
    return () => clearInterval(interval);
  }, [refreshNow]);

  useEffect(() => {
    const upsert = (c: CountdownEntity) =>
      setCountdowns((list) =>
        persistCountdowns([...list.filter((x) => x.id !== c.id), c]),
      );
    const createSub = createCountdownListener(upsert);
    const updateSub = updateCountdownListener(upsert);
    const deleteSub = deleteCountdownListener((c) =>
      setCountdowns((list) =>
        persistCountdowns(list.filter((x) => x.id !== c.id)),
      ),
    );
    const appListener = CapacitorApp.addListener(
      "appStateChange",
      ({ isActive }) => {
        if (isActive) {
          reloadWidgetTimelines();
          refreshNow();
        }
      },
    );
    return () => {
      unsubscribeListener(createSub);
      unsubscribeListener(updateSub);
      unsubscribeListener(deleteSub);
      Promise.resolve(appListener).then((l) => l.remove());
    };
  }, [refreshNow]);

  return { countdowns, loaded, loadFailed, retry: load, user, ...mutations };
};
