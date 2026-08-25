import { AuthForm } from '@/features/auth';
export function RegisterPage() {
  return <main className="auth-page">
    <aside className="auth-aside" aria-hidden="true"><p>Нотатки+</p><h1>Почніть із першої думки.</h1><span>Ваш особистий простір для всього, що варто не забути.</span></aside>
    <AuthForm mode="register" />
  </main>;
}
