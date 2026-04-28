'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  RefreshCw,
  Rocket,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { Textarea } from '@/components/atoms/textarea';
import { ReleaseRow } from '@/components/molecules/ReleaseRow';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  Project,
  ProjectConfigRevision,
  PublishValidationResponse,
  Release,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';

interface PublishWorkspaceProps {
  projectId: string;
}

const STATUS_TONE: Record<string, string> = {
  draft: 'bg-neutral-200 text-neutral-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-neutral-100 text-neutral-500',
};

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function StatusCard({
  project,
  active,
  configRevision,
  onRefresh,
  refreshing,
}: {
  project: Project | null;
  active: Release | null;
  configRevision: ProjectConfigRevision | null;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const tone =
    (project?.status && STATUS_TONE[project.status]) ??
    'bg-neutral-200 text-neutral-700';

  return (
    <section className='border-border bg-background flex flex-col gap-4 rounded-xl border p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
            Current state
          </p>
          <h2 className='text-foreground mt-1 text-xl font-semibold'>
            {project?.name ?? '—'}
          </h2>
          <div className='mt-2 flex items-center gap-2'>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${tone}`}
            >
              {project?.status ?? '—'}
            </span>
            {active ? (
              <Badge variant='secondary' className='gap-1'>
                <Globe className='size-3' /> Live · #{active.release_no}
              </Badge>
            ) : (
              <Badge variant='outline'>Not published</Badge>
            )}
          </div>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <dl className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <div>
          <dt className='text-muted-foreground text-xs'>Last publish</dt>
          <dd className='text-foreground mt-0.5 text-sm font-medium'>
            {formatDate(active?.published_at)}
          </dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs'>Active URL</dt>
          <dd className='mt-0.5 text-sm font-medium'>
            {active?.page_url ? (
              <a
                href={active.page_url}
                target='_blank'
                rel='noreferrer noopener'
                className='text-primary inline-flex items-center gap-1 hover:underline'
              >
                Open <ExternalLink className='size-3' />
              </a>
            ) : (
              <span className='text-muted-foreground'>—</span>
            )}
          </dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs'>Working revision</dt>
          <dd className='text-foreground mt-0.5 truncate text-sm font-medium'>
            {configRevision
              ? `#${configRevision.revision_no}`
              : 'No config yet'}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function ValidationPanel({
  result,
  loading,
  onValidate,
}: {
  result: PublishValidationResponse | null;
  loading: boolean;
  onValidate: () => void;
}) {
  return (
    <section className='border-border bg-background flex flex-col gap-3 rounded-xl border p-5'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h3 className='text-foreground text-base font-semibold'>
            Pre-flight checks
          </h3>
          <p className='text-muted-foreground text-xs'>
            Validate the current configuration before publishing.
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={onValidate}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size={14} /> Validating…
            </>
          ) : (
            <>
              <ShieldAlert className='size-3.5' /> Run validation
            </>
          )}
        </Button>
      </div>

      {!result && !loading && (
        <p className='text-muted-foreground text-xs italic'>
          Not run yet — click{' '}
          <span className='font-medium'>Run validation</span>.
        </p>
      )}

      {result && (
        <div className='flex flex-col gap-2'>
          <div
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
              result.ready
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            )}
          >
            {result.ready ? (
              <CheckCircle2 className='size-4' />
            ) : (
              <AlertTriangle className='size-4' />
            )}
            {result.ready
              ? 'Configuration is valid — ready to publish.'
              : `${result.errors.length} issue(s) must be fixed.`}
          </div>

          {result.errors.length > 0 && (
            <ul className='border-l-2 border-rose-300 pl-3'>
              {result.errors.map((e, i) => (
                <li key={i} className='py-1 text-xs text-rose-700'>
                  {e.field && (
                    <span className='font-mono font-semibold'>{e.field}</span>
                  )}
                  {e.field && <span className='text-rose-500'> · </span>}
                  <span className='text-rose-700'>{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function PublishPanel({
  notes,
  setNotes,
  publishing,
  canPublish,
  onPublish,
}: {
  notes: string;
  setNotes: (v: string) => void;
  publishing: boolean;
  canPublish: boolean;
  onPublish: () => void;
}) {
  return (
    <section className='border-border bg-background flex flex-col gap-3 rounded-xl border p-5'>
      <div>
        <h3 className='text-foreground text-base font-semibold'>Publish</h3>
        <p className='text-muted-foreground text-xs'>
          Cuts a new release and rolls it out as the active version.
        </p>
      </div>
      <Textarea
        placeholder='Release notes (optional) — what changed in this version?'
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
      />
      <div className='flex justify-end'>
        <Button
          variant='primary'
          size='md'
          onClick={onPublish}
          disabled={!canPublish || publishing}
        >
          {publishing ? (
            <>
              <Spinner size={14} /> Publishing…
            </>
          ) : (
            <>
              <Rocket className='size-3.5' /> Publish release
            </>
          )}
        </Button>
      </div>
      {!canPublish && (
        <p className='text-muted-foreground text-xs italic'>
          Run validation first — must pass before publishing.
        </p>
      )}
    </section>
  );
}

function ReleaseHistory({
  releases,
  loading,
  activeId,
  rollingId,
  onRollback,
}: {
  releases: Release[];
  loading: boolean;
  activeId: string | null;
  rollingId: string | null;
  onRollback: (release: Release) => void;
}) {
  return (
    <section className='border-border bg-background overflow-hidden rounded-xl border'>
      <header className='border-border flex items-center justify-between border-b px-5 py-3'>
        <h3 className='text-foreground text-base font-semibold'>
          Release history
        </h3>
        {loading && <Spinner size={14} />}
      </header>
      {!loading && releases.length === 0 ? (
        <p className='text-muted-foreground px-5 py-8 text-center text-sm'>
          No releases yet.
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase'>
                <th className='px-3 py-2 font-medium'>#</th>
                <th className='px-3 py-2 font-medium'>Status</th>
                <th className='px-3 py-2 font-medium'>Published</th>
                <th className='px-3 py-2 font-medium'>Template ver.</th>
                <th className='px-3 py-2 text-right font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {releases.map(r => (
                <ReleaseRow
                  key={r.id}
                  release={r}
                  isActive={r.id === activeId}
                  rolling={rollingId === r.id}
                  onRollback={onRollback}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PublishWorkspace({ projectId }: PublishWorkspaceProps) {
  const [project, setProject] = React.useState<Project | null>(null);
  const [active, setActive] = React.useState<Release | null>(null);
  const [releases, setReleases] = React.useState<Release[]>([]);
  const [configRevision, setConfigRevision] =
    React.useState<ProjectConfigRevision | null>(null);
  const [validation, setValidation] =
    React.useState<PublishValidationResponse | null>(null);
  const [notes, setNotes] = React.useState('');

  const [loadingProject, setLoadingProject] = React.useState(true);
  const [loadingReleases, setLoadingReleases] = React.useState(true);
  const [validating, setValidating] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [rollingId, setRollingId] = React.useState<string | null>(null);

  const loadProject = React.useCallback(async () => {
    setLoadingProject(true);
    try {
      const [p, ar, cfg] = await Promise.all([
        rexerApi.projects.get(projectId),
        rexerApi.projects.activeRelease(projectId).catch(() => null),
        rexerApi.projects
          .config(projectId)
          .then(r => r.current_revision)
          .catch(() => null),
      ]);
      setProject(p);
      setActive(ar);
      setConfigRevision(cfg);
    } catch (err) {
      toast.error(`Failed to load landing: ${rxErrorMessage(err)}`);
    } finally {
      setLoadingProject(false);
    }
  }, [projectId]);

  const loadReleases = React.useCallback(async () => {
    setLoadingReleases(true);
    try {
      const r = await rexerApi.projects.releases(projectId);
      setReleases(r.items);
    } catch (err) {
      toast.error(`Failed to load releases: ${rxErrorMessage(err)}`);
    } finally {
      setLoadingReleases(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    loadProject();
    loadReleases();
  }, [loadProject, loadReleases]);

  const handleValidate = async () => {
    if (!configRevision) {
      toast.error('No config revision yet — open the builder to save one.');
      return;
    }
    setValidating(true);
    try {
      const res = await rexerApi.projects.publishValidate(projectId, {
        config_revision_no: configRevision.revision_no,
      });
      setValidation(res);
      if (res.ready) {
        toast.success('Validation passed');
      } else {
        toast.error(`Validation failed (${res.errors.length} issue(s))`);
      }
    } catch (err) {
      toast.error(`Validation request failed: ${rxErrorMessage(err)}`);
    } finally {
      setValidating(false);
    }
  };

  const handlePublish = async () => {
    if (!configRevision) {
      toast.error('No config revision to publish.');
      return;
    }
    setPublishing(true);
    try {
      const release = await rexerApi.projects.publish(projectId, {
        config_revision_no: configRevision.revision_no,
        notes: notes.trim() || undefined,
      });
      toast.success(`Release #${release.release_no} is live`);
      setNotes('');
      setValidation(null);
      await Promise.all([loadProject(), loadReleases()]);
    } catch (err) {
      toast.error(`Publish failed: ${rxErrorMessage(err)}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (release: Release) => {
    if (
      !window.confirm(
        `Roll back to release #${release.release_no}? The current active release will be replaced.`
      )
    )
      return;
    setRollingId(release.id);
    try {
      await rexerApi.releases.rollback(release.id);
      toast.success(`Rolled back to release #${release.release_no}`);
      await Promise.all([loadProject(), loadReleases()]);
    } catch (err) {
      toast.error(`Rollback failed: ${rxErrorMessage(err)}`);
    } finally {
      setRollingId(null);
    }
  };

  const canPublish = Boolean(validation?.ready) && Boolean(configRevision);

  return (
    <div className='mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-6 pb-10'>
      <StatusCard
        project={project}
        active={active}
        configRevision={configRevision}
        onRefresh={() => {
          loadProject();
          loadReleases();
        }}
        refreshing={loadingProject || loadingReleases}
      />

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        <ValidationPanel
          result={validation}
          loading={validating}
          onValidate={handleValidate}
        />
        <PublishPanel
          notes={notes}
          setNotes={setNotes}
          publishing={publishing}
          canPublish={canPublish}
          onPublish={handlePublish}
        />
      </div>

      <ReleaseHistory
        releases={releases}
        loading={loadingReleases}
        activeId={active?.id ?? null}
        rollingId={rollingId}
        onRollback={handleRollback}
      />
    </div>
  );
}

export { PublishWorkspace };
