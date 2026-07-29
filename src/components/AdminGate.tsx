import { useState, type FormEvent, type ReactNode } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SESSION_KEY = 'mision-prevencion-admin-auth';
const CONFIGURED_ADMIN_PIN = String((import.meta as any).env?.VITE_ADMIN_PIN || '').trim();

const normalizePin = (value: string) => value.replace(/\s+/g, '').trim();

const AdminGate = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (!CONFIGURED_ADMIN_PIN) {
      setError('El código de acceso no está configurado. Agrega VITE_ADMIN_PIN en Vercel.');
      return;
    }

    const enteredPin = normalizePin(pin);

    if (enteredPin !== normalizePin(CONFIGURED_ADMIN_PIN)) {
      setError('Código incorrecto.');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, 'true');
    setAuthorized(true);
    setError('');
  };

  if (authorized) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071D4A] p-5 text-slate-950">
      <section className="w-full max-w-md rounded-[2.4rem] border-4 border-white bg-white p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,.35)] md:p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-[#176ED8] to-[#16B7D8] text-white shadow-xl">
          <LockKeyhole size={38} />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[.22em] text-cyan-700">Acceso privado</p>
        <h1 className="mt-2 text-3xl font-black text-[#071D4A]">Panel administrativo</h1>
        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-600">Esta sección es solo para docentes o administradores.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={12}
            value={pin}
            onChange={(event) => {
              setPin(event.target.value.replace(/[^0-9\s]/g, ''));
              if (error) setError('');
            }}
            placeholder="Código de acceso"
            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-center text-xl font-black tracking-[.35em] text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
          />
          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">{error}</p>}
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#176ED8] to-[#16B7D8] px-5 py-4 text-sm font-black uppercase tracking-[.14em] text-white shadow-lg hover:-translate-y-1">
            <ShieldCheck size={19} /> Entrar al panel
          </button>
          <button type="button" onClick={() => navigate('/hub')} className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[.14em] text-slate-500 hover:bg-slate-50">
            Volver a la página infantil
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminGate;
