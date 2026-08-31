import { Dispatch, SetStateAction } from "react";
import { CountdownEntity, deleteCountdown, updateCountdown } from "../entities";
import { persistCountdowns } from "./countdownSync";
import { showToast } from "./toast";
import { useOptimisticCreate } from "./useOptimisticCreate";

type SetList = Dispatch<SetStateAction<CountdownEntity[]>>;

/**
 * Optimistic mutations over the countdown list. Every mutation updates local
 * state (and localStorage + the widget, via persistCountdowns) at tap time;
 * the network write runs in the background and rolls back with an error toast
 * on failure. The AppSync subscriptions reconcile with the server — there is
 * deliberately NO post-write refetch (DynamoDB is eventually consistent; an
 * immediate re-list can miss the row just written).
 */
export const useCountdownMutations = (setCountdowns: SetList) => {
  const apply = (fn: (list: CountdownEntity[]) => CountdownEntity[]) =>
    setCountdowns((list) => persistCountdowns(fn(list)));

  const { addCountdown, realId } = useOptimisticCreate(apply);

  const fail = (message: string) => showToast(message, { variation: "error" });

  const editCountdown = (countdown: CountdownEntity) => {
    let prev: CountdownEntity | undefined;
    apply((list) => {
      prev = list.find((c) => c.id === countdown.id);
      return list.map((c) => (c.id === countdown.id ? countdown : c));
    });
    realId(countdown.id!).then((id) => {
      if (!id) return; // the create failed; its own rollback already ran
      apply((list) =>
        list.map((c) => (c.id === id ? { ...countdown, id } : c)),
      );
      updateCountdown({ ...countdown, id }).catch(() => {
        if (prev) {
          apply((l) => l.map((c) => (c.id === id ? { ...prev!, id } : c)));
        }
        fail(`Couldn't update "${countdown.title}" — try again.`);
      });
    });
  };

  const removeCountdown = (countdown: CountdownEntity) => {
    let undone = false;
    apply((list) => list.filter((c) => c.id !== countdown.id));
    showToast(`Deleted "${countdown.title}"`, {
      actionLabel: "Undo",
      onAction: () => {
        undone = true;
        const { title, emoji, date, hexColor } = countdown;
        addCountdown({ title, emoji, date, hexColor });
      },
    });
    realId(countdown.id!).then((id) => {
      if (!id) return; // never made it to the server; nothing to delete
      apply((list) => list.filter((c) => c.id !== id));
      deleteCountdown({ ...countdown, id }).catch(() => {
        if (undone) return;
        apply((list) => [...list, { ...countdown, id }]);
        fail(`Couldn't delete "${countdown.title}" — try again.`);
      });
    });
  };

  return { addCountdown, editCountdown, removeCountdown };
};
