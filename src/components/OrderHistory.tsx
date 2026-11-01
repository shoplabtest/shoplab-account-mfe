import { Money } from '@shoplab/ui-kit';
import { authFetch } from 'host/ui';
import { useAsync } from '../useAsync.ts';
import type { OrderSummary } from '../types.ts';

export function OrderHistory() {
  const state = useAsync(() => authFetch<OrderSummary[]>('/orders'), 'orders');
  return (
    <section aria-label="Order history">
      <h2>Order history</h2>
      {state.status === 'loading' && <p>Loading…</p>}
      {state.status === 'error' && <p role="alert">Order history is unavailable right now.</p>}
      {state.status === 'ready' && (state.data.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul>
          {state.data.map((o) => (
            <li key={o.id}>
              {o.id} · {o.status} · <Money amount={o.total} currency={o.currency as 'USD'} /> · {new Date(o.placedAt).toLocaleDateString('en-US')}
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}
