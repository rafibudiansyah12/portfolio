import { ImageResponse } from 'next/og';
import { apiGet, safeGet, type Project, type SiteSettings } from '../../../lib/api';

export const alt = 'Project case study';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    apiGet<Project>(`/projects/${encodeURIComponent(slug)}`, 300).catch(() => null),
    safeGet<SiteSettings>('/settings/public', [], 300),
  ]);
  const featureSetting = settings.find((setting) => setting.key === 'features')?.value;
  const enabled =
    typeof featureSetting !== 'object' ||
    featureSetting === null ||
    !('dynamicOg' in featureSetting) ||
    featureSetting.dynamicOg !== false;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        color: '#eff8f4',
        background: 'linear-gradient(135deg,#111a19,#263b35)',
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: 8, color: '#a4f0d1' }}>
        RAFI BUDIANSYAH · PORTFOLIO
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
          {enabled ? (project?.title ?? 'Selected project') : 'Selected project'}
        </div>
        <div style={{ fontSize: 30, color: '#b4c7bf' }}>
          {enabled ? (project?.summary ?? 'Case study') : 'Case study'}
        </div>
      </div>
      <div style={{ fontSize: 22, color: '#a4f0d1' }}>PROJECT / CASE STUDY</div>
    </div>,
    size,
  );
}
