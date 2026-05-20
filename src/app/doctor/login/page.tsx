import { redirect } from 'next/navigation';

export default function DoctorLoginPage() {
  redirect('/doctor/auth?mode=login');
}
