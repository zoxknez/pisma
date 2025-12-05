import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your PISMA profile and settings.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
