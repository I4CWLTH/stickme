create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  script text not null default '',
  format text not null default '16:9',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scene_index int not null,
  title text not null,
  duration_ms int not null default 0,
  beats_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(project_id, scene_index)
);

create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  slug text not null,
  display_name text not null,
  style_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists motion_clips (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  fps int not null default 24,
  duration_ms int not null,
  loop boolean not null default false,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists motion_frames (
  id uuid primary key default gen_random_uuid(),
  motion_clip_id uuid not null references motion_clips(id) on delete cascade,
  frame_index int not null,
  pose_json jsonb not null,
  created_at timestamptz not null default now(),
  unique(motion_clip_id, frame_index)
);

create table if not exists render_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  quality text not null default '1080p',
  watermark boolean not null default true,
  status text not null default 'queued',
  output_url text,
  error_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into motion_clips(slug,name,category,fps,duration_ms,loop,metadata) values
('idle','Idle','base',24,1800,true,'{"energy":0.08}'),
('talk','Talk','acting',24,900,true,'{"energy":0.35}'),
('walk','Walk','locomotion',24,900,true,'{"travel":0.38}'),
('run','Run','locomotion',30,520,true,'{"travel":0.62}'),
('point','Point','acting',24,850,false,'{"energy":0.45}'),
('react','React','acting',24,950,false,'{"energy":0.3}'),
('surprised','Surprised','acting',24,700,false,'{"energy":0.7}'),
('angry','Angry','acting',24,950,true,'{"energy":0.75}'),
('dance','Dance','acting',30,900,true,'{"energy":0.9}'),
('fall','Fall','acting',30,800,false,'{"energy":1.0}')
on conflict (slug) do nothing;
