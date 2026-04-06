import { API_URL } from "@/constants/api";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { useUser } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export const useNotificationObserver = (isLoaded: boolean) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { push } = useRouter();
  const { user } = useUser();

  const sendPushToken = useCallback(
    async (token: string) => {
      const url = `${API_URL}/pushToken`;
      try {
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            token,
            userId: user?.id,
          }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => {
        setExpoPushToken(token);
        sendPushToken(token);
      },
      (error) => setError(error),
    );

    if (!isLoaded) return;

    const redirect = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.mealId;
      if (typeof url === "string") {
        push({ pathname: "/recipe/[id]", params: { id: url } });
      }
    };

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [push, sendPushToken, isLoaded]);

  return {
    expoPushToken,
    error,
  };
};
