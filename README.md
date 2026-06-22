# 인류애 랭킹 보드

React, Vite, TypeScript, TailwindCSS, Supabase로 만든 단톡방 활동 지수 현황판입니다. 공개 페이지는 블랙 기반 게임 리더보드 스타일로 시즌/월간 랭킹을 보여주고, 관리자 페이지에서는 참가자, 점수 부여, 활동 내역, 활동 유형별 기본 점수를 모두 관리할 수 있습니다.

## 주요 기능

- 공개 페이지 `/`: 시즌 TOP 3, 전체 랭킹, 월간 랭킹, 랭크 기준표, 최근 활동
- 로그인 페이지 `/login`: Supabase Auth 이메일/비밀번호 로그인
- 관리자 페이지 `/admin`: 탭 기반 설정 화면
- 관리자 탭: 대시보드, 참가자 관리, 점수 부여, 활동 내역, 점수 규칙 설정
- 활동 유형은 `activity_rules` 테이블에서 관리
- 활동 저장 시 `activity_type`, `category`, `score`를 스냅샷으로 저장
- 시즌 기간: 2026년 6월 20일 - 2026년 12월 31일
- 점수 반영 기준: `created_at` 기준 2026년 6월 20일 이후 등록된 점수만 랭킹과 합계에 반영
- Cloudflare Pages SPA 리다이렉트 포함: `public/_redirects`

## 설치 방법

```bash
npm install
```

## 환경변수 설정

`.env.example`을 참고해 `.env` 파일을 만듭니다.

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Cloudflare Pages에서는 `Settings > Environment variables`에 같은 값을 등록합니다. Vite 환경변수는 빌드 시점에 포함되므로, 배포 후 환경변수를 추가했다면 반드시 재배포해야 합니다.

## Supabase 설정 방법

1. Supabase 프로젝트를 생성합니다.
2. `Authentication > Providers > Email`에서 Email 로그인을 활성화합니다.
3. `Authentication > Users`에서 관리자 이메일 계정을 생성합니다.
4. `SQL Editor`에서 `supabase/schema.sql` 전체를 실행합니다.
5. Realtime을 쓰려면 `Database > Replication`에서 `members`, `activities`, `activity_rules` 테이블을 활성화합니다.

## SQL 실행 방법

Supabase 대시보드의 `SQL Editor`에서 [supabase/schema.sql](./supabase/schema.sql)을 열고 전체 SQL을 실행합니다. 이 SQL은 다음을 생성합니다.

- `members`
- `activity_rules`
- `activities`
- `admins`
- `updated_at` 자동 갱신 트리거
- 기본 활동 규칙 데이터
- 공개 조회 및 관리자 쓰기용 Row Level Security 정책

## 관리자 계정 등록 방법

Auth 사용자 생성 후, SQL Editor에서 아래 SQL을 실행합니다. 이메일은 실제 관리자 이메일로 바꿔주세요.

```sql
insert into public.admins (user_id, email)
select id, email
from auth.users
where email = 'admin@example.com'
on conflict (email) do nothing;
```

등록된 사용자는 `/login`에서 로그인한 뒤 `/admin`에 접근할 수 있습니다.

## 로컬 실행 방법

```bash
npm run dev
```

## 빌드 방법

```bash
npm run build
```

빌드 결과물은 `dist` 폴더에 생성됩니다.

## Cloudflare Pages 배포 방법

1. GitHub 저장소에 프로젝트를 push합니다.
2. Cloudflare Dashboard에서 `Workers & Pages > Create application > Pages`를 선택합니다.
3. 저장소를 연결합니다.
4. Build command를 `npm run build`로 설정합니다.
5. Build output directory를 `dist`로 설정합니다.
6. 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록합니다.
7. 배포합니다.

Supabase SQL은 배포 전후 어느 쪽에 실행해도 됩니다. 단, Cloudflare Pages 환경변수를 나중에 등록했다면 재배포가 필요합니다.

## 기본 점수 규칙

- 벙 개설 / 벙 / 10
- 벙 성사 / 벙 / 30
- 벙 참석 / 벙 / 10
- 벙 후기 작성 / 벙 / 5
- 콘텐츠 개최 / 콘텐츠 / 10
- 참여자 5명 이상 보너스 / 콘텐츠 / 10
- 일일 출석 / 출석 / 1
- 7일 연속 출석 보너스 / 출석 / 10
- 30일 연속 출석 보너스 / 출석 / 50

관리자는 `/admin`의 `점수 규칙 설정` 탭에서 활동 유형명, 카테고리, 기본 점수, 활성 상태, 정렬 순서를 수정할 수 있습니다.

## 랭크 기준

- 0-99점: 🥉 브론즈
- 100-299점: 🥈 실버
- 300-599점: 🥇 골드
- 600-999점: 💠 플래티넘
- 1000-1499점: 💎 다이아
- 1500-1999점: 🔥 마스터
- 2000-2999점: ⭐ 그랜드마스터
- 3000점 이상: 👑 인류애왕

## 프로젝트 구조

```text
src/
  main.tsx
  App.tsx
  lib/
    supabase.ts
    scoring.ts
    date.ts
  components/
    AdminTabs.tsx
    AdminDashboard.tsx
    MemberManager.tsx
    ActivityRuleManager.tsx
    ActivityHistory.tsx
    ScoreForm.tsx
    Leaderboard.tsx
    SeasonProgress.tsx
    ...
  pages/
    Home.tsx
    Login.tsx
    Admin.tsx
  types/
    database.ts
```
