import { API_URL } from "@/constants/api";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { useUser } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUser();

  const sendPushToken = async (token: string) => {
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

      const result = await response.json();
      console.log("result", result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => {
        setExpoPushToken(token);
        sendPushToken(token);
      },
      (error) => setError(error),
    );

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received while app is running", notification);
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: user interacts with a notification (for example, taps on it)",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2),
        );
        // Handle the notification response here
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
