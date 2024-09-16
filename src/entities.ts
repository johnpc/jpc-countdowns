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
  const { data: countdowns, errors } = await client.models.Countdown.list();
  if (errors) throw new Error(errors.map((e) => e.message).join("\n"));
  return countdowns;
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
