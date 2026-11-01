import { FormField } from '@shoplab/ui-kit';
import { authFetch } from 'host/ui';
import { useState, type FormEvent } from 'react';
import type { Profile } from '../types.ts';

export function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return void setStatus('error');
    setStatus('saving');
    try {
      const saved = await authFetch<Profile>(`/users/${profile.id}`, { method: 'PATCH', body: JSON.stringify({ fullName }) });
      onSaved(saved);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} aria-label="Profile">
      <h2>Profile</h2>
      <p>{profile.email}</p>
      <FormField label="Full name" name="profileName">
        <input id="profileName" value={fullName} onChange={(e) => { setFullName(e.target.value); setStatus('idle'); }} />
      </FormField>
      <button type="submit" disabled={status === 'saving'}>Save</button>
      {status === 'saved' && <p role="status">Saved</p>}
      {status === 'error' && <p role="alert">Could not save your profile.</p>}
    </form>
  );
}
