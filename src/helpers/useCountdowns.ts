import { useEffect, useState } from "react";
import {
  CountdownEntity,
  createCountdownListener,
  deleteCountdownListener,
  listCountdowns,
  unsubscribeListener,
  updateCountdownListener,
} from "../entities";
import { persistCountdowns } from "./countdownSync";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { App as CapacitorApp } from "@capacitor/app";
import { WidgetsBridgePlugin } from "capacitor-widgetsbridge-plugin";

const readCached = (): CountdownEntity[] => {
  const cached = localStorage.getItem("countdowns");
  return cached ? JSON.parse(cached) : [];
};

/**
 * Owns the countdown list: initial load, realtime create/update/delete
 * subscriptions, a per-minute tick to re-evaluate "future", and widget reloads
 * on app foreground. Every mutation flows through persistCountdowns so the
 * cache + home-screen widget stay in sync.
 */
export const useCountdowns = () => {
  const [countdowns, setCountdowns] = useState<CountdownEntity[]>(readCached);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<AuthUser>();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const [c, u] = await Promise.all([listCountdowns(), getCurrentUser()]);
      setCountdowns(persistCountdowns(c));
      setUser(u);
      setLoaded(true);
    };
    fetch();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000 * 60);
    const createSub = createCountdownListener((c) =>
      setCountdowns(persistCountdowns([...countdowns, c])),
    );
    const updateSub = updateCountdownListener((c) =>
      setCountdowns(
        persistCountdowns([...countdowns.filter((x) => x.id !== c.id), c]),
      ),
    );
    const deleteSub = deleteCountdownListener((c) =>
      setCountdowns(persistCountdowns(countdowns.filter((x) => x.id !== c.id))),
    );
    CapacitorApp.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        WidgetsBridgePlugin.reloadAllTimelines();
        setTick((t) => t + 1);
      }
    });
    return () => {
      unsubscribeListener(createSub);
      unsubscribeListener(updateSub);
      unsubscribeListener(deleteSub);
      clearInterval(interval);
      CapacitorApp.removeAllListeners();
    };
  }, [countdowns, tick]);

  return { countdowns, loaded, user };
};
