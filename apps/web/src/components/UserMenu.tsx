'use client';

import { ChevronDownIcon, LogOutIcon, UserIcon } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

import { Fragment } from 'react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/use-i18n';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const router = useRouter();
  const { t } = useI18n();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          toast.success(t('auth.loggedOut'));
        },
      },
    });
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center space-x-2 rounded-md bg-background px-3 py-2 font-medium text-foreground text-sm shadow-sm ring-1 ring-border hover:bg-neutral/50">
        <UserIcon className="h-4 w-4" />
        <span>{session?.user?.name || session?.user?.email}</span>
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
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-success/10 text-success-foreground' : 'text-foreground'
                  } flex w-full items-center px-4 py-2 text-left text-sm`}
                  onClick={() => router.push('/dashboard')}
                  type="button"
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  {t('nav.dashboard')}
                </button>
              )}
            </Menu.Item>

            <div className="border-border border-t" />

            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-success/10 text-success-foreground' : 'text-foreground'
                  } flex w-full items-center px-4 py-2 text-left text-sm`}
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOutIcon className="mr-3 h-4 w-4" />
                  {t('auth.signOut')}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
