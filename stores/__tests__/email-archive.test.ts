import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEmailStore } from '../email-store';
import type { Email, Mailbox } from '@/lib/jmap/types';
import type { IJMAPClient } from '@/lib/jmap/client-interface';

function makeMailbox(overrides: Partial<Mailbox> = {}): Mailbox {
  return {
    id: overrides.id ?? 'inbox',
    name: overrides.name ?? 'Inbox',
    sortOrder: 0,
    totalEmails: 0,
    unreadEmails: 0,
    totalThreads: 0,
    unreadThreads: 0,
    myRights: {
      mayReadItems: true,
      mayAddItems: true,
      mayRemoveItems: true,
      maySetSeen: true,
      maySetKeywords: true,
      mayCreateChild: true,
      mayRename: true,
      mayDelete: true,
      maySubmit: true,
    },
    isSubscribed: true,
    isShared: false,
    ...overrides,
  };
}

function makeEmail(id: string, threadId: string, mailboxId = 'inbox'): Email {
  return {
    id,
    threadId,
    mailboxIds: { [mailboxId]: true },
    keywords: {},
    size: 100,
    receivedAt: new Date().toISOString(),
    from: [{ name: 'Test', email: 'test@example.com' }],
    to: [{ name: 'User', email: 'user@example.com' }],
    subject: `Email ${id}`,
    preview: 'preview',
    hasAttachment: false,
    textBody: [],
    htmlBody: [],
    bodyValues: {},
  };
}

describe('email-store archive thread behavior', () => {
  beforeEach(() => {
    const inbox = makeMailbox({ id: 'shared-inbox', role: 'inbox', isShared: true, accountId: 'shared-account', originalId: 'server-inbox' });
    const archive = makeMailbox({ id: 'archive-local', role: 'archive', accountId: 'shared-account', originalId: 'server-archive' });
    const threadEmailA = makeEmail('email-1', 'thread-1', 'shared-inbox');
    const threadEmailB = makeEmail('email-2', 'thread-1', 'shared-inbox');
    const otherEmail = makeEmail('email-3', 'thread-2', 'shared-inbox');

    useEmailStore.setState({
      emails: [threadEmailA, threadEmailB, otherEmail],
      mailboxes: [inbox, archive],
      selectedMailbox: 'shared-inbox',
      selectedEmail: threadEmailA,
      selectedEmailIds: new Set(['email-1', 'email-2']),
      expandedThreadIds: new Set(['thread-1']),
      threadEmailsCache: new Map([['thread-1', [threadEmailA, threadEmailB]]]),
      error: null,
    });
  });

  it('archives the full thread and removes cached thread state', async () => {
    const client = {
      getThread: vi.fn().mockResolvedValue({ id: 'thread-1', emailIds: ['email-1', 'email-2'] }),
      batchMoveEmails: vi.fn().mockResolvedValue(undefined),
    } as unknown as IJMAPClient;

    await useEmailStore.getState().moveThreadToMailbox(client, 'email-1', 'archive-local');

    expect(client.getThread).toHaveBeenCalledWith('thread-1', 'shared-account');
    expect(client.batchMoveEmails).toHaveBeenCalledWith(['email-1', 'email-2'], 'server-archive', 'shared-account');

    const state = useEmailStore.getState();
    expect(state.emails.map(email => email.id)).toEqual(['email-3']);
    expect(state.selectedEmail?.id).toBe('email-3');
    expect(Array.from(state.selectedEmailIds)).toEqual([]);
    expect(state.expandedThreadIds.has('thread-1')).toBe(false);
    expect(state.threadEmailsCache.has('thread-1')).toBe(false);
  });
});

describe('email-store batch archive without an Archive folder', () => {
  beforeEach(() => {
    const inbox = makeMailbox({ id: 'inbox', role: 'inbox' });
    useEmailStore.setState({
      emails: [makeEmail('email-1', 'thread-1'), makeEmail('email-2', 'thread-2')],
      mailboxes: [inbox],
      accountMailboxes: {},
      viewingAccountId: null,
      selectedMailbox: 'inbox',
      selectedEmail: null,
      selectedEmailIds: new Set(['email-1']),
      error: null,
    });
  });

  it('creates the Archive folder with the archive role, then archives into it', async () => {
    const created = makeMailbox({ id: 'new-archive', name: 'Archive', role: 'archive', accountId: 'acct' });
    const client = {
      createMailbox: vi.fn().mockResolvedValue(created),
      batchArchiveEmails: vi.fn().mockResolvedValue(undefined),
      getMailboxes: vi.fn().mockResolvedValue([makeMailbox({ id: 'inbox', role: 'inbox' }), created]),
    } as unknown as IJMAPClient;
    // The post-archive list refresh is not what this test is about.
    useEmailStore.setState({ refreshCurrentMailbox: vi.fn().mockResolvedValue(undefined) });

    await useEmailStore.getState().batchArchive(client);

    expect(client.createMailbox).toHaveBeenCalledWith('Archive', undefined, undefined, 'archive');
    expect(client.batchArchiveEmails).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'email-1' })],
      'new-archive',
      expect.any(String),
      expect.any(Array),
      'acct',
    );
    expect(useEmailStore.getState().emails.map(e => e.id)).toEqual(['email-2']);
  });
});
