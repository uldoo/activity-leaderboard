import { useEffect, useState, type FormEvent } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { supabase, supabaseConfigError } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(supabase ? null : supabaseConfigError);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    void client.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user.id) {
        return;
      }

      const { data: admin } = await client
        .from('admins')
        .select('id')
        .eq('user_id', data.session.user.id)
        .maybeSingle();

      if (admin) {
        navigate('/admin', { replace: true });
      }
    });
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setError(supabaseConfigError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw loginError;
      }

      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (!admin) {
        await supabase.auth.signOut();
        setError('관리자 권한이 없습니다. admins 테이블에 등록된 계정만 접근할 수 있습니다.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-6">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
            <LogIn className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black text-white">관리자 로그인</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
            Supabase Auth 이메일/비밀번호 계정으로 로그인합니다.
          </p>
        </div>

        {error ? (
          <div className="mb-4 flex gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-black text-zinc-500">이메일</span>
            <input
              type="email"
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 placeholder:text-zinc-700 focus:ring-2"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-black text-zinc-500">비밀번호</span>
            <input
              type="password"
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-3 font-bold text-white outline-none ring-yellow-300 placeholder:text-zinc-700 focus:ring-2"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !supabase}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 font-black text-black transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="h-5 w-5" aria-hidden="true" />
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </section>
    </Layout>
  );
}
