import { redirect } from 'next/navigation';

export default function LegacyStaffHomepageBuilderPage() {
  redirect('/staff/dashboard');
}
