'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { ClientFormDialog } from '@/components/dialogs/ClientFormDialog';
import { InviteClientUserDialog } from '@/components/dialogs/InviteClientUserDialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { SubTabBar } from '@/components/organisms/SubTabBar';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  Client,
  ClientAccessGrant,
  ClientUser,
  ProjectSummary,
} from '@/services/rexer/types';

interface PageProps {
  params: Promise<{ clientId: string }>;
}

type TabKey = 'users' | 'access' | 'projects';

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

function UsersTab({ clientId }: { clientId: string }) {
  const [users, setUsers] = React.useState<ClientUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [generatedPwd, setGeneratedPwd] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await rexerApi.clients.users(clientId);
      setUsers(r.items);
    } catch (err) {
      toast.error(`Failed to load users: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleInvite = async (values: {
    email: string;
    display_name: string;
    password?: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await rexerApi.clients.inviteUser(clientId, values);
      toast.success(`Invited ${res.user.email}`);
      setGeneratedPwd(res.generated_password ?? null);
      if (!res.generated_password) {
        setInviteOpen(false);
      }
      await reload();
    } catch (err) {
      toast.error(`Invite failed: ${rxErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: ClientUser) => {
    const next = user.status === 'active' ? 'disabled' : 'active';
    try {
      await rexerApi.clients.updateUser(clientId, user.id, { status: next });
      toast.success(`User ${next === 'active' ? 'enabled' : 'disabled'}`);
      await reload();
    } catch (err) {
      toast.error(`Update failed: ${rxErrorMessage(err)}`);
    }
  };

  return (
    <>
      <div className='flex items-center justify-between gap-4 pt-4 pb-3'>
        <p className='text-muted-foreground text-sm'>
          Team members of this client workspace.
        </p>
        <Button variant='pill' size='sm' onClick={() => setInviteOpen(true)}>
          <Plus className='size-3.5' /> Invite
        </Button>
      </div>

      {loading ? (
        <div className='text-muted-foreground flex justify-center py-12'>
          <Spinner size={20} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className='size-10' />}
          title='No users yet'
          description='Invite a teammate to collaborate inside this workspace.'
          actions={
            <Button variant='pill' onClick={() => setInviteOpen(true)}>
              <Plus className='size-3.5' /> Invite first user
            </Button>
          }
        />
      ) : (
        <div className='border-border bg-background overflow-hidden rounded-xl border'>
          <ul className='flex flex-col divide-y divide-neutral-100'>
            {users.map(u => (
              <li
                key={u.id}
                className='flex items-center justify-between gap-3 px-5 py-3'
              >
                <div className='min-w-0 flex-1'>
                  <p className='text-foreground truncate text-sm font-medium'>
                    {u.display_name}
                  </p>
                  <p className='text-muted-foreground truncate text-xs'>
                    {u.email}
                  </p>
                </div>
                <Badge
                  variant={u.status === 'active' ? 'default' : 'outline'}
                  className='capitalize'
                >
                  {u.status}
                </Badge>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleToggleStatus(u)}
                >
                  {u.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <InviteClientUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        submitting={submitting}
        generatedPassword={generatedPwd}
        onSubmit={handleInvite}
        onClear={() => setGeneratedPwd(null)}
      />
    </>
  );
}

function AccessGrantsTab({
  clientId,
  projects,
}: {
  clientId: string;
  projects: ProjectSummary[];
}) {
  const [grants, setGrants] = React.useState<ClientAccessGrant[]>([]);
  const [grantsKnown, setGrantsKnown] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [projectId, setProjectId] = React.useState('');
  const [scope, setScope] = React.useState<
    'summary_only' | 'summary_and_reports'
  >('summary_only');

  const handleCreate = async () => {
    if (!projectId) {
      toast.error('Pick a project first');
      return;
    }
    setCreating(true);
    try {
      const grant = await rexerApi.clients.createAccessGrant(clientId, {
        project_id: projectId,
        access_scope: scope,
      });
      setGrants(g => [grant, ...g]);
      setGrantsKnown(true);
      setProjectId('');
      toast.success('Grant created');
    } catch (err) {
      toast.error(`Create failed: ${rxErrorMessage(err)}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (grant: ClientAccessGrant) => {
    if (!window.confirm('Revoke this access grant?')) return;
    try {
      await rexerApi.clients.deleteAccessGrant(clientId, grant.id);
      setGrants(g => g.filter(x => x.id !== grant.id));
      toast.success('Grant revoked');
    } catch (err) {
      toast.error(`Revoke failed: ${rxErrorMessage(err)}`);
    }
  };

  const projectName = (id: string) =>
    projects.find(p => p.project_id === id)?.name ?? id.slice(0, 8);

  return (
    <>
      <div className='pt-4 pb-3'>
        <p className='text-muted-foreground text-sm'>
          Grants control which projects this client&apos;s users can see in the
          portal, and at what depth.
        </p>
      </div>

      <section className='border-border bg-background mb-4 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-end'>
        <div className='flex-1'>
          <label className='text-muted-foreground text-xs font-medium'>
            Project
          </label>
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className='border-input bg-background mt-1 h-10 w-full rounded-md border px-3 text-sm'
          >
            <option value=''>Select project…</option>
            {projects.map(p => (
              <option key={p.project_id} value={p.project_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className='sm:w-56'>
          <label className='text-muted-foreground text-xs font-medium'>
            Scope
          </label>
          <select
            value={scope}
            onChange={e =>
              setScope(e.target.value as 'summary_only' | 'summary_and_reports')
            }
            className='border-input bg-background mt-1 h-10 w-full rounded-md border px-3 text-sm'
          >
            <option value='summary_only'>Summary only</option>
            <option value='summary_and_reports'>Summary + reports</option>
          </select>
        </div>
        <Button
          variant='primary'
          size='md'
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <>
              <Spinner size={14} /> Granting…
            </>
          ) : (
            <>
              <KeyRound className='size-3.5' /> Grant
            </>
          )}
        </Button>
      </section>

      {grantsKnown && grants.length === 0 ? (
        <p className='text-muted-foreground py-6 text-center text-sm'>
          No grants yet. Create one above.
        </p>
      ) : grants.length === 0 ? (
        <p className='text-muted-foreground py-6 text-center text-xs italic'>
          BE doesn&apos;t expose a list endpoint yet — only newly created grants
          appear here in this session.
        </p>
      ) : (
        <div className='border-border bg-background overflow-hidden rounded-xl border'>
          <ul className='flex flex-col divide-y divide-neutral-100'>
            {grants.map(g => (
              <li
                key={g.id}
                className='flex items-center justify-between gap-3 px-5 py-3'
              >
                <div className='flex min-w-0 items-center gap-3'>
                  <ShieldCheck className='text-primary size-4' />
                  <div className='min-w-0'>
                    <p className='text-foreground text-sm font-medium'>
                      {projectName(g.project_id)}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {g.access_scope.replace(/_/g, ' ')} · since{' '}
                      {formatDate(g.created_at)}
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDelete(g)}
                  className='text-muted-foreground hover:text-destructive'
                >
                  <Trash2 className='size-3.5' /> Revoke
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function ProjectsTab({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck className='size-10' />}
        title='No projects scoped to this client'
        description='Create a landing under this workspace to see it listed here.'
      />
    );
  }
  return (
    <div className='border-border bg-background mt-4 overflow-hidden rounded-xl border'>
      <ul className='flex flex-col divide-y divide-neutral-100'>
        {projects.map(p => (
          <li
            key={p.project_id}
            className='flex items-center justify-between gap-3 px-5 py-3'
          >
            <div className='min-w-0 flex-1'>
              <p className='text-foreground truncate text-sm font-medium'>
                {p.name}
              </p>
              <p className='text-muted-foreground text-xs'>
                {p.template_name} · {p.status}
              </p>
            </div>
            {p.active_release_id ? (
              <Badge variant='secondary'>Live</Badge>
            ) : (
              <Badge variant='outline'>Draft</Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ClientDetailPage({ params }: PageProps) {
  const { clientId } = use(params);
  const [client, setClient] = React.useState<Client | null>(null);
  const [projects, setProjects] = React.useState<ProjectSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [tab, setTab] = React.useState<TabKey>('users');

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const [c, projs] = await Promise.all([
        rexerApi.clients.get(clientId),
        rexerApi.clients
          .projects(clientId)
          .then(r => r.items)
          .catch(() => [] as ProjectSummary[]),
      ]);
      setClient(c);
      setProjects(projs);
    } catch (err) {
      toast.error(`Failed to load client: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleEdit = async (values: {
    name: string;
    status: 'active' | 'inactive';
  }) => {
    setEditing(true);
    try {
      const updated = await rexerApi.clients.update(clientId, values);
      setClient(updated);
      toast.success('Client updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(`Update failed: ${rxErrorMessage(err)}`);
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <div className='flex items-center gap-2 text-xs'>
        <Link
          href='/setting/clients'
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
        >
          <ChevronLeft className='size-3.5' /> Clients
        </Link>
      </div>

      <header className='mt-2 mb-4 flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
            {loading ? 'Loading…' : (client?.name ?? 'Unknown client')}
          </h1>
          {client && (
            <p className='text-muted-foreground mt-1 text-xs'>
              Status:{' '}
              <Badge
                variant={client.status === 'active' ? 'default' : 'outline'}
                className='capitalize'
              >
                {client.status}
              </Badge>{' '}
              · Created {formatDate(client.created_at)}
            </p>
          )}
        </div>
        {client && (
          <Button variant='outline' size='sm' onClick={() => setEditOpen(true)}>
            <Pencil className='size-3.5' /> Edit
          </Button>
        )}
      </header>

      <SubTabBar
        tabs={[
          { key: 'users', label: 'Users' },
          { key: 'access', label: 'Access grants' },
          { key: 'projects', label: 'Projects' },
        ]}
        activeKey={tab}
        onChange={k => setTab(k as TabKey)}
      />

      {tab === 'users' && <UsersTab clientId={clientId} />}
      {tab === 'access' && (
        <AccessGrantsTab clientId={clientId} projects={projects} />
      )}
      {tab === 'projects' && <ProjectsTab projects={projects} />}

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        submitting={editing}
        onSubmit={handleEdit}
      />
    </div>
  );
}
