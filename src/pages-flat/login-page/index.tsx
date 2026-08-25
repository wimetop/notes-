import { AuthForm } from '@/features/auth';
export function LoginPage() {
  return <main className="auth-page">
    <aside className="auth-aside" aria-hidden="true"><p>Нотатки+</p><h1>Місце для важливого.</h1><span>Зберігайте думки, плани та маленькі відкриття в одному тихому просторі.</span></aside>
    <AuthForm mode="login" />
  </main>;
}
