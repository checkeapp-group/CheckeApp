import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header>
      {session ? (
        <div>
          <p>Welcome, {session.user.email}</p>
        </div>
      ) : (
        <Link href="/login">Sign in</Link>
      )}
    </header>
  );
}
