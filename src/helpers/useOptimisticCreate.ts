import { useRef } from "react";
import { CountdownEntity, createCountdown } from "../entities";
import { showToast } from "./toast";

const isTemp = (id?: string) => Boolean(id?.startsWith("optimistic-"));

export type ApplyList = (
  fn: (list: CountdownEntity[]) => CountdownEntity[],
) => void;

/**
 * Optimistic create: inserts a temp `optimistic-<n>` row at tap time, swaps
 * in the server id when the write lands, rolls back + toasts on failure.
 * `realId` lets follow-up edits/deletes of a still-temp row chain on the
 * pending create so they reach the server with the REAL id.
 */
export const useOptimisticCreate = (apply: ApplyList) => {
  const tempSeq = useRef(0);
  const pendingCreates = useRef(new Map<string, Promise<CountdownEntity>>());

  /** Resolve a possibly-temp id to the server id (undefined if its create failed). */
  const realId = async (id: string): Promise<string | undefined> =>
    isTemp(id)
      ? (await pendingCreates.current.get(id)?.catch(() => undefined))?.id
      : id;

  const addCountdown = (draft: Omit<CountdownEntity, "id">) => {
    const tempId = `optimistic-${++tempSeq.current}`;
    apply((list) => [...list, { ...draft, id: tempId }]);
    const pending = createCountdown(draft);
    pendingCreates.current.set(tempId, pending);
    pending
      .then((created) =>
        // Swap the temp row (keeping any local edits made meanwhile) for the
        // server id. The onCreate subscription may have already delivered the
        // row — drop both ids first so we never dupe. If the temp row is gone
        // the user deleted it; removeCountdown's chain cleans up the server.
        apply((list) => {
          const local = list.find((c) => c.id === tempId);
          const rest = list.filter(
            (c) => c.id !== tempId && c.id !== created.id,
          );
          return local ? [...rest, { ...local, id: created.id }] : rest;
        }),
      )
      .catch(() => {
        apply((list) => list.filter((c) => c.id !== tempId));
        showToast(`Couldn't save "${draft.title}" — try again.`, {
          variation: "error",
        });
      });
  };

  return { addCountdown, realId };
};
