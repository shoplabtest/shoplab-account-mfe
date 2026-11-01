/** Response shapes from shoplab-contracts openapi/iam.yaml. */
export interface Profile { id: string; email: string; fullName: string; role: 'customer' | 'staff' | 'admin' }

/** Order history entry. The orders service arrives in a later phase; this is the shape the account page reads. */
export interface OrderSummary { id: string; status: string; total: number; currency: string; placedAt: string }
