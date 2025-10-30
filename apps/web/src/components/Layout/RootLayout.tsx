
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import CookieConsentComponent from "@/components/CookieConsent";
import GlobalLoader from "@/components/GlobalLoader";
import UserMenu from "@/components/UserMenu";
import { LanguageSelector } from "@/components/ui/lenguage-selector";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { AuthModalProvider, useAuthModal } from "@/providers/AuthModalProvider";
import { useLoading } from "@/providers/LoadingProvider";
import FactCheckerLogo from "@/public/FactCheckerLogo.webp";
import FooterBanner from "@/public/footer_banner.png";
import TermsAcceptanceModal from "../Auth/terms-acceptance-modal";
import { Button } from "../ui/button";

function AppHeader() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  return (
    <header className="sticky top-0 z-50 w-full border-border border-b bg-white/95 shadow-sm backdrop-blur-sm px-3 lg:px-0">
    <div className="lg:container mx-auto flex h-16 items-center justify-between gap-4">
      <Link className="flex items-center gap-2" href="/">
        <Image
          alt="CheckeApp Logo"
          className="h-auto w-64"
          priority
          src={FactCheckerLogo}
        />
      </Link>

      <div className="flex items-center gap-4">
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            className="rounded-lg p-3 transition-all hover:bg-neutral-200/60 text-neutral-600"
            href="/"
          >
            {t("nav.verify")}
          </Link>
          {isAuthenticated && (
            <>
              <Link
                className="rounded-lg px-2 py-3 transition-all hover:bg-neutral-200/60 text-neutral-600"
                href="/verifications"
              >
                {t("verifications.title")}
              </Link>
              <Link
                className="rounded-lg px-2 py-3 transition-all hover:bg-neutral-200/60 text-nowrap text-neutral-600"
                href="/user-verifications"
              >
                {t("user_verifications.title")}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button onClick={openAuthModal}>
                {t("auth.getStarted")}
              </Button>
            </div>
          )}
          <LanguageSelector />
        </div>
      </div>
    </div>
  </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoading } = useLoading();
  const [showTermsModal, setShowTermsModal] = React.useState(false);

  const searchParams = useSearchParams();
  const LoginModalTrigger = () => {
    const { openAuthModal } = useAuthModal();
    useEffect(() => {
      if (searchParams.get("login") === "true") {
        openAuthModal();
      }
    }, [searchParams, openAuthModal]);
    return null;
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated && user && !user.termsAccepted) {
      setShowTermsModal(true);
    } else {
      setShowTermsModal(false);
    }
  }, [isAuthenticated, user, isAuthLoading]);

  return (
    <AuthModalProvider>
      {isLoading && <GlobalLoader />}
      <Suspense fallback={null}>
        <LoginModalTrigger />
      </Suspense>
      <TermsAcceptanceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <CookieConsentComponent />
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-border border-t bg-card">
          <div className="container py-5 mx-auto xl:grid grid-cols-2 flex flex-col">
            <div className="flex flex-col items-center gap-2 p-2 xl:items-start">
              <div className="flex items-center justify-center gap-2">
                <Image
                  alt="Patrocinadores"
                  className="h-auto w-full max-w-4xl"
                  src={FooterBanner}
                />
              </div>
            </div>
            <div className="flex xl:flex-row flex-col items-center justify-center xl:justify-end gap-4 text-muted-foreground text-sm">
              <Link
                className="transition-colors hover:text-foreground"
                href="/about-us"
              >
                {t("nav.about")}
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="/legal-notice"
              >
                {t("nav.legalAdvice")}
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="/privacy-policy"
              >
                {t("nav.privacyPolicy")}
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="/cookies-policy"
              >
                {t("nav.cookiesPolicy")}
              </Link>
            </div>
          </div>
          <div className="container mx-auto border-border border-t py-4 text-center text-muted-foreground text-xs">
            <p>
              {t("footer.copyright", {
                year: new Date().getFullYear(),
              })}
            </p>
          </div>
        </footer>
      </div>
    </AuthModalProvider>
  );
}