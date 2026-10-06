import type { IJMAPClient } from '@/lib/jmap/client-interface';
import type { Mailbox } from '@/lib/jmap/types';

const ARCHIVE_MAILBOX_NAME = 'Archive';

export function findArchiveMailbox(mailboxes: Mailbox[]): Mailbox | undefined {
  return mailboxes.find(m => m.role === 'archive' || m.name.toLowerCase() === 'archive');
}

/**
 * Create the account's Archive folder. Accounts are not provisioned with one,
 * so the first archive action has to make it; the `archive` role lets every
 * client recognise the folder regardless of its display name.
 */
export function createArchiveMailbox(client: IJMAPClient, accountId?: string): Promise<Mailbox> {
  return client.createMailbox(ARCHIVE_MAILBOX_NAME, undefined, accountId, 'archive');
}
