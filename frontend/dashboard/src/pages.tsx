import { zodResolver } from '@hookform/resolvers/zod';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  FileText,
  FolderKanban,
  GripVertical,
  Inbox,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageSquareQuote,
  BadgeCheck,
  Plus,
  Search,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UsersRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ExperienceInputSchema,
  LoginSchema,
  PostCreateSchema,
  ProfilePatchSchema,
  ProjectCreateSchema,
  ProjectUpdateSchema,
  PostUpdateSchema,
  SkillInputSchema,
  SiteSettingsPatchSchema,
  TestimonialInputSchema,
  type ExperienceInput,
  type LoginInput,
  type ProfilePatchInput,
  type SkillInput,
} from '@portfolio/shared';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RichEditor } from './components/editor';
import {
  Button,
  ConfirmDialog,
  DataTable,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
  Panel,
  SelectField,
  StatusPill,
  TextAreaField,
  TextField,
} from './components/ui';
import { apiJson, apiQuery, apiRequest, type ApiList } from './lib/api';
import { useAuth } from './lib/auth';

type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  thumbnailUrl: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  order: number;
  status: ProjectStatus;
  publishAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  viewCount: number;
  updatedAt: string;
  skills?: Array<{ skill: { id: string; name: string } }>;
  images?: Array<{ mediaId: string; caption: string | null; order: number }>;
};
type SkillRow = {
  id: string;
  name: string;
  category: string;
  level: number | null;
  icon: string | null;
};
type ExperienceRow = {
  id: string;
  type: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  description: string;
  order: number;
};
type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  tags: string[];
  updatedAt: string;
};
type MediaRow = {
  id: string;
  url: string;
  publicId: string;
  type: string;
  size: number;
  createdAt: string;
};
type ProfileRow = ProfilePatchInput & { id: string; userId: string };
type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
};
type GuestbookRow = {
  id: string;
  name: string;
  message: string;
  approved: boolean;
  createdAt: string;
};
type TestimonialRow = {
  id: string;
  authorName: string;
  authorRole: string | null;
  message: string;
  approved: boolean;
  createdAt: string;
};
type AuditRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  meta: unknown;
  createdAt: string;
  user: { name: string; email: string } | null;
};
type SettingRow = { key: string; value: unknown };
type SettingsFormValues = {
  siteTitle: string;
  seoDescription: string;
  accent: string;
  blog: boolean;
  guestbook: boolean;
  chatbot: boolean;
  commandPalette: boolean;
  customCursor: boolean;
  pageTransitions: boolean;
  scrollProgress: boolean;
  githubActivity: boolean;
  cvPdf: boolean;
  dynamicOg: boolean;
  projectReactions: boolean;
  guestbookRealtime: boolean;
  newsletter: boolean;
  openForWork: boolean;
  viewCounter: boolean;
  easterEgg: boolean;
};
type SubscriberRow = { id: string; email: string; confirmedAt: string | null };
type UploadedMedia = { id: string; url: string; publicId: string; type: string; size: number };

function tableColumns<TData extends object>(columns: unknown): ColumnDef<TData, unknown>[] {
  return columns as ColumnDef<TData, unknown>[];
}

function useList<T>(key: string, path: string) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest<ApiList<T>>(`${path}${apiQuery({ page: 1, limit: 100 })}`),
  });
}

function ContentError({ error }: { error: Error | null }) {
  return error ? <ErrorState message={error.message} /> : null;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });
  const submit = form.handleSubmit(async (values) => {
    setError('');
    try {
      await login(values.email, values.password);
      toast.success('Selamat datang kembali.');
      const destination = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(destination, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Login gagal. Periksa kembali email dan password.',
      );
    }
  });
  return (
    <main className="login-screen">
      <div className="login-orbit login-orbit-one" />
      <div className="login-orbit login-orbit-two" />
      <div className="login-aside">
        <div className="brand-lockup">
          <div className="brand-mark">r.</div>
          <div>
            <strong>
              rafi<span>folio</span>
            </strong>
            <small>STUDIO CONSOLE</small>
          </div>
        </div>
        <div className="login-message">
          <div className="hero-kicker">
            <span className="pulse-dot" /> WORKSPACE / 01
          </div>
          <h1>
            Every detail
            <br />
            has a <em>story.</em>
          </h1>
          <p>Satu ruang untuk membentuk cerita di balik setiap proyek, pengalaman, dan ide.</p>
          <div className="login-quote">
            <span>“</span>
            <p>
              Build with intention.
              <br />
              Share with clarity.
            </p>
          </div>
        </div>
        <span className="login-aside-footer">
          PERSONAL PORTFOLIO SYSTEM <b>·</b> 2026
        </span>
      </div>
      <section className="login-card">
        <div className="login-card-top">
          <span className="login-icon">
            <LockKeyhole size={18} />
          </span>
          <span className="secure-label">
            <ShieldCheck size={14} /> SECURE ACCESS
          </span>
        </div>
        <p className="eyebrow">ADMINISTRATOR</p>
        <h2>Masuk ke workspace</h2>
        <p className="login-hint">Gunakan akun admin portfolio untuk melanjutkan.</p>
        {error && (
          <div className="form-alert" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={(event) => void submit(event)} className="login-form">
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="nama@email.com"
            {...form.register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan password"
            {...form.register('password')}
          />
          <div className="login-meta">
            <label className="remember-control">
              <input type="checkbox" /> <span>Ingat perangkat ini</span>
            </label>
            <span>Access terenkripsi</span>
          </div>
          <Button className="login-submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <LoaderCircle className="spin" size={17} /> Memverifikasi…
              </>
            ) : (
              <>
                Masuk ke dashboard <ChevronRight size={17} />
              </>
            )}
          </Button>
        </form>
        <div className="login-footnote">
          <span className="online-dot" /> Sesi dilindungi refresh token HTTP-only
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  color = 'mint',
  trend,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon ${color}`}>
          <Icon size={17} />
        </span>
        {trend && (
          <span className="stat-trend">
            <ArrowUpRight size={13} /> {trend}
          </span>
        )}
      </div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-note">{note}</span>
    </div>
  );
}

export function OverviewPage() {
  const analytics = useQuery({
    queryKey: ['analytics'],
    queryFn: () =>
      apiRequest<{
        totalViews: number;
        dailyViews: Array<{ date: string; views: number }>;
        projectViews: Array<{ title: string; slug: string; views: number }>;
      }>('/admin/analytics'),
    refetchInterval: 60_000,
  });
  const projects = useList<ProjectRow>('projects', '/admin/projects');
  const skills = useList<SkillRow>('skills', '/admin/skills');
  const posts = useList<PostRow>('posts', '/admin/posts');
  const messages = useQuery({
    queryKey: ['messages'],
    queryFn: () =>
      apiRequest<ApiList<MessageRow>>(`/admin/messages${apiQuery({ page: 1, limit: 5 })}`),
  });
  const allRows = projects.data?.items ?? [];
  const totalViews = analytics.data?.totalViews ?? 0;
  const chartData =
    analytics.data?.dailyViews.map((item) => ({
      date: new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      }).format(new Date(`${item.date}T00:00:00Z`)),
      views: item.views,
    })) ?? [];
  const recent = allRows.slice(0, 5);
  const projectColumns = useMemo(() => {
    const column = createColumnHelper<ProjectRow>();
    return [
      column.accessor('title', {
        header: 'Proyek',
        cell: (info) => <span className="cell-primary">{info.getValue()}</span>,
      }),
      column.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <StatusPill
            tone={
              info.getValue() === 'PUBLISHED'
                ? 'green'
                : info.getValue() === 'SCHEDULED'
                  ? 'amber'
                  : 'neutral'
            }
          >
            {info.getValue()}
          </StatusPill>
        ),
      }),
      column.accessor('viewCount', {
        header: 'Views',
        cell: (info) => (
          <span className="number-cell">{info.getValue().toLocaleString('id-ID')}</span>
        ),
      }),
    ];
  }, []);
  const error = projects.error ?? skills.error ?? posts.error ?? messages.error ?? analytics.error;
  if (
    projects.isLoading ||
    skills.isLoading ||
    posts.isLoading ||
    messages.isLoading ||
    analytics.isLoading
  )
    return <LoadingState />;
  return (
    <>
      <PageHeader
        eyebrow="OVERVIEW / 01"
        title="Ringkasan"
        description="Selamat datang kembali. Ini yang terjadi di portfolio kamu."
        action={
          <span className="date-chip">
            <Clock3 size={14} />{' '}
            {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
          </span>
        }
      />
      <ContentError error={error instanceof Error ? error : null} />
      <div className="stats-grid">
        <StatCard
          label="Total proyek"
          value={projects.data?.total ?? 0}
          note="Semua status konten"
          icon={FolderKanban}
          trend="Content"
        />
        <StatCard
          label="Total project views"
          value={totalViews.toLocaleString('id-ID')}
          note="Akumulasi seluruh proyek"
          icon={Eye}
          color="blue"
        />
        <StatCard
          label="Skill terdata"
          value={skills.data?.total ?? 0}
          note="Keahlian di portfolio"
          icon={Wrench}
          color="violet"
        />
        <StatCard
          label="Pesan belum dibaca"
          value={messages.data?.unread ?? 0}
          note="Perlu ditinjau"
          icon={Inbox}
          color="amber"
        />
      </div>
      <div className="overview-grid">
        <Panel title="Views 30 hari terakhir" subtitle="Kunjungan anonim yang tercatat per hari">
          <div className="chart-summary">
            <strong>{totalViews.toLocaleString('id-ID')}</strong>
            <span>
              total views tercatat{' '}
              <span className="trend-up">
                <ArrowUpRight size={13} /> 30 hari
              </span>
            </span>
          </div>
          <div className="chart-area">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#86e4ca" stopOpacity={0.27} />
                      <stop offset="96%" stopColor="#86e4ca" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 6"
                    vertical={false}
                    stroke="var(--line-subtle)"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#74d6ba"
                    strokeWidth={2.5}
                    fill="url(#viewFill)"
                    activeDot={{ r: 5, fill: '#74d6ba', stroke: 'var(--surface)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<BarChart3 size={20} />}
                title="Belum ada data views"
                description="Grafik akan terisi saat proyek mulai dikunjungi."
              />
            )}
          </div>
          <div className="chart-caption">
            <span>
              <i className="legend-dot" /> Project views
            </span>
            <span>Data anonim dari API portfolio</span>
          </div>
        </Panel>
        <Panel
          title="Aktivitas terbaru"
          subtitle="Pesan masuk terbaru"
          action={
            <a className="text-link" href="/inbox">
              Lihat inbox <ChevronRight size={14} />
            </a>
          }
        >
          <div className="activity-list">
            {(messages.data?.items ?? []).slice(0, 4).map((message) => (
              <div className="activity-row" key={message.id}>
                <span className={`activity-avatar ${message.isRead ? '' : 'unread'}`}>
                  {message.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="activity-copy">
                  <strong>{message.name}</strong>
                  <small>{message.subject}</small>
                </span>
                <time>{relativeDate(message.createdAt)}</time>
              </div>
            ))}
            {!messages.data?.items.length && (
              <EmptyState
                icon={<Mail size={19} />}
                title="Inbox masih kosong"
                description="Pesan dari formulir kontak akan tampil di sini."
              />
            )}
          </div>
        </Panel>
      </div>
      <Panel
        title="Proyek terbaru"
        subtitle="Konten yang terakhir diperbarui"
        action={
          <a className="text-link" href="/projects">
            Kelola proyek <ChevronRight size={14} />
          </a>
        }
      >
        <DataTable
          data={recent}
          columns={tableColumns<ProjectRow>(projectColumns)}
          emptyLabel="Belum ada proyek."
        />
      </Panel>
      <div className="overview-bottom">
        <div className="welcome-strip">
          <span className="welcome-mark">
            <Sparkles size={17} />
          </span>
          <div>
            <strong>Ruang ide yang siap tumbuh.</strong>
            <p>
              {posts.data?.total ?? 0} artikel blog tersimpan. Tambahkan cerita baru untuk menjaga
              portfolio tetap hidup.
            </p>
          </div>
          <a href="/posts" className="text-link">
            Tulis artikel <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function relativeDate(value: string): string {
  const date = new Date(value);
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const hours = Math.floor(elapsed / 3_600_000);
  if (hours < 1) return 'Baru saja';
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function SortableProject({ project }: { project: ProjectRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`sort-project ${isDragging ? 'dragging' : ''}`}
    >
      <button
        className="drag-handle"
        aria-label={`Urutkan ${project.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={17} />
      </button>
      <span className="sort-project-title">{project.title}</span>
      <span className="sort-project-slug">/{project.slug}</span>
      <StatusPill
        tone={
          project.status === 'PUBLISHED'
            ? 'green'
            : project.status === 'SCHEDULED'
              ? 'amber'
              : 'neutral'
        }
      >
        {project.status}
      </StatusPill>
    </div>
  );
}

type ProjectFormFields = {
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  thumbnailUrl: string;
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  status: ProjectStatus;
  publishAt: string;
  seoTitle: string;
  seoDescription: string;
  skillIds: string[];
};

function ProjectForm({
  project,
  onClose,
  skills,
  onSave,
}: {
  project: ProjectRow | null;
  onClose: () => void;
  skills: SkillRow[];
  onSave: (
    project: ProjectRow | null,
    values: ProjectFormFields,
    image: File | null,
  ) => Promise<void>;
}) {
  const [image, setImage] = useState<File | null>(null);
  const initial: ProjectFormFields = {
    title: project?.title ?? '',
    slug: project?.slug ?? '',
    summary: project?.summary ?? '',
    problem: project?.problem ?? '',
    solution: project?.solution ?? '',
    result: project?.result ?? '',
    thumbnailUrl: project?.thumbnailUrl ?? '',
    repoUrl: project?.repoUrl ?? '',
    demoUrl: project?.demoUrl ?? '',
    featured: project?.featured ?? false,
    status: project?.status ?? 'DRAFT',
    publishAt: project?.publishAt ? new Date(project.publishAt).toISOString().slice(0, 16) : '',
    seoTitle: project?.seoTitle ?? '',
    seoDescription: project?.seoDescription ?? '',
    skillIds: project?.skills?.map((item) => item.skill.id) ?? [],
  };
  const form = useForm<ProjectFormFields>({ defaultValues: initial });
  const selectedSkills = form.watch('skillIds');
  const submit = form.handleSubmit(async (values) => onSave(project, values, image));
  return (
    <Modal open title={project ? 'Edit project' : 'Project baru'} onClose={onClose} wide>
      <form className="form-stack dialog-form" onSubmit={(event) => void submit(event)}>
        <div className="form-grid">
          <TextField
            label="Judul project"
            placeholder="Contoh: Portfolio platform"
            {...form.register('title')}
          />
          <TextField
            label="Slug"
            placeholder="portfolio-platform"
            hint="Kosongkan untuk dibuat otomatis"
            {...form.register('slug')}
          />
          <TextField
            label="Ringkasan"
            placeholder="Deskripsi singkat project"
            className="span-2"
            {...form.register('summary')}
          />
        </div>
        <div className="editor-grid">
          <RichEditor
            label="Problem"
            value={form.watch('problem')}
            onChange={(value) => form.setValue('problem', value)}
          />
          <RichEditor
            label="Solution"
            value={form.watch('solution')}
            onChange={(value) => form.setValue('solution', value)}
          />
          <RichEditor
            label="Result"
            value={form.watch('result')}
            onChange={(value) => form.setValue('result', value)}
          />
        </div>
        <Panel title="Visual & links" subtitle="Thumbnail, gambar galeri, dan tautan project">
          <div className="form-grid">
            <TextField
              label="Thumbnail URL"
              placeholder="https://…"
              {...form.register('thumbnailUrl')}
            />
            <label className="field">
              <span>Upload gambar</span>
              <span className="upload-control">
                <Upload size={16} />
                {image?.name ?? 'Pilih gambar'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                />
              </span>
              <small>Maksimal 10 MB. Upload tersimpan di Media Library.</small>
            </label>
            <TextField
              label="Repository URL"
              placeholder="https://github.com/…"
              {...form.register('repoUrl')}
            />
            <TextField label="Demo URL" placeholder="https://…" {...form.register('demoUrl')} />
          </div>
        </Panel>
        <Panel title="Skill yang digunakan" subtitle="Pilih skill yang terhubung dengan project">
          <div className="skill-check-grid">
            {skills.map((skill) => (
              <label
                className={`skill-check ${selectedSkills.includes(skill.id) ? 'checked' : ''}`}
                key={skill.id}
              >
                <input
                  type="checkbox"
                  value={skill.id}
                  checked={selectedSkills.includes(skill.id)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selectedSkills, skill.id]
                      : selectedSkills.filter((id) => id !== skill.id);
                    form.setValue('skillIds', next);
                  }}
                />
                <span>{skill.name}</span>
                <small>{skill.category}</small>
              </label>
            ))}
            {!skills.length && (
              <span className="muted-copy">
                Tambahkan skill terlebih dahulu untuk menghubungkannya.
              </span>
            )}
          </div>
        </Panel>
        <div className="form-grid">
          <SelectField label="Status" {...form.register('status')}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
          </SelectField>
          <TextField label="Jadwal terbit" type="datetime-local" {...form.register('publishAt')} />
          <TextField label="SEO title" {...form.register('seoTitle')} />
          <TextField label="SEO description" {...form.register('seoDescription')} />
          <label className="checkbox-field span-2">
            <input type="checkbox" {...form.register('featured')} />
            <span>Tampilkan sebagai project unggulan</span>
          </label>
        </div>
        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Menyimpan…'
              : project
                ? 'Simpan project'
                : 'Buat project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const projects = useList<ProjectRow>('projects', '/admin/projects');
  const skills = useList<SkillRow>('skills', '/admin/skills');
  const [editorProject, setEditorProject] = useState<ProjectRow | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const data = projects.data?.items ?? [];
  const visible =
    statusFilter === 'ALL' ? data : data.filter((item) => item.status === statusFilter);

  const save = async (
    project: ProjectRow | null,
    values: ProjectFormFields,
    image: File | null,
  ) => {
    let thumbnailUrl = values.thumbnailUrl || null;
    let images = project?.images ?? [];
    if (image) {
      const body = new FormData();
      body.append('file', image);
      const uploaded = await apiRequest<UploadedMedia>('/admin/media/upload', {
        method: 'POST',
        body,
      });
      thumbnailUrl = uploaded.url;
      images = [{ mediaId: uploaded.id, caption: values.title, order: 0 }];
    }
    const normalized = {
      ...values,
      slug: values.slug.trim() || undefined,
      thumbnailUrl,
      repoUrl: values.repoUrl || null,
      demoUrl: values.demoUrl || null,
      publishAt: values.publishAt ? new Date(values.publishAt).toISOString() : null,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
      ...(project ? (image ? { images } : {}) : { images }),
      order: project?.order ?? 0,
    };
    const parsed = (project ? ProjectUpdateSchema : ProjectCreateSchema).safeParse(normalized);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Periksa kembali data project.');
      return;
    }
    await apiJson(
      project ? `/admin/projects/${project.id}` : '/admin/projects',
      project ? 'PATCH' : 'POST',
      parsed.data,
    );
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
    toast.success(project ? 'Project diperbarui.' : 'Project berhasil dibuat.');
    setEditorOpen(false);
  };

  const reorder = useMutation({
    mutationFn: (ids: string[]) => apiJson('/admin/projects/reorder', 'PATCH', { projectIds: ids }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Urutan project diperbarui.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = data.map((item) => item.id);
    const next = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    void reorder.mutateAsync(next);
  };

  const columns = useMemo(() => {
    const column = createColumnHelper<ProjectRow>();
    return [
      column.accessor('title', {
        header: 'Project',
        cell: (info) => (
          <div className="project-cell">
            <span className="project-thumb">
              {info.row.original.thumbnailUrl ? (
                <img src={info.row.original.thumbnailUrl} alt="" />
              ) : (
                <FolderKanban size={17} />
              )}
            </span>
            <span>
              <strong>{info.getValue()}</strong>
              <small>/{info.row.original.slug}</small>
            </span>
          </div>
        ),
      }),
      column.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <StatusPill
            tone={
              info.getValue() === 'PUBLISHED'
                ? 'green'
                : info.getValue() === 'SCHEDULED'
                  ? 'amber'
                  : 'neutral'
            }
          >
            {info.getValue()}
          </StatusPill>
        ),
      }),
      column.accessor('viewCount', {
        header: 'Views',
        cell: (info) => (
          <span className="number-cell">{info.getValue().toLocaleString('id-ID')}</span>
        ),
      }),
      column.accessor('updatedAt', {
        header: 'Terakhir diubah',
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      }),
      column.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => (
          <div className="row-actions">
            <IconButton
              label="Edit project"
              onClick={() => {
                setEditorProject(info.row.original);
                setEditorOpen(true);
              }}
            >
              <Edit3 size={15} />
            </IconButton>
            <IconButton label="Hapus project" onClick={() => setDeleteTarget(info.row.original)}>
              <Trash2 size={15} />
            </IconButton>
          </div>
        ),
      }),
    ];
  }, []);

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/admin/projects/${deleteTarget.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project dihapus.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Project gagal dihapus.');
    } finally {
      setDeleting(false);
    }
  };

  if (projects.isLoading || skills.isLoading) return <LoadingState />;
  return (
    <>
      <PageHeader
        eyebrow="CONTENT / PORTFOLIO"
        title="Projects"
        description="Kelola studi kasus, urutan, status, dan visibilitas project."
        action={
          <Button
            onClick={() => {
              setEditorProject(null);
              setEditorOpen(true);
            }}
          >
            <Plus size={16} /> Project baru
          </Button>
        }
      />
      <ContentError
        error={
          (projects.error ?? skills.error) instanceof Error
            ? ((projects.error ?? skills.error) as Error)
            : null
        }
      />
      <div className="section-toolbar">
        <div className="filter-tabs">
          <button
            className={statusFilter === 'ALL' ? 'selected' : ''}
            onClick={() => setStatusFilter('ALL')}
          >
            Semua <span>{data.length}</span>
          </button>
          <button
            className={statusFilter === 'PUBLISHED' ? 'selected' : ''}
            onClick={() => setStatusFilter('PUBLISHED')}
          >
            Published
          </button>
          <button
            className={statusFilter === 'DRAFT' ? 'selected' : ''}
            onClick={() => setStatusFilter('DRAFT')}
          >
            Draft
          </button>
          <button
            className={statusFilter === 'SCHEDULED' ? 'selected' : ''}
            onClick={() => setStatusFilter('SCHEDULED')}
          >
            Scheduled
          </button>
        </div>
        <span className="muted-copy">{projects.data?.total ?? 0} project tersimpan</span>
      </div>
      <Panel
        title="Atur urutan"
        subtitle="Tarik dan lepas project untuk mengubah posisi di website."
        className="reorder-panel"
      >
        {data.length ? (
          <DndContext onDragEnd={onDragEnd}>
            <SortableContext
              items={data.map((project) => project.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="sort-list">
                {data.map((project) => (
                  <SortableProject key={project.id} project={project} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <EmptyState
            icon={<FolderKanban size={20} />}
            title="Belum ada project"
            description="Project baru akan tampil di daftar ini."
          />
        )}
      </Panel>
      <Panel title="Semua project" subtitle="Cari, sortir, dan kelola studi kasus">
        <DataTable
          data={visible}
          columns={tableColumns<ProjectRow>(columns)}
          searchPlaceholder="Cari judul atau slug…"
          emptyLabel="Tidak ada project untuk filter ini."
        />
      </Panel>
      {editorOpen && (
        <ProjectForm
          key={`${editorProject?.id ?? 'new'}`}
          project={editorProject}
          onClose={() => setEditorOpen(false)}
          skills={skills.data?.items ?? []}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus project?"
        description={`Project “${deleteTarget?.title ?? ''}” akan dihapus permanen.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
        busy={deleting}
      />
    </>
  );
}

function SkillForm({
  skill,
  onClose,
  onSave,
}: {
  skill: SkillRow | null;
  onClose: () => void;
  onSave: (skill: SkillInput, id?: string) => Promise<void>;
}) {
  const form = useForm<SkillInput>({
    defaultValues: {
      name: skill?.name ?? '',
      category: skill?.category ?? '',
      level: skill?.level ?? null,
      icon: skill?.icon ?? '',
    },
  });
  const submit = form.handleSubmit(async (values) => {
    const parsed = SkillInputSchema.safeParse({
      ...values,
      level: values.level === null ? null : Number(values.level),
      icon: values.icon || null,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Data skill tidak valid.');
      return;
    }
    await onSave(parsed.data, skill?.id);
  });
  return (
    <Modal open title={skill ? 'Edit skill' : 'Skill baru'} onClose={onClose}>
      <form className="form-stack dialog-form" onSubmit={(event) => void submit(event)}>
        <TextField label="Nama skill" placeholder="TypeScript" {...form.register('name')} />
        <TextField label="Kategori" placeholder="Frontend" {...form.register('category')} />
        <div className="form-grid">
          <TextField
            label="Level (0–100)"
            type="number"
            min={0}
            max={100}
            {...form.register('level', {
              setValueAs: (value: string) => (value === '' ? null : Number(value)),
            })}
          />
          <TextField
            label="Ikon"
            placeholder="typescript"
            hint="Nama ikon atau logo"
            {...form.register('icon')}
          />
        </div>
        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Menyimpan…' : 'Simpan skill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function SkillsPage() {
  const queryClient = useQueryClient();
  const query = useList<SkillRow>('skills', '/admin/skills');
  const [editor, setEditor] = useState<SkillRow | null | undefined>(undefined);
  const [removeTarget, setRemoveTarget] = useState<SkillRow | null>(null);
  const [busy, setBusy] = useState(false);
  const columns = useMemo(() => {
    const column = createColumnHelper<SkillRow>();
    return [
      column.accessor('name', {
        header: 'Nama skill',
        cell: (info) => <span className="cell-primary">{info.getValue()}</span>,
      }),
      column.accessor('category', { header: 'Kategori' }),
      column.accessor('level', {
        header: 'Level',
        cell: (info) =>
          info.getValue() === null ? (
            '—'
          ) : (
            <div className="level-cell">
              <span>
                <i style={{ width: `${info.getValue()}%` }} />
              </span>
              {info.getValue()}%
            </div>
          ),
      }),
      column.accessor('icon', { header: 'Ikon', cell: (info) => info.getValue() || '—' }),
      column.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => (
          <div className="row-actions">
            <IconButton label="Edit skill" onClick={() => setEditor(info.row.original)}>
              <Edit3 size={15} />
            </IconButton>
            <IconButton label="Hapus skill" onClick={() => setRemoveTarget(info.row.original)}>
              <Trash2 size={15} />
            </IconButton>
          </div>
        ),
      }),
    ];
  }, []);
  const save = async (body: SkillInput, id?: string) => {
    const parsed = SkillInputSchema.safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Data skill tidak valid.');
      return;
    }
    try {
      await apiJson(
        id ? `/admin/skills/${id}` : '/admin/skills',
        id ? 'PATCH' : 'POST',
        parsed.data,
      );
      await queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill tersimpan.');
      setEditor(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Skill gagal disimpan.');
    }
  };
  const remove = async () => {
    if (!removeTarget) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/skills/${removeTarget.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill dihapus.');
      setRemoveTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Skill gagal dihapus.');
    } finally {
      setBusy(false);
    }
  };
  if (query.isLoading) return <LoadingState />;
  return (
    <>
      <PageHeader
        eyebrow="CONTENT / STACK"
        title="Keahlian"
        description="Susun skill berdasarkan kategori dan level penguasaan."
        action={
          <Button onClick={() => setEditor(null)}>
            <Plus size={16} /> Tambah skill
          </Button>
        }
      />
      <ContentError error={query.error instanceof Error ? query.error : null} />
      <div className="mini-stats">
        <span>
          <Wrench size={16} /> <strong>{query.data?.total ?? 0}</strong> skill
        </span>
        <span>
          <span className="online-dot" /> Dikelompokkan berdasarkan kategori
        </span>
      </div>
      <Panel title="Daftar keahlian" subtitle="Klik judul kolom untuk mengurutkan">
        <DataTable
          data={query.data?.items ?? []}
          columns={tableColumns<SkillRow>(columns)}
          searchPlaceholder="Cari nama atau kategori…"
        />
      </Panel>
      {editor !== undefined && (
        <SkillForm
          key={editor?.id ?? 'new'}
          skill={editor}
          onClose={() => setEditor(undefined)}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Hapus skill?"
        description={`Skill “${removeTarget?.name ?? ''}” akan dihapus.`}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => void remove()}
        busy={busy}
      />
    </>
  );
}

function ExperienceForm({
  experience,
  onClose,
  onSave,
}: {
  experience: ExperienceRow | null;
  onClose: () => void;
  onSave: (input: ExperienceInput, id?: string) => Promise<void>;
}) {
  type ExperienceFormValues = Omit<ExperienceInput, 'startDate' | 'endDate'> & {
    startDate: string;
    endDate: string;
  };
  const form = useForm<ExperienceFormValues>({
    defaultValues: {
      type: (experience?.type as ExperienceInput['type']) ?? 'WORK',
      title: experience?.title ?? '',
      organization: experience?.organization ?? '',
      startDate: experience?.startDate
        ? new Date(experience.startDate).toISOString().slice(0, 16)
        : '',
      endDate: experience?.endDate ? new Date(experience.endDate).toISOString().slice(0, 16) : '',
      description: experience?.description ?? '',
      order: experience?.order ?? 0,
    },
  });
  const submit = form.handleSubmit(async (values) => {
    const parsed = ExperienceInputSchema.safeParse({
      ...values,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : '',
      endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
      order: Number(values.order),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Periksa kembali data pengalaman.');
      return;
    }
    await onSave(parsed.data, experience?.id);
  });
  return (
    <Modal open title={experience ? 'Edit pengalaman' : 'Pengalaman baru'} onClose={onClose}>
      <form className="form-stack dialog-form" onSubmit={(event) => void submit(event)}>
        <div className="form-grid">
          <SelectField label="Jenis" {...form.register('type')}>
            <option value="WORK">Pekerjaan</option>
            <option value="ORGANIZATION">Organisasi</option>
            <option value="EDUCATION">Pendidikan</option>
          </SelectField>
          <TextField
            label="Urutan"
            type="number"
            {...form.register('order', { valueAsNumber: true })}
          />
          <TextField label="Posisi / gelar" {...form.register('title')} />
          <TextField label="Organisasi" {...form.register('organization')} />
          <TextField label="Mulai" type="date" {...form.register('startDate')} />
          <TextField label="Selesai (opsional)" type="date" {...form.register('endDate')} />
        </div>
        <TextAreaField label="Deskripsi" rows={5} {...form.register('description')} />
        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={form.formState.isSubmitting}>Simpan pengalaman</Button>
        </div>
      </form>
    </Modal>
  );
}

export function ExperiencePage() {
  const queryClient = useQueryClient();
  const query = useList<ExperienceRow>('experiences', '/admin/experiences');
  const [editor, setEditor] = useState<ExperienceRow | null | undefined>(undefined);
  const [removeTarget, setRemoveTarget] = useState<ExperienceRow | null>(null);
  const [busy, setBusy] = useState(false);
  const columns = useMemo(() => {
    const column = createColumnHelper<ExperienceRow>();
    return [
      column.accessor('title', {
        header: 'Posisi / gelar',
        cell: (info) => (
          <div className="cell-stack">
            <strong>{info.getValue()}</strong>
            <small>{info.row.original.organization}</small>
          </div>
        ),
      }),
      column.accessor('type', {
        header: 'Jenis',
        cell: (info) => <StatusPill>{info.getValue()}</StatusPill>,
      }),
      column.accessor('startDate', {
        header: 'Periode',
        cell: (info) =>
          `${new Date(info.getValue()).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })} — ${info.row.original.endDate ? new Date(info.row.original.endDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Sekarang'}`,
      }),
      column.accessor('order', { header: 'Urutan' }),
      column.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => (
          <div className="row-actions">
            <IconButton label="Edit" onClick={() => setEditor(info.row.original)}>
              <Edit3 size={15} />
            </IconButton>
            <IconButton label="Hapus" onClick={() => setRemoveTarget(info.row.original)}>
              <Trash2 size={15} />
            </IconButton>
          </div>
        ),
      }),
    ];
  }, []);
  const save = async (input: ExperienceInput, id?: string) => {
    const parsed = ExperienceInputSchema.safeParse(input);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Data tidak valid.');
      return;
    }
    try {
      await apiJson(
        id ? `/admin/experiences/${id}` : '/admin/experiences',
        id ? 'PATCH' : 'POST',
        parsed.data,
      );
      await queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Pengalaman tersimpan.');
      setEditor(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan pengalaman.');
    }
  };
  const remove = async () => {
    if (!removeTarget) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/experiences/${removeTarget.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Pengalaman dihapus.');
      setRemoveTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus pengalaman.');
    } finally {
      setBusy(false);
    }
  };
  if (query.isLoading) return <LoadingState />;
  return (
    <>
      <PageHeader
        eyebrow="CONTENT / JOURNEY"
        title="Pengalaman"
        description="Perjalanan kerja, organisasi, dan pendidikan dalam satu timeline."
        action={
          <Button onClick={() => setEditor(null)}>
            <Plus size={16} /> Tambah pengalaman
          </Button>
        }
      />
      <ContentError error={query.error instanceof Error ? query.error : null} />
      <Panel title="Timeline pengalaman" subtitle={`${query.data?.total ?? 0} entri terdata`}>
        <DataTable
          data={query.data?.items ?? []}
          columns={tableColumns<ExperienceRow>(columns)}
          searchPlaceholder="Cari posisi atau organisasi…"
        />
      </Panel>
      {editor !== undefined && (
        <ExperienceForm
          key={editor?.id ?? 'new'}
          experience={editor}
          onClose={() => setEditor(undefined)}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Hapus pengalaman?"
        description={`Entri “${removeTarget?.title ?? ''}” akan dihapus.`}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => void remove()}
        busy={busy}
      />
    </>
  );
}

type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string;
  tags: string;
};
function BlogForm({
  post,
  onClose,
  onSave,
}: {
  post: PostRow | null;
  onClose: () => void;
  onSave: (post: PostRow | null, values: PostFormValues) => Promise<void>;
}) {
  const form = useForm<PostFormValues>({
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      content: post?.content ?? '',
      coverUrl: post?.coverUrl ?? '',
      status: post?.status ?? 'DRAFT',
      publishedAt: post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '',
      tags: post?.tags.join(', ') ?? '',
    },
  });
  const submit = form.handleSubmit(async (values) => onSave(post, values));
  return (
    <Modal open title={post ? 'Edit artikel' : 'Artikel baru'} onClose={onClose} wide>
      <form className="form-stack dialog-form" onSubmit={(event) => void submit(event)}>
        <div className="form-grid">
          <TextField label="Judul artikel" {...form.register('title')} />
          <TextField label="Slug" hint="Kosongkan untuk otomatis" {...form.register('slug')} />
          <TextAreaField
            label="Excerpt"
            rows={3}
            className="span-2"
            {...form.register('excerpt')}
          />
          <TextField label="Cover URL" {...form.register('coverUrl')} />
          <TextField
            label="Tag"
            placeholder="engineering, design"
            hint="Pisahkan dengan koma"
            {...form.register('tags')}
          />
          <SelectField label="Status" {...form.register('status')}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </SelectField>
          <TextField
            label="Tanggal publikasi"
            type="datetime-local"
            {...form.register('publishedAt')}
          />
        </div>
        <RichEditor
          label="Konten artikel"
          value={form.watch('content')}
          onChange={(value) => form.setValue('content', value)}
        />
        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={form.formState.isSubmitting}>Simpan artikel</Button>
        </div>
      </form>
    </Modal>
  );
}

export function BlogPage() {
  const queryClient = useQueryClient();
  const query = useList<PostRow>('posts', '/admin/posts');
  const [editor, setEditor] = useState<PostRow | null | undefined>(undefined);
  const [removeTarget, setRemoveTarget] = useState<PostRow | null>(null);
  const [busy, setBusy] = useState(false);
  const columns = useMemo(() => {
    const column = createColumnHelper<PostRow>();
    return [
      column.accessor('title', {
        header: 'Artikel',
        cell: (info) => (
          <div className="cell-stack">
            <strong>{info.getValue()}</strong>
            <small>/{info.row.original.slug}</small>
          </div>
        ),
      }),
      column.accessor('tags', {
        header: 'Tag',
        cell: (info) =>
          info.getValue().map((tag) => (
            <span className="tag-chip" key={tag}>
              {tag}
            </span>
          )),
      }),
      column.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <StatusPill tone={info.getValue() === 'PUBLISHED' ? 'green' : 'neutral'}>
            {info.getValue()}
          </StatusPill>
        ),
      }),
      column.accessor('updatedAt', {
        header: 'Diubah',
        cell: (info) => new Date(info.getValue()).toLocaleDateString('id-ID'),
      }),
      column.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => (
          <div className="row-actions">
            <IconButton label="Edit artikel" onClick={() => setEditor(info.row.original)}>
              <Edit3 size={15} />
            </IconButton>
            <IconButton label="Hapus artikel" onClick={() => setRemoveTarget(info.row.original)}>
              <Trash2 size={15} />
            </IconButton>
          </div>
        ),
      }),
    ];
  }, []);
  const save = async (post: PostRow | null, values: PostFormValues) => {
    const body = {
      title: values.title,
      slug: values.slug || undefined,
      excerpt: values.excerpt,
      content: values.content,
      coverUrl: values.coverUrl || null,
      status: values.status,
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : null,
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    const parsed = (post ? PostUpdateSchema : PostCreateSchema).safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Periksa kembali artikel.');
      return;
    }
    try {
      await apiJson(
        post ? `/admin/posts/${post.id}` : '/admin/posts',
        post ? 'PATCH' : 'POST',
        parsed.data,
      );
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Artikel tersimpan.');
      setEditor(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Artikel gagal disimpan.');
    }
  };
  const remove = async () => {
    if (!removeTarget) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/posts/${removeTarget.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Artikel dihapus.');
      setRemoveTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Artikel gagal dihapus.');
    } finally {
      setBusy(false);
    }
  };
  if (query.isLoading) return <LoadingState />;
  return (
    <>
      <PageHeader
        eyebrow="CONTENT / JOURNAL"
        title="Blog"
        description="Tulis catatan, studi teknis, dan cerita di balik proses."
        action={
          <Button onClick={() => setEditor(null)}>
            <Plus size={16} /> Tulis artikel
          </Button>
        }
      />
      <ContentError error={query.error instanceof Error ? query.error : null} />
      <Panel title="Artikel" subtitle="Tiptap rich text dengan status draft dan publish">
        <DataTable
          data={query.data?.items ?? []}
          columns={tableColumns<PostRow>(columns)}
          searchPlaceholder="Cari judul, tag, atau slug…"
        />
      </Panel>
      {editor !== undefined && (
        <BlogForm
          key={editor?.id ?? 'new'}
          post={editor}
          onClose={() => setEditor(undefined)}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Hapus artikel?"
        description={`Artikel “${removeTarget?.title ?? ''}” akan dihapus permanen.`}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => void remove()}
        busy={busy}
      />
    </>
  );
}

type ProfileFormValues = {
  headline: string;
  bio: string;
  photoUrl: string;
  cvUrl: string;
  location: string;
  availability: boolean;
  github: string;
  linkedin: string;
  website: string;
};
export function ProfilePage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiRequest<ProfileRow>('/admin/profile'),
    retry: false,
  });
  const profile = query.data;
  const form = useForm<ProfileFormValues>({
    values: {
      headline: profile?.headline ?? '',
      bio: profile?.bio ?? '',
      photoUrl: profile?.photoUrl ?? '',
      cvUrl: profile?.cvUrl ?? '',
      location: profile?.location ?? '',
      availability: profile?.availability ?? false,
      github: profile?.socialLinks?.github ?? '',
      linkedin: profile?.socialLinks?.linkedin ?? '',
      website: profile?.socialLinks?.website ?? '',
    },
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const save = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      let photoUrl = values.photoUrl || null;
      let cvUrl = values.cvUrl || null;
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploaded = await apiRequest<UploadedMedia>('/admin/media/upload', {
          method: 'POST',
          body: formData,
        });
        photoUrl = uploaded.url;
      }
      if (cvFile) {
        const formData = new FormData();
        formData.append('file', cvFile);
        const uploaded = await apiRequest<UploadedMedia>('/admin/media/upload', {
          method: 'POST',
          body: formData,
        });
        cvUrl = uploaded.url;
      }
      const socialLinks = Object.fromEntries(
        Object.entries({
          github: values.github,
          linkedin: values.linkedin,
          website: values.website,
        }).filter(([, value]) => value),
      );
      const parsed = ProfilePatchSchema.safeParse({
        headline: values.headline,
        bio: values.bio,
        photoUrl,
        cvUrl,
        location: values.location || null,
        availability: values.availability,
        socialLinks,
      });
      if (!parsed.success)
        throw new Error(parsed.error.issues[0]?.message ?? 'Profil tidak valid.');
      return apiJson('/admin/profile', 'PATCH', parsed.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil diperbarui.');
      setPhotoFile(null);
      setCvFile(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });
  if (query.isLoading) return <LoadingState />;
  const missingProfile =
    query.error instanceof Error && 'status' in query.error && query.error.status === 404;
  if (query.error && !missingProfile)
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : 'Profil gagal dimuat.'}
      />
    );
  return (
    <>
      <PageHeader
        eyebrow="IDENTITY / PROFILE"
        title="Profil"
        description="Informasi yang membentuk identitas publik portfolio."
        action={
          <span className={`availability-badge ${form.watch('availability') ? 'available' : ''}`}>
            <i /> {form.watch('availability') ? 'Open for work' : 'Tidak tersedia'}
          </span>
        }
      />
      <form
        className="profile-layout"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit((values) => save.mutateAsync(values))();
        }}
      >
        <div className="profile-main">
          <Panel title="Tentang kamu" subtitle="Headline dan bio yang tampil di website">
            <div className="form-stack">
              <TextField
                label="Headline"
                placeholder="Full-stack developer"
                {...form.register('headline')}
              />
              <TextAreaField label="Bio" rows={8} {...form.register('bio')} />
              <TextField
                label="Lokasi"
                placeholder="Jakarta, Indonesia"
                {...form.register('location')}
              />
            </div>
          </Panel>
          <Panel title="Tautan sosial" subtitle="Tambahkan link yang ingin ditampilkan">
            <div className="form-grid">
              <TextField
                label="GitHub"
                type="url"
                placeholder="https://github.com/username"
                {...form.register('github')}
              />
              <TextField
                label="LinkedIn"
                type="url"
                placeholder="https://linkedin.com/in/username"
                {...form.register('linkedin')}
              />
              <TextField
                label="Website"
                type="url"
                placeholder="https://example.com"
                {...form.register('website')}
              />
            </div>
          </Panel>
        </div>
        <aside className="profile-side">
          <Panel title="Foto profil">
            <div className="profile-photo-preview">
              {form.watch('photoUrl') ? (
                <img src={form.watch('photoUrl')} alt="Preview foto profil" />
              ) : (
                <span>{form.watch('headline')?.slice(0, 1) || 'R'}</span>
              )}
            </div>
            <label className="upload-control full-upload">
              <Upload size={15} />
              {photoFile?.name ?? 'Upload foto'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </Panel>
          <Panel title="Resume / CV">
            <div className="cv-card">
              <FileText size={19} />
              <span>
                <strong>
                  {cvFile?.name ?? (form.watch('cvUrl') ? 'CV tersimpan' : 'Belum ada CV')}
                </strong>
                <small>PDF, maksimal 10 MB</small>
              </span>
            </div>
            <label className="upload-control full-upload">
              <Upload size={15} />
              Pilih file PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </Panel>
          <Panel title="Ketersediaan">
            <label className="toggle-row">
              <span>
                <strong>Open for work</strong>
                <small>Tampilkan badge di website publik</small>
              </span>
              <input className="toggle" type="checkbox" {...form.register('availability')} />
            </label>
          </Panel>
        </aside>
        <div className="profile-save">
          <span>Perubahan akan tampil setelah disimpan.</span>
          <Button disabled={save.isPending}>
            {save.isPending ? 'Menyimpan…' : 'Simpan profil'}
          </Button>
        </div>
      </form>
    </>
  );
}

export function MediaPage() {
  const queryClient = useQueryClient();
  const query = useList<MediaRow>('media', '/admin/media');
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState<MediaRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const rows = (query.data?.items ?? []).filter(
    (item) =>
      item.publicId.toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase()),
  );
  const upload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10 MB.');
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      await apiRequest('/admin/media/upload', { method: 'POST', body });
      await queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('File berhasil diunggah.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload gagal.');
    } finally {
      setUploading(false);
    }
  };
  const remove = async () => {
    if (!removeTarget) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/media/${removeTarget.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media dihapus.');
      setRemoveTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Media gagal dihapus.');
    } finally {
      setBusy(false);
    }
  };
  if (query.isLoading) return <LoadingState />;
  return (
    <>
      <PageHeader
        eyebrow="LIBRARY / ASSETS"
        title="Media Library"
        description="Satu tempat untuk gambar project, foto profil, dan dokumen CV."
        action={
          <label className={`button button-primary ${uploading ? 'disabled' : ''}`}>
            <Upload size={16} />
            {uploading ? 'Mengunggah…' : 'Upload media'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.currentTarget.value = '';
              }}
            />
          </label>
        }
      />
      <ContentError error={query.error instanceof Error ? query.error : null} />
      <div className="media-toolbar">
        <div className="media-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau URL media…"
          />
        </div>
        <span>{query.data?.total ?? 0} file · maks. 10 MB/file</span>
      </div>
      <div className="media-grid">
        {rows.map((item) => (
          <article className="media-card" key={item.id}>
            <div className="media-preview">
              {item.type === 'IMAGE' ? (
                <img src={item.url} alt={item.publicId} loading="lazy" />
              ) : (
                <div className="document-preview">
                  <FileText size={27} />
                  <span>PDF</span>
                </div>
              )}
              <button
                className="media-remove"
                aria-label={`Hapus ${item.publicId}`}
                onClick={() => setRemoveTarget(item)}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="media-info">
              <strong title={item.publicId}>{item.publicId.split('/').at(-1)}</strong>
              <span>
                {(item.size / 1024).toFixed(0)} KB <i>·</i>{' '}
                {new Date(item.createdAt).toLocaleDateString('id-ID')}
              </span>
              <button
                className="copy-link"
                onClick={() => {
                  void navigator.clipboard.writeText(item.url);
                  toast.success('URL media disalin.');
                }}
              >
                <Link2 size={13} /> Salin URL
              </button>
            </div>
          </article>
        ))}
        {!rows.length && (
          <div className="media-empty">
            <EmptyState
              icon={<ImagePlus size={21} />}
              title={search ? 'Media tidak ditemukan' : 'Library masih kosong'}
              description={
                search
                  ? 'Coba kata kunci lain.'
                  : 'Upload gambar atau PDF untuk mulai mengisi library.'
              }
            />
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Hapus media?"
        description={`“${removeTarget?.publicId ?? ''}” akan dihapus. Media yang terhubung ke galeri proyek perlu dilepas terlebih dahulu.`}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => void remove()}
        busy={busy}
      />
    </>
  );
}

type InboxTab = 'messages' | 'guestbook' | 'testimonials' | 'subscribers';

function TestimonialForm({
  testimonial,
  onClose,
  onSave,
}: {
  testimonial: TestimonialRow | null;
  onClose: () => void;
  onSave: (
    value: { authorName: string; authorRole?: string | null; message: string; approved: boolean },
    id: string | null,
  ) => Promise<void>;
}) {
  const form = useForm<{
    authorName: string;
    authorRole: string;
    message: string;
    approved: boolean;
  }>({
    defaultValues: {
      authorName: testimonial?.authorName ?? '',
      authorRole: testimonial?.authorRole ?? '',
      message: testimonial?.message ?? '',
      approved: testimonial?.approved ?? false,
    },
  });
  const submit = form.handleSubmit(async (value) => {
    const parsed = TestimonialInputSchema.safeParse({
      ...value,
      authorRole: value.authorRole || null,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Testimoni tidak valid.');
      return;
    }
    await onSave(parsed.data, testimonial?.id ?? null);
  });
  return (
    <Modal open title={testimonial ? 'Edit testimoni' : 'Testimoni baru'} onClose={onClose}>
      <form className="form-stack dialog-form" onSubmit={(event) => void submit(event)}>
        <TextField label="Nama penulis" {...form.register('authorName')} />
        <TextField label="Peran / organisasi" {...form.register('authorRole')} />
        <TextAreaField label="Isi testimoni" rows={5} {...form.register('message')} />
        <label className="checkbox-field">
          <input type="checkbox" {...form.register('approved')} />
          <span>Langsung tampil di website</span>
        </label>
        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={form.formState.isSubmitting}>
            {testimonial ? 'Simpan perubahan' : 'Buat testimoni'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function InboxPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<InboxTab>('messages');
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialRow | null | undefined>(
    undefined,
  );
  const [selectedMessage, setSelectedMessage] = useState<MessageRow | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
    endpoint: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const messages = useList<MessageRow>('messages', '/admin/messages');
  const guestbook = useList<GuestbookRow>('guestbook-admin', '/admin/guestbook');
  const testimonials = useList<TestimonialRow>('testimonials-admin', '/admin/testimonials');
  const subscribers = useList<SubscriberRow>('subscribers', '/admin/subscribers');
  const invalidate = async () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['messages'] }),
      queryClient.invalidateQueries({ queryKey: ['guestbook-admin'] }),
      queryClient.invalidateQueries({ queryKey: ['testimonials-admin'] }),
      queryClient.invalidateQueries({ queryKey: ['subscribers'] }),
    ]);
  const update = async (path: string, body: unknown, success: string) => {
    try {
      await apiJson(path, 'PATCH', body);
      await invalidate();
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Perubahan gagal.');
    }
  };
  const reply = async () => {
    if (!selectedMessage) return;
    try {
      await apiJson(`/admin/messages/${selectedMessage.id}/reply`, 'POST', {
        message: replyMessage,
      });
      toast.success('Balasan email terkirim.');
      setSelectedMessage(null);
      setReplyMessage('');
      await invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Email gagal dikirim.');
    }
  };
  const remove = async () => {
    if (!removeTarget) return;
    setBusy(true);
    try {
      await apiRequest(`${removeTarget.endpoint}/${removeTarget.id}`, { method: 'DELETE' });
      await invalidate();
      toast.success('Item dihapus.');
      setRemoveTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Item gagal dihapus.');
    } finally {
      setBusy(false);
    }
  };
  const saveTestimonial = async (
    value: { authorName: string; authorRole?: string | null; message: string; approved: boolean },
    id: string | null,
  ) => {
    try {
      await apiJson(
        id ? `/admin/testimonials/${id}` : '/admin/testimonials',
        id ? 'PATCH' : 'POST',
        value,
      );
      await invalidate();
      setEditingTestimonial(undefined);
      toast.success(id ? 'Testimoni diperbarui.' : 'Testimoni dibuat.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Testimoni gagal disimpan.');
    }
  };
  if (messages.isLoading || guestbook.isLoading || testimonials.isLoading || subscribers.isLoading)
    return <LoadingState />;
  const unread = messages.data?.unread ?? 0;
  const messageColumns = (() => {
    const column = createColumnHelper<MessageRow>();
    return [
      column.accessor('name', {
        header: 'Pengirim',
        cell: (info) => (
          <button
            className={`table-link ${info.row.original.isRead ? '' : 'unread-link'}`}
            onClick={() => {
              setSelectedMessage(info.row.original);
              if (!info.row.original.isRead)
                void update(
                  `/admin/messages/${info.row.original.id}`,
                  { isRead: true },
                  'Pesan ditandai dibaca.',
                );
            }}
          >
            {info.getValue()}
            <small>{info.row.original.email}</small>
          </button>
        ),
      }),
      column.accessor('subject', { header: 'Subjek' }),
      column.accessor('createdAt', {
        header: 'Diterima',
        cell: (info) => new Date(info.getValue()).toLocaleDateString('id-ID'),
      }),
      column.accessor('isArchived', {
        header: 'Status',
        cell: (info) => (
          <StatusPill
            tone={info.getValue() ? 'neutral' : info.row.original.isRead ? 'green' : 'amber'}
          >
            {info.getValue() ? 'Diarsipkan' : info.row.original.isRead ? 'Dibaca' : 'Baru'}
          </StatusPill>
        ),
      }),
      column.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => (
          <div className="row-actions">
            <IconButton
              label={info.row.original.isArchived ? 'Buka arsip' : 'Arsipkan'}
              onClick={() =>
                void update(
                  `/admin/messages/${info.row.original.id}`,
                  { isArchived: !info.row.original.isArchived },
                  info.row.original.isArchived ? 'Pesan dipulihkan.' : 'Pesan diarsipkan.',
                )
              }
            >
              <Inbox size={15} />
            </IconButton>
            <IconButton
              label="Balas email"
              onClick={() => {
                setSelectedMessage(info.row.original);
                setReplyMessage('');
              }}
            >
              <Mail size={15} />
            </IconButton>
          </div>
        ),
      }),
    ];
  })();
  const guestbookColumns = (() => {
    const column = createColumnHelper<GuestbookRow>();
    return [
      column.accessor('name', {
        header: 'Nama',
        cell: (info) => <span className="cell-primary">{info.getValue()}</span>,
      }),
      column.accessor('message', {
        header: 'Pesan',
        cell: (info) => <span className="message-preview">{info.getValue()}</span>,
      }),
      column.accessor('approved', {
        header: 'Status',
        cell: (info) => (
          <StatusPill tone={info.getValue() ? 'green' : 'amber'}>
            {info.getValue() ? 'Tayang' : 'Menunggu'}
          </StatusPill>
        ),
      }),
      column.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => (
          <div className="row-actions">
            <Button
              variant="ghost"
              onClick={() =>
                void update(
                  `/admin/guestbook/${info.row.original.id}`,
                  { approved: !info.row.original.approved },
                  info.row.original.approved ? 'Guestbook disembunyikan.' : 'Guestbook disetujui.',
                )
              }
            >
              {info.row.original.approved ? 'Sembunyikan' : 'Setujui'}
            </Button>
            <IconButton
              label="Hapus"
              onClick={() =>
                setRemoveTarget({
                  id: info.row.original.id,
                  name: info.row.original.name,
                  endpoint: '/admin/guestbook',
                })
              }
            >
              <Trash2 size={15} />
            </IconButton>
          </div>
        ),
      }),
    ];
  })();
  const testimonialColumns = (() => {
    const column = createColumnHelper<TestimonialRow>();
    return [
      column.accessor('authorName', {
        header: 'Penulis',
        cell: (info) => (
          <div className="cell-stack">
            <strong>{info.getValue()}</strong>
            <small>{info.row.original.authorRole || '—'}</small>
          </div>
        ),
      }),
      column.accessor('message', {
        header: 'Testimoni',
        cell: (info) => <span className="message-preview">{info.getValue()}</span>,
      }),
      column.accessor('approved', {
        header: 'Status',
        cell: (info) => (
          <StatusPill tone={info.getValue() ? 'green' : 'amber'}>
            {info.getValue() ? 'Tayang' : 'Menunggu'}
          </StatusPill>
        ),
      }),
      column.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => (
          <div className="row-actions">
            <Button
              variant="ghost"
              onClick={() =>
                void update(
                  `/admin/testimonials/${info.row.original.id}`,
                  { approved: !info.row.original.approved },
                  'Moderasi testimoni disimpan.',
                )
              }
            >
              {info.row.original.approved ? 'Sembunyikan' : 'Setujui'}
            </Button>
            <IconButton
              label="Edit testimoni"
              onClick={() => setEditingTestimonial(info.row.original)}
            >
              <Edit3 size={15} />
            </IconButton>
            <IconButton
              label="Hapus"
              onClick={() =>
                setRemoveTarget({
                  id: info.row.original.id,
                  name: info.row.original.authorName,
                  endpoint: '/admin/testimonials',
                })
              }
            >
              <Trash2 size={15} />
            </IconButton>
          </div>
        ),
      }),
    ];
  })();
  const subscriberColumns = (() => {
    const column = createColumnHelper<SubscriberRow>();
    return [
      column.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="cell-primary">{info.getValue()}</span>,
      }),
      column.accessor('confirmedAt', {
        header: 'Status',
        cell: (info) => (
          <StatusPill tone={info.getValue() ? 'green' : 'amber'}>
            {info.getValue() ? 'Terkonfirmasi' : 'Menunggu'}
          </StatusPill>
        ),
      }),
      column.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => (
          <IconButton
            label="Hapus subscriber"
            onClick={() =>
              setRemoveTarget({
                id: info.row.original.id,
                name: info.row.original.email,
                endpoint: '/admin/subscribers',
              })
            }
          >
            <Trash2 size={15} />
          </IconButton>
        ),
      }),
    ];
  })();
  return (
    <>
      <PageHeader
        eyebrow="COMMUNITY / CONVERSATION"
        title="Inbox"
        description="Pesan, guestbook, testimoni, dan subscriber dalam satu ruang."
        action={
          <div className="page-actions-inline">
            {tab === 'testimonials' && (
              <Button onClick={() => setEditingTestimonial(null)}>
                <Plus size={15} /> Tambah testimoni
              </Button>
            )}
            <span className="inbox-unread">
              <i /> {unread} belum dibaca
            </span>
          </div>
        }
      />
      <div className="inbox-tabs">
        {(
          [
            { id: 'messages', label: 'Pesan', count: messages.data?.total ?? 0, icon: Mail },
            {
              id: 'guestbook',
              label: 'Guestbook',
              count: guestbook.data?.total ?? 0,
              icon: MessageSquareQuoteIcon,
            },
            {
              id: 'testimonials',
              label: 'Testimoni',
              count: testimonials.data?.total ?? 0,
              icon: BadgeCheckIcon,
            },
            {
              id: 'subscribers',
              label: 'Subscriber',
              count: subscribers.data?.total ?? 0,
              icon: UsersRound,
            },
          ] as const
        ).map(({ id, label, count, icon: Icon }) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            <Icon size={15} />
            {label}
            <span>{count}</span>
          </button>
        ))}
      </div>
      <Panel
        title={
          tab === 'messages'
            ? 'Pesan masuk'
            : tab === 'guestbook'
              ? 'Entri guestbook'
              : tab === 'testimonials'
                ? 'Testimoni'
                : 'Newsletter subscribers'
        }
        subtitle={
          tab === 'messages'
            ? 'Baca pesan atau kirim balasan via email.'
            : tab === 'guestbook'
              ? 'Setujui pesan sebelum tampil di website.'
              : tab === 'testimonials'
                ? 'Moderasi testimoni yang dikirim pengunjung.'
                : 'Alamat email yang mendaftar dari website.'
        }
      >
        {tab === 'messages' ? (
          <DataTable
            data={messages.data?.items ?? []}
            columns={tableColumns<MessageRow>(messageColumns)}
            searchPlaceholder="Cari pengirim, email, subjek…"
            emptyLabel="Belum ada pesan masuk."
          />
        ) : tab === 'guestbook' ? (
          <DataTable
            data={guestbook.data?.items ?? []}
            columns={tableColumns<GuestbookRow>(guestbookColumns)}
            searchPlaceholder="Cari nama atau pesan…"
            emptyLabel="Belum ada entri guestbook."
          />
        ) : tab === 'testimonials' ? (
          <DataTable
            data={testimonials.data?.items ?? []}
            columns={tableColumns<TestimonialRow>(testimonialColumns)}
            searchPlaceholder="Cari penulis atau isi testimoni…"
            emptyLabel="Belum ada testimoni."
          />
        ) : (
          <DataTable
            data={subscribers.data?.items ?? []}
            columns={tableColumns<SubscriberRow>(subscriberColumns)}
            searchPlaceholder="Cari alamat email…"
            emptyLabel="Belum ada subscriber."
          />
        )}
      </Panel>
      <Modal
        open={Boolean(selectedMessage)}
        title="Pesan masuk"
        onClose={() => setSelectedMessage(null)}
      >
        <div className="dialog-body">
          <div className="message-detail-meta">
            <strong>{selectedMessage?.name}</strong>
            <span>{selectedMessage?.email}</span>
            <small>
              {selectedMessage?.subject} ·{' '}
              {selectedMessage?.createdAt
                ? new Date(selectedMessage.createdAt).toLocaleString('id-ID')
                : ''}
            </small>
          </div>
          <div className="message-detail-body">{selectedMessage?.message}</div>
          <TextAreaField
            label="Balasan email"
            rows={6}
            placeholder="Tulis balasan yang akan dikirim ke pengirim…"
            value={replyMessage}
            onChange={(event) => setReplyMessage(event.target.value)}
          />
          <div className="dialog-actions">
            <Button variant="secondary" onClick={() => setSelectedMessage(null)}>
              Tutup
            </Button>
            <Button onClick={() => void reply()} disabled={!replyMessage.trim()}>
              <Mail size={15} /> Kirim balasan
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Hapus data?"
        description={`“${removeTarget?.name ?? ''}” akan dihapus permanen.`}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => void remove()}
        busy={busy}
      />
      {editingTestimonial !== undefined && (
        <TestimonialForm
          key={editingTestimonial?.id ?? 'new-testimonial'}
          testimonial={editingTestimonial}
          onClose={() => setEditingTestimonial(undefined)}
          onSave={saveTestimonial}
        />
      )}
    </>
  );
}

function MessageSquareQuoteIcon(props: { size?: number }) {
  return <MessageSquareQuote size={props.size ?? 16} />;
}
function BadgeCheckIcon(props: { size?: number }) {
  return <BadgeCheck size={props.size ?? 16} />;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        className="toggle"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiRequest<SettingRow[]>('/admin/settings'),
  });
  const values = new Map((query.data ?? []).map((setting) => [setting.key, setting.value]));
  const featureValue = values.get('features');
  const features: Record<string, unknown> = isObject(featureValue) ? featureValue : {};
  const form = useForm<SettingsFormValues>({
    values: {
      siteTitle:
        typeof values.get('site_title') === 'string' ? (values.get('site_title') as string) : '',
      seoDescription:
        typeof values.get('seo_description') === 'string'
          ? (values.get('seo_description') as string)
          : '',
      accent: typeof values.get('theme') === 'string' ? (values.get('theme') as string) : '#78d8bb',
      blog: features.blog === true,
      guestbook: features.guestbook !== false,
      chatbot: features.chatbot === true,
      commandPalette: features.commandPalette !== false,
      customCursor: features.customCursor === true,
      pageTransitions: features.pageTransitions !== false,
      scrollProgress: features.scrollProgress !== false,
      githubActivity: features.githubActivity === true,
      cvPdf: features.cvPdf !== false,
      dynamicOg: features.dynamicOg !== false,
      projectReactions: features.projectReactions !== false,
      guestbookRealtime: features.guestbookRealtime !== false,
      newsletter: features.newsletter === true,
      openForWork: features.openForWork !== false,
      viewCounter: features.viewCounter !== false,
      easterEgg: features.easterEgg !== false,
    },
  });
  const save = useMutation({
    mutationFn: async (input: SettingsFormValues) => {
      const settings = {
        site_title: input.siteTitle,
        seo_description: input.seoDescription,
        theme: input.accent,
        features: {
          blog: input.blog,
          guestbook: input.guestbook,
          chatbot: input.chatbot,
          commandPalette: input.commandPalette,
          customCursor: input.customCursor,
          pageTransitions: input.pageTransitions,
          scrollProgress: input.scrollProgress,
          githubActivity: input.githubActivity,
          cvPdf: input.cvPdf,
          dynamicOg: input.dynamicOg,
          projectReactions: input.projectReactions,
          guestbookRealtime: input.guestbookRealtime,
          newsletter: input.newsletter,
          openForWork: input.openForWork,
          viewCounter: input.viewCounter,
          easterEgg: input.easterEgg,
        },
      };
      const parsed = SiteSettingsPatchSchema.safeParse({ settings });
      if (!parsed.success)
        throw new Error(parsed.error.issues[0]?.message ?? 'Pengaturan tidak valid.');
      return apiJson('/admin/settings', 'PATCH', parsed.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Pengaturan situs disimpan.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
  if (query.isLoading) return <LoadingState />;
  if (query.error)
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : 'Pengaturan gagal dimuat.'}
      />
    );
  return (
    <>
      <PageHeader
        eyebrow="SYSTEM / CONFIGURATION"
        title="Pengaturan situs"
        description="Atur metadata, identitas visual, dan fitur yang aktif di website."
        action={<StatusPill tone="green">Tersinkron</StatusPill>}
      />
      <form
        className="settings-layout"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit((input) => save.mutateAsync(input))();
        }}
      >
        <div className="settings-main">
          <Panel
            title="Identitas website"
            subtitle="Informasi dasar untuk tab browser dan mesin pencari"
          >
            <div className="form-stack">
              <TextField
                label="Judul situs"
                placeholder="Rafi Budiansyah — Developer"
                {...form.register('siteTitle')}
              />
              <TextAreaField
                label="Deskripsi SEO"
                rows={4}
                maxLength={320}
                hint="Deskripsi singkat yang tampil pada hasil pencarian."
                {...form.register('seoDescription')}
              />
            </div>
          </Panel>
          <Panel title="Aksen warna" subtitle="Warna digunakan pada tombol dan elemen interaktif.">
            <div className="accent-control">
              <input type="color" aria-label="Pilih warna aksen" {...form.register('accent')} />
              <TextField label="Kode hex" {...form.register('accent')} />
              <span className="accent-preview" style={{ background: form.watch('accent') }} />
            </div>
            <div className="palette-suggestions">
              {['#78d8bb', '#92a9ff', '#df9ffa', '#f7bd78'].map((color) => (
                <button
                  type="button"
                  key={color}
                  style={{ '--swatch': color } as CSSProperties}
                  onClick={() => form.setValue('accent', color)}
                  aria-label={`Pilih aksen ${color}`}
                />
              ))}
            </div>
          </Panel>
        </div>
        <aside className="settings-side">
          <Panel title="Fitur website" subtitle="Aktif/nonaktifkan area publik">
            <SettingToggle
              label="Blog"
              description="Tampilkan artikel dan RSS blog."
              checked={form.watch('blog')}
              onChange={(value) => form.setValue('blog', value)}
            />
            <SettingToggle
              label="Guestbook"
              description="Izinkan pengunjung meninggalkan pesan."
              checked={form.watch('guestbook')}
              onChange={(value) => form.setValue('guestbook', value)}
            />
            <SettingToggle
              label="Chatbot"
              description="Aktifkan asisten tanya tentang saya."
              checked={form.watch('chatbot')}
              onChange={(value) => form.setValue('chatbot', value)}
            />
            {(
              [
                ['commandPalette', 'Command palette', 'Navigasi cepat lewat Cmd/Ctrl+K.'],
                [
                  'customCursor',
                  'Custom cursor & magnetic button',
                  'Efek pointer untuk perangkat dengan mouse.',
                ],
                ['pageTransitions', 'Page transition', 'Transisi halus saat pindah halaman.'],
                ['scrollProgress', 'Scroll progress', 'Indikator posisi baca di bagian atas.'],
                ['githubActivity', 'GitHub activity', 'Ringkasan repository dari GitHub API.'],
                ['cvPdf', 'CV PDF', 'Tampilkan versi CV siap cetak / simpan PDF.'],
                [
                  'dynamicOg',
                  'Dynamic Open Graph',
                  'Gambar pratinjau dinamis untuk proyek dan artikel.',
                ],
                ['projectReactions', 'Reaksi proyek', 'Izinkan pengunjung memberi reaksi emoji.'],
                [
                  'guestbookRealtime',
                  'Guestbook realtime',
                  'Streaming pesan baru yang sudah dimoderasi.',
                ],
                ['newsletter', 'Newsletter', 'Form subscribe dengan konfirmasi email.'],
                ['openForWork', 'Badge Open for work', 'Tampilkan status ketersediaan di hero.'],
                ['viewCounter', 'Counter views', 'Catat kunjungan proyek secara anonim.'],
                ['easterEgg', 'Easter egg', 'Aktifkan kejutan keyboard ringan.'],
              ] as const
            ).map(([key, label, description]) => (
              <SettingToggle
                key={key}
                label={label}
                description={description}
                checked={form.watch(key)}
                onChange={(value) => form.setValue(key, value)}
              />
            ))}
          </Panel>
          <Panel title="Mode tampilan">
            <div className="theme-summary">
              <span className="theme-swatch">
                <i />
                <i />
                <i />
              </span>
              <span>
                <strong>Dark / Light</strong>
                <small>Pengunjung dapat memilih tema.</small>
              </span>
              <StatusPill tone="green">Aktif</StatusPill>
            </div>
          </Panel>
        </aside>
        <div className="settings-save">
          <span>Perubahan disimpan langsung ke SiteSetting di database.</span>
          <Button disabled={save.isPending}>
            {save.isPending ? 'Menyimpan…' : 'Simpan pengaturan'}
          </Button>
        </div>
      </form>
    </>
  );
}

export function AuditLogsPage() {
  const query = useList<AuditRow>('audit-logs', '/admin/audit-logs');
  const columns = useMemo(() => {
    const column = createColumnHelper<AuditRow>();
    return [
      column.accessor('createdAt', {
        header: 'Waktu',
        cell: (info) => (
          <div className="cell-stack">
            <strong>{new Date(info.getValue()).toLocaleDateString('id-ID')}</strong>
            <small>
              {new Date(info.getValue()).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </small>
          </div>
        ),
      }),
      column.accessor('user', {
        header: 'Admin',
        cell: (info) => info.getValue()?.name ?? 'System',
      }),
      column.accessor('action', {
        header: 'Aktivitas',
        cell: (info) => (
          <StatusPill
            tone={
              info.getValue().includes('DELETE')
                ? 'red'
                : info.getValue().includes('CREATE') || info.getValue().includes('PUBLISH')
                  ? 'green'
                  : 'neutral'
            }
          >
            {info.getValue()}
          </StatusPill>
        ),
      }),
      column.accessor('entity', { header: 'Konten' }),
      column.accessor('entityId', {
        header: 'ID entri',
        cell: (info) => <code className="id-code">{info.getValue() ?? '—'}</code>,
      }),
      column.accessor('meta', {
        header: 'Detail',
        enableSorting: false,
        cell: (info) => (
          <span className="audit-meta" title={JSON.stringify(info.getValue())}>
            {JSON.stringify(info.getValue())}
          </span>
        ),
      }),
    ];
  }, []);
  if (query.isLoading) return <LoadingState />;
  return (
    <>
      <PageHeader
        eyebrow="SYSTEM / TRACEABILITY"
        title="Audit log"
        description="Riwayat perubahan konten dan tindakan admin."
        action={
          <span className="audit-secure">
            <ShieldCheck size={15} /> ADMIN ONLY
          </span>
        }
      />
      <ContentError error={query.error instanceof Error ? query.error : null} />
      <div className="audit-summary">
        <span className="audit-summary-icon">
          <Activity size={17} />
        </span>
        <div>
          <strong>{query.data?.total ?? 0} aktivitas tercatat</strong>
          <small>Setiap mutasi admin disimpan bersama waktu dan konteks perubahan.</small>
        </div>
      </div>
      <Panel title="Aktivitas terbaru" subtitle="Klik header untuk mengurutkan riwayat">
        <DataTable
          data={query.data?.items ?? []}
          columns={tableColumns<AuditRow>(columns)}
          searchPlaceholder="Cari aksi, entity, atau admin…"
        />
      </Panel>
    </>
  );
}
