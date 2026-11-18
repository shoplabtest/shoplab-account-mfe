import { formatMoney, Money, type Currency } from '@shoplab/ui-kit';
import { api } from '../api.ts';
import { useAsync } from '../useAsync.ts';

export function OrderHistory() {
  const state = useAsync(() => api.listOrders(), 'orders');
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
            <li key={o.id} aria-label={`${o.status} order, total ${formatMoney(o.total, o.currency as Currency)}`}>
              {o.id} · {o.status} · <Money amount={o.total} currency={o.currency as Currency} /> · {new Date(o.placedAt).toLocaleDateString('en-US')}
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}
