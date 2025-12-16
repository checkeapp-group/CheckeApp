"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import AuthModal from "@/components/Auth/auth-modal";

type AuthModalContextType = {
  openAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

// Context provider managing auth modal visibility state globally
export const AuthModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

    // Opens the authentication modal dialog
  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
    </AuthModalContext.Provider>
  );
};

// Hook to access auth modal controls from any component
export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
