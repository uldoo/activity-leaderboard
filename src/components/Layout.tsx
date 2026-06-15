import type { PropsWithChildren } from 'react';
import { Home, LogIn, ShieldCheck, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { SEASON_END_DATE, SEASON_START_DATE, formatKoreanDate } from '../lib/date';

type LayoutProps = PropsWithChildren<{
  wide?: boolean;
}>;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition',
    isActive
      ? 'bg-white text-black'
      : 'border border-white/10 bg-zinc-950 text-zinc-300 hover:border-yellow-400/50 hover:text-yellow-200',
  ].join(' ');

export function Layout({ children, wide = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/40 bg-yellow-400/10 text-yellow-200">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-lg font-black tracking-normal text-white">인류애 랭킹 보드</div>
              <p className="text-xs font-semibold text-zinc-500">
                {formatKoreanDate(SEASON_START_DATE)} - {formatKoreanDate(SEASON_END_DATE)}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="주요 메뉴">
            <NavLink to="/" className={navLinkClass}>
              <Home className="h-4 w-4" aria-hidden="true" />
              랭킹
            </NavLink>
            <NavLink to="/admin" className={navLinkClass}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              관리자
            </NavLink>
            <NavLink to="/login" className={navLinkClass}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              로그인
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={['mx-auto w-full px-4 py-6 sm:py-8', wide ? 'max-w-7xl' : 'max-w-6xl'].join(' ')}>
        {children}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs font-semibold text-zinc-600">
        Korea time 기준으로 표시됩니다.
      </footer>
    </div>
  );
}
