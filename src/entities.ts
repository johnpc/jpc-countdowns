import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { Subscription } from "rxjs";

const client = generateClient<Schema>();

export type CountdownEntity = {
  id?: string;
  emoji: string;
  title: string;
  date: string;
  hexColor: string;
};

export const listCountdowns = async (): Promise<CountdownEntity[]> => {
  console.log({ models: client.models });
  const { data: countdowns, errors } = await client.models.Countdown.list({
    limit: 10000,
  });
  if (errors) throw new Error(errors.map((e) => e.message).join("\n"));
  return countdowns.map((c) => ({
    id: c.id,
    emoji: c.emoji,
    title: c.title,
    date: c.date,
    hexColor: c.hexColor,
  }));
};

export const createCountdown = async (
  countdown: CountdownEntity
): Promise<CountdownEntity> => {
  const { data: newCountdown, errors } = await client.models.Countdown.create({
    ...countdown,
  });
  if (errors) throw new Error(errors.map((e) => e.message).join("\n"));
  return newCountdown!;
};

export const updateCountdown = async (
  countdown: CountdownEntity
): Promise<CountdownEntity | undefined> => {
  if (!countdown.id) {
    console.log(`Cannot update countdown without id`, { countdown });
    return;
  }
  const { data: newCountdown, errors } = await client.models.Countdown.update({
    id: countdown.id!,
    ...countdown,
  });
  if (errors) throw new Error(errors.map((e) => e.message).join("\n"));
  return newCountdown!;
};

export const deleteCountdown = async (
  countdown: CountdownEntity
): Promise<void> => {
  if (!countdown.id) {
    return;
  }

  const { errors } = await client.models.Countdown.delete({ id: countdown.id });
  if (errors) throw new Error(errors.map((e) => e.message).join("\n"));
};

export const createCountdownListener = (
  fn: (countdownItem: CountdownEntity) => void
) => {
  const listener = client.models.Countdown.onCreate().subscribe({
    next: async (countdown: Schema["Countdown"]["type"]) => {
      fn(countdown);
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const updateCountdownListener = (
  fn: (countdownItem: CountdownEntity) => void
) => {
  const listener = client.models.Countdown.onUpdate().subscribe({
    next: async (countdown: Schema["Countdown"]["type"]) => {
      fn(countdown);
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const deleteCountdownListener = (
  fn: (countdownItem: CountdownEntity) => void
) => {
  const listener = client.models.Countdown.onDelete().subscribe({
    next: async (countdown: Schema["Countdown"]["type"]) => {
      fn(countdown);
    },
    error: (error: Error) => {
      console.error("Subscription error", error);
    },
  });
  return listener;
};

export const unsubscribeListener = (subscription: Subscription) => {
  return subscription.unsubscribe();
};
