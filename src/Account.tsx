import { authFetch, useAuth } from 'host/ui';
import { useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm.tsx';
import { OrderHistory } from './components/OrderHistory.tsx';
import { ProfileForm } from './components/ProfileForm.tsx';
import type { Profile } from './types.ts';

export default function Account() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setProfile(null);
    setFailed(false);
    if (!user) return;
    let current = true;
    authFetch<Profile>(`/users/${user.id}`).then((p) => current && setProfile(p), () => current && setFailed(true));
    return () => { current = false; };
  }, [user]);

  if (!user) return <AuthForm />;
  return (
    <section>
      {failed && <p role="alert">Could not load your profile.</p>}
      {profile && <ProfileForm profile={profile} onSaved={setProfile} />}
      <OrderHistory />
      <button type="button" onClick={() => void logout()}>Log out</button>
    </section>
  );
}
