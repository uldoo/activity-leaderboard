import { BarChart3, ListChecks, Settings2, Trophy, Users } from 'lucide-react';

export type AdminTab = 'dashboard' | 'members' | 'score' | 'history' | 'rules';

type AdminTabsProps = {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
};

const tabs = [
  { id: 'dashboard', label: '대시보드', icon: BarChart3 },
  { id: 'members', label: '참가자 관리', icon: Users },
  { id: 'score', label: '점수 부여', icon: Trophy },
  { id: 'history', label: '활동 내역', icon: ListChecks },
  { id: 'rules', label: '점수 규칙 설정', icon: Settings2 },
] satisfies Array<{ id: AdminTab; label: string; icon: typeof BarChart3 }>;

export function AdminTabs({ activeTab, onChange }: AdminTabsProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950 p-2">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                'inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-black transition',
                active
                  ? 'bg-yellow-300 text-black'
                  : 'border border-white/10 bg-black text-zinc-300 hover:border-yellow-400/50 hover:text-yellow-200',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
