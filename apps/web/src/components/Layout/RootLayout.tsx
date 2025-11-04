"use client";

import { LogOutIcon, Menu, ShieldCheckIcon, UserIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import { toast } from "sonner";
import CookieConsentComponent from "@/components/CookieConsent";
import GlobalLoader from "@/components/GlobalLoader";
import UserMenu from "@/components/UserMenu";
import { LanguageSelector } from "@/components/ui/lenguage-selector";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { authClient } from "@/lib/auth-client";
import { AuthModalProvider, useAuthModal } from "@/providers/AuthModalProvider";
import { useLoading } from "@/providers/LoadingProvider";
import FactCheckerLogo from "@/public/FactCheckerLogo.webp";
import FooterBanner from "@/public/footer_banner.png";
import TermsAcceptanceModal from "../Auth/terms-acceptance-modal";
import { Button } from "../ui/button";

function AppHeader() {
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
          toast.success(t("auth.loggedOut") || "Successfully logged out");
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-border border-b bg-white/95 px-3 shadow-sm backdrop-blur-sm lg:px-0">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 lg:container">
        <Link className="flex items-center gap-2" href="/">
          <Image
            alt="CheckeApp Logo"
            className="h-auto w-64"
            priority
            src={FactCheckerLogo}
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              className={`rounded-lg p-3 transition-all hover:bg-neutral-200/60 ${
                isLinkActive("/") 
                  ? "bg-neutral-200/80 font-medium text-primary" 
                  : "text-neutral-600"
              }`}
              href="/"
            >
              {t("nav.verify")}
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  className={`rounded-lg px-2 py-3 transition-all hover:bg-neutral-200/60 ${
                    isLinkActive("/verifications") 
                      ? "bg-neutral-200/80 font-medium text-primary" 
                      : "text-neutral-600"
                  }`}
                  href="/verifications"
                >
                  {t("verifications.title")}
                </Link>
                <Link
                  className={`text-nowrap rounded-lg px-2 py-3 transition-all hover:bg-neutral-200/60 ${
                    isLinkActive("/user-verifications") 
                      ? "bg-neutral-200/80 font-medium text-primary" 
                      : "text-neutral-600"
                  }`}
                  href="/user-verifications"
                >
                  {t("user_verifications.title")}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="hidden md:block">
                <UserMenu />
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button onClick={openAuthModal}>{t("auth.getStarted")}</Button>
              </div>
            )}
            <LanguageSelector />

            {/* Mobile Menu Button */}
            <button
              aria-label="Toggle mobile menu"
              className="flex items-center justify-center p-2 text-neutral-600 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="border-border border-t bg-white md:hidden">
          <nav className="container mx-auto flex flex-col py-4">
            {/* User Info Section (Mobile) */}
            {isAuthenticated && user && (
              <div className="mb-3 border-border border-b px-4 pb-3">
                <div className="flex items-center gap-2 text-neutral-700">
                  <UserIcon className="h-5 w-5" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium text-sm">
                      {user.name || t("auth.guest")}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              className={`rounded-lg px-4 py-3 transition-all hover:bg-neutral-200/60 ${
                isLinkActive("/") 
                  ? "bg-neutral-200/80 font-medium text-primary" 
                  : "text-neutral-600"
              }`}
              href="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.verify")}
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  className={`rounded-lg px-4 py-3 transition-all hover:bg-neutral-200/60 ${
                    isLinkActive("/verifications") 
                      ? "bg-neutral-200/80 font-medium text-primary" 
                      : "text-neutral-600"
                  }`}
                  href="/verifications"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("verifications.title")}
                </Link>
                <Link
                  className={`rounded-lg px-4 py-3 transition-all hover:bg-neutral-200/60 ${
                    isLinkActive("/user-verifications") 
                      ? "bg-neutral-200/80 font-medium text-primary" 
                      : "text-neutral-600"
                  }`}
                  href="/user-verifications"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("user_verifications.title")}
                </Link>

                {/* Admin Link (Mobile) */}
                {user?.isAdmin && (
                  <Link
                    className="flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-primary transition-all hover:bg-neutral-200/60"
                    href="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    {t("admin.title")}
                  </Link>
                )}

                {/* Logout Button (Mobile) */}
                <div className="mt-2 border-border border-t pt-2">
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-destructive transition-all hover:bg-destructive/10"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    type="button"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    {t("auth.signOut") || "Sign Out"}
                  </button>
                </div>
              </>
            )}

            {/* Get Started Button (Mobile - Non-authenticated) */}
            {!isAuthenticated && (
              <div className="mt-2 px-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                >
                  {t("auth.getStarted")}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
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

  const pathname = usePathname();

  useEffect(() => {
    if (isAuthLoading) return;
    
    const excludedPaths = ["/terms-of-service", "/legal-notice", "/privacy-policy"];
    const isExcludedPath = excludedPaths.includes(pathname);
    
    if (isAuthenticated && user && !user.termsAccepted && !isExcludedPath) {
      setShowTermsModal(true);
    } else {
      setShowTermsModal(false);
    }
  }, [isAuthenticated, user, isAuthLoading, pathname]);

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
          <div className="container mx-auto flex grid-cols-2 flex-col py-5 xl:grid">
            <div className="flex flex-col items-center gap-2 p-2 xl:items-start">
              <div className="flex items-center justify-center gap-2">
                <Image
                  alt="Patrocinadores"
                  className="h-auto w-full max-w-4xl"
                  src={FooterBanner}
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground text-sm xl:flex-row xl:justify-end">
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
                href="/terms-of-service"
              >
                {t("nav.termsOfService")}
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
