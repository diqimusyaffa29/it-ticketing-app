import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // Jika belum login, lempar ke login
  redirect(token ? '/dashboard' : '/login');
}