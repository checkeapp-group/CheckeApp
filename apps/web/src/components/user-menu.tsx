import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/hooks/use-i18n';
import { authClient } from '@/lib/auth-client';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';


// Alternative user menu component with account navigation
export default function UserMenu() {
  const { t } = useI18n();
  const { data: session, isPending } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success(t('userMenu.loggedOutSuccess'));
        },
      },
    });
  };

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return <Button asChild variant="outline" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{session.user.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuLabel>{t('userMenu.myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button className="w-full" onClick={handleLogout} variant="destructive">
            {t('auth.signOut')}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
