'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState(session?.user?.name || '');
  const [bio, setBio] = useState((session?.user as any)?.bio || '');
  const [photo, setPhoto] = useState(session?.user?.image || '');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-200">Loading...</div>;
  }
  if (!session) {
    router.push('/login');
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // In a real app, send to backend here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <form className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6" onSubmit={handleSave}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Profile</h1>
        <div className="flex flex-col items-center gap-2">
          <img src={photo || '/default-avatar.png'} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-blue-500" />
          {editing && (
            <input
              type="url"
              value={photo}
              onChange={e => setPhoto(e.target.value)}
              className="mt-2 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full"
              placeholder="Photo URL"
            />
          )}
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-200 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={!editing}
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-200 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
            disabled={!editing}
          />
        </div>
        <div className="flex gap-2">
          {editing ? (
            <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Save</button>
          ) : (
            <button type="button" className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setEditing(true)}>Edit</button>
          )}
          <button type="button" className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors" onClick={() => signOut({ callbackUrl: '/login' })}>Sign Out</button>
        </div>
        {saved && <div className="text-green-500 text-center">Profile saved (demo only)</div>}
      </form>
    </div>
  );
} 