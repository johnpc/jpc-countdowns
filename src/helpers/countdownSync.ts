import { CountdownEntity } from "../entities";
import { WidgetsBridgePlugin } from "capacitor-widgetsbridge-plugin";

export const WIDGET_PREFERENCES_GROUP = "group.com.johncorser.countdowns.prefs";
export const PREFERENCES_KEY = "countdownEntities";
export const WIDGET_OVERRIDE_COUNTDOWN_ID_KEY = "widgetOverrideCountdownId";

/** Sort ascending by date, then drop anything already in the past. */
export const sortAndFilterFuture = (
  countdowns: CountdownEntity[],
): CountdownEntity[] => {
  const now = new Date().getTime();
  return [...countdowns]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((c) => new Date(c.date).getTime() > now);
};

export const setWidgetPreferences = async (entities: CountdownEntity[]) => {
  await WidgetsBridgePlugin.setItem({
    group: WIDGET_PREFERENCES_GROUP,
    key: PREFERENCES_KEY,
    value: JSON.stringify(entities),
  });
  await WidgetsBridgePlugin.reloadAllTimelines();
};

/**
 * Normalize a countdown list to the canonical future-sorted form, mirror it to
 * localStorage + the home-screen widget, and hand it back for setState.
 */
export const persistCountdowns = (
  countdowns: CountdownEntity[],
): CountdownEntity[] => {
  const filtered = sortAndFilterFuture(countdowns);
  localStorage.setItem("countdowns", JSON.stringify(filtered));
  setWidgetPreferences(filtered);
  return filtered;
};
