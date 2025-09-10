'use client';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, LogInIcon, LogOutIcon, UserIcon } from 'lucide-react';
import { Fragment } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/use-i18n';
import { authClient } from '@/lib/auth-client';
import { useAppRouter } from '@/lib/router';

export default function UserMenu() {
  const { navigate } = useAppRouter();
  const { t } = useI18n();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      redirect: true,
      redirectTo: '/',
    });
    toast.success(t('auth.loggedOut') || 'Successfully logged out');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleDashboard = () => {
    if (!session?.user) {
      navigate('/login');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center space-x-2 rounded-md bg-background px-3 py-2 font-medium text-foreground text-sm shadow-sm ring-1 ring-border transition-colors duration-200 hover:bg-neutral/50 focus:outline-none focus:ring-4 focus:ring-ring/20">
        <UserIcon className="h-4 w-4" />
        <span className="max-w-32 truncate">
          {session?.user?.name || session?.user?.email || t('auth.account') || 'Account'}
        </span>
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-border focus:outline-none">
          <div className="py-1">
            {/* User info header - always shown */}
            <div className="border-border border-b px-4 py-3">
              <p className="truncate font-medium text-foreground text-sm">
                {session?.user?.name || t('auth.guest') || 'Guest'}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {session?.user?.email || t('auth.notSignedIn') || 'Not signed in'}
              </p>
            </div>

            {/* Dashboard/Login option */}
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-success/10 text-success-foreground' : 'text-foreground'
                  } flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150`}
                  onClick={handleDashboard}
                  type="button"
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  {session?.user
                    ? t('nav.dashboard') || 'Dashboard'
                    : t('auth.signIn') || 'Sign In'}
                </button>
              )}
            </Menu.Item>

            <div className="my-1 border-border border-t" />

            {/* Logout/Login option */}
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-success/10 text-success-foreground' : 'text-foreground'
                  } flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150`}
                  onClick={session?.user ? handleLogout : handleLogin}
                  type="button"
                >
                  {session?.user ? (
                    <>
                      <LogOutIcon className="mr-3 h-4 w-4" />
                      {t('auth.signOut') || 'Sign Out'}
                    </>
                  ) : (
                    <>
                      <LogInIcon className="mr-3 h-4 w-4" />
                      {t('auth.signIn') || 'Sign In'}
                    </>
                  )}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
