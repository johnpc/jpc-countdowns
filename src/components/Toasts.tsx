import { useEffect, useState } from "react";
import { Button, Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { dismissToast, subscribeToToasts, Toast } from "../helpers/toast";

/** Fixed-position stack of transient toasts (errors, undo prompts). */
export default function Toasts() {
  const { tokens } = useTheme();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToToasts(setToasts), []);

  if (!toasts.length) return null;

  return (
    <Flex
      direction="column"
      gap={tokens.space.xs}
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        left: "16px",
        right: "16px",
        zIndex: 1000,
      }}
    >
      {toasts.map((toast) => (
        <Flex
          key={toast.id}
          role="status"
          alignItems="center"
          justifyContent="space-between"
          backgroundColor={
            toast.variation === "error"
              ? tokens.colors.red[60]
              : tokens.colors.background.secondary
          }
          style={{ border: "1px solid rgba(255,255,255,0.2)" }}
          borderRadius={tokens.radii.large}
          padding={`${tokens.space.small} ${tokens.space.medium}`}
          boxShadow="0 4px 12px rgba(0,0,0,0.4)"
        >
          <Text color={tokens.colors.white}>{toast.message}</Text>
          {toast.actionLabel && (
            <Button
              size="small"
              variation="link"
              color={tokens.colors.white}
              fontWeight="bold"
              onClick={() => {
                toast.onAction?.();
                dismissToast(toast.id);
              }}
            >
              {toast.actionLabel}
            </Button>
          )}
        </Flex>
      ))}
    </Flex>
  );
}
