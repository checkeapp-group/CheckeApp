"use client";

import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const { t } = useI18n();
  const { user } = useAuth();

  const handleLogout = async () => {
    await authClient.signOut({
      redirect: true,
      redirectTo: "/",
    });
    toast.success(t("auth.loggedOut") || "Successfully logged out");
  };

  if (!user) {
    return null;
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center space-x-2 rounded-md bg-background px-3 py-2 font-medium text-neutral-700 text-sm shadow-sm ring-1 ring-border transition-colors duration-200 hover:bg-neutral/50 focus:outline-none focus:ring-4 focus:ring-ring/20">
        <UserIcon className="h-4 w-4" />
        <span className="max-w-32 truncate">{user.name || user.email}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-border focus:outline-none">
          <div className="py-1">
            <div className="border-border border-b px-4 py-3">
              <p className="truncate font-medium text-neutral-700 text-sm">
                {user.name || t("auth.guest")}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {user.email}
              </p>
            </div>

            {user.isAdmin && (
              <Menu.Item>
                {({ active }) => (
                  <Link
                    className={`${
                      active ? "bg-accent/50" : ""
                    } flex w-full items-center px-4 py-2 text-left font-medium text-primary text-sm transition-colors duration-150`}
                    href="/admin/users"
                  >
                    <ShieldCheckIcon className="mr-3 h-4 w-4" />
                    {t("admin.title")}
                  </Link>
                )}
              </Menu.Item>
            )}

            <div className="my-1 border-border border-t" />

            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active
                      ? "bg-destructive/10 text-destructive"
                      : "text-foreground"
                  } flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150`}
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOutIcon className="mr-3 h-4 w-4" />
                  {t("auth.signOut") || "Sign Out"}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
