import { useAuth } from "@clerk/clerk-expo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { createContext, useCallback, useContext, useRef } from "react";
import AuthBottomSheet from "../components/AuthBottomSheet";

interface AuthGateContextType {
  requireAuth: (callback?: () => void) => boolean;
}

const AuthGateContext = createContext<AuthGateContextType>({
  requireAuth: () => false,
});

export const useAuthGate = (): AuthGateContextType =>
  useContext(AuthGateContext);

export const AuthGateProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const { isSignedIn } = useAuth();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const requireAuth = useCallback(
    (callback?: () => void): boolean => {
      if (isSignedIn) {
        callback?.();
        return true;
      }
      bottomSheetRef.current?.present();
      return false;
    },
    [isSignedIn],
  );

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}
      <AuthBottomSheet ref={bottomSheetRef} />
    </AuthGateContext.Provider>
  );
};
