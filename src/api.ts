import { authFetch } from 'host/ui';
import { createClient } from './generated/contracts.ts';

/** The orders operations from shoplab-contracts, sent through the host's authenticated fetch. */
export const api = createClient(authFetch);
