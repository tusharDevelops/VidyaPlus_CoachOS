import { useEffect, useMemo, useState, useRef } from 'react';
import api from '../../lib/api';
import {
  Wallet,
  Plus,
  Clock,
  IndianRupee,
  AlertCircle,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  X,
  TrendingUp,
  TrendingDown,
  Receipt,
  Banknote,
  Smartphone,
  CreditCard,
  Landmark,
  Info,
} from 'lucide-react';

/* ────────────────────────── Types ────────────────────────── */

type WalletTransaction = {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string | null;
  referenceNo: string | null;
  createdAt: string;
};

type WalletResponse = {
  balance: number;
  transactions: WalletTransaction[];
};

type FilterType = 'all' | 'credit' | 'debit';

type ModalState =
  | { kind: 'none' }
  | { kind: 'confirm'; amount: number }
  | { kind: 'processing' }
  | { kind: 'success'; amount: number; newBalance: number }
  | { kind: 'error'; message: string };

/* ────────────────────────── Constants ────────────────────── */

const QUICK_AMOUNTS = [100, 200, 500, 1_000, 2_000, 5_000];


/* ────────────────── Animated Balance ────────────────────── */

function AnimatedBalance({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const cur = from + (to - from) * ease;
      setDisplay(Math.round(cur * 100) / 100);
      if (t < 1) requestAnimationFrame(tick);
      else {
        setDisplay(to);
        prev.current = to;
      }
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className="tabular-nums">
      ₹{display.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    </span>
  );
}

/* ────────────────── Helpers ─────────────────────────────── */

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ────────────────── Main Page ───────────────────────────── */

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add-money form
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');


  // Modal
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  // Filter
  const [filter, setFilter] = useState<FilterType>('all');

  /* ── Fetch ── */
  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/wallet');
      setWallet(data.data as WalletResponse);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Could not load wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();

    // Handle return from Dodo Payments
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      setModal({ 
        kind: 'success', 
        amount: 0, // Since we don't pass amount back, just show a general success message
        newBalance: balance 
      });
      // Clear the URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  /* ── Derived ── */
  const balance = wallet?.balance ?? 0;
  const transactions = wallet?.transactions ?? [];

  const amount = selectedPreset ?? (Number(customAmount) || 0);
  const canAdd = amount > 0;

  const stats = useMemo(() => {
    let totalIn = 0, totalOut = 0;
    for (const t of transactions) {
      if (t.type === 'credit') totalIn += Number(t.amount);
      else totalOut += Number(t.amount);
    }
    return { totalIn, totalOut, count: transactions.length };
  }, [transactions]);

  const filteredTxns = useMemo(
    () => (filter === 'all' ? transactions : transactions.filter(t => t.type === filter)),
    [transactions, filter],
  );

  const isLowBalance = balance < 100 && balance > 0;
  const isZeroBalance = balance <= 0;

  /* ── Top-up flow ── */
  const openConfirm = () => {
    if (!canAdd) return;
    setModal({ kind: 'confirm', amount });
  };

  const executeTopUp = async () => {
    setModal({ kind: 'processing' });
    try {
      const response = await api.post('/wallet/top-up', { amount });
      
      if (response.data?.data?.checkout_url) {
        // Redirect to Dodo Payments secure checkout
        window.location.href = response.data.data.checkout_url;
      } else {
        throw new Error('Checkout URL not found');
      }
    } catch (e: any) {
      setModal({ kind: 'error', message: e?.response?.data?.error || 'Payment failed. Please try again.' });
    }
  };

  const closeModal = () => setModal({ kind: 'none' });

  /* ────────────────── Render ────────────────────────────── */

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-green-soft flex items-center justify-center">
            <Wallet className="w-5 h-5 text-brand-green" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Wallet</h1>
            <p className="text-xs text-steel mt-0.5">Manage your institute's balance</p>
          </div>
        </div>
        <button
          onClick={fetchWallet}
          disabled={loading}
          className="btn-secondary text-xs gap-1.5 h-9"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-lg border border-brand-error/20 bg-red-50 dark:bg-red-500/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink">{error}</p>
            <p className="text-xs text-steel mt-1">If you just logged in, try refreshing the page.</p>
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && !wallet ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <RefreshCw className="w-7 h-7 text-brand-green animate-spin" />
          <p className="text-sm text-steel">Loading your wallet…</p>
        </div>
      ) : wallet ? (
        <>
          {/* ── Balance Hero ── */}
          <div className="relative overflow-hidden rounded-lg bg-ink p-6 sm:p-8">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/15 via-transparent to-brand-green/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />

            <div className="relative">
              <p className="text-xs font-semibold text-on-dark-muted uppercase tracking-wider">
                Your Balance
              </p>
              <h2 className="text-4xl sm:text-5xl font-semibold text-on-dark mt-2">
                <AnimatedBalance value={balance} />
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <Clock className="w-3.5 h-3.5 text-on-dark-muted" />
                <p className="text-xs text-on-dark-muted">
                  Updated {wallet.transactions?.[0] ? formatDate(wallet.transactions[0].createdAt) : 'now'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Low Balance Alerts ── */}
          {isZeroBalance && (
            <div className="p-4 rounded-lg border border-brand-error/20 bg-red-50 dark:bg-red-500/5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-ink">Your wallet is empty</p>
                <p className="text-xs text-steel mt-0.5">Add money below to continue using messaging services.</p>
              </div>
            </div>
          )}
          {isLowBalance && (
            <div className="p-4 rounded-lg border border-brand-warn/20 bg-orange-50 dark:bg-orange-500/5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-warn flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-ink">Balance is running low</p>
                <p className="text-xs text-steel mt-0.5">We recommend keeping at least ₹100 for uninterrupted service.</p>
              </div>
            </div>
          )}

          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="mint-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-brand-green" />
                <span className="text-[11px] font-semibold text-steel uppercase tracking-wider">Added</span>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-ink tabular-nums">₹{stats.totalIn.toLocaleString('en-IN')}</p>
            </div>
            <div className="mint-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-brand-error" />
                <span className="text-[11px] font-semibold text-steel uppercase tracking-wider">Used</span>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-ink tabular-nums">₹{stats.totalOut.toLocaleString('en-IN')}</p>
            </div>
            <div className="mint-card p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-steel" />
                <span className="text-[11px] font-semibold text-steel uppercase tracking-wider">Total</span>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-ink tabular-nums">{stats.count}</p>
            </div>
          </div>

          {/* ── Two Column: Add Money + History ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Add Money ── */}
            <div className="lg:col-span-2">
              <div className="mint-card p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="w-5 h-5 text-brand-green" />
                  <h2 className="text-base font-semibold text-ink">Add Money</h2>
                </div>
                <p className="text-xs text-steel mb-5">Choose an amount and payment method.</p>

                {/* Quick Amount Picks */}
                <div className="mb-5">
                  <label className="text-[11px] font-semibold text-steel uppercase tracking-wider block mb-2.5">
                    Quick pick
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(selectedPreset === amt ? null : amt);
                          setCustomAmount('');
                        }}
                        className={`h-10 rounded-md text-sm font-medium border transition-all ${
                          selectedPreset === amt
                            ? 'bg-ink text-on-primary border-ink'
                            : 'bg-canvas text-ink border-hairline hover:border-brand-green/40 hover:bg-surface'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="mb-5">
                  <label className="text-[11px] font-semibold text-steel uppercase tracking-wider block mb-2">
                    Or enter amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-steel">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 750"
                      value={customAmount}
                      onChange={e => {
                        const v = e.target.value.replace(/[^0-9.]/g, '');
                        setCustomAmount(v);
                        setSelectedPreset(null);
                      }}
                      className="input-field pl-8"
                    />
                  </div>
                </div>


                {/* Add Money Button */}
                <button
                  onClick={openConfirm}
                  disabled={!canAdd}
                  className="mint-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {canAdd ? `Add ₹${amount.toLocaleString('en-IN')}` : 'Enter an amount'}
                </button>

                {/* Helper note */}
                <div className="flex items-start gap-2 mt-4 p-3 rounded-md bg-surface">
                  <Info className="w-3.5 h-3.5 text-steel mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-steel leading-relaxed">
                    You will be redirected to Dodo Payments for a secure checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Transaction History ── */}
            <div className="lg:col-span-3">
              <div className="mint-card overflow-hidden">
                {/* Header + Filter Tabs */}
                <div className="p-5 sm:p-6 border-b border-hairline">
                  <h2 className="text-base font-semibold text-ink">Transaction History</h2>
                  <p className="text-xs text-steel mt-0.5 mb-4">Your recent wallet activity</p>

                  <div className="flex gap-1 bg-surface rounded-md p-1">
                    {([
                      ['all', 'All'],
                      ['credit', 'Money Added'],
                      ['debit', 'Money Used'],
                    ] as [FilterType, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          filter === key
                            ? 'bg-canvas text-ink shadow-sm border border-hairline'
                            : 'text-steel hover:text-ink'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transaction List */}
                {filteredTxns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-3">
                      <Receipt className="w-6 h-6 text-stone" />
                    </div>
                    <p className="text-sm font-medium text-ink">No transactions yet</p>
                    <p className="text-xs text-steel mt-1 text-center max-w-[240px]">
                      {filter === 'all'
                        ? 'Add money to your wallet to get started.'
                        : `No ${filter === 'credit' ? '"money added"' : '"money used"'} transactions found.`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-hairline">
                    {filteredTxns.map(t => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 hover:bg-surface-hover transition-colors"
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          t.type === 'credit'
                            ? 'bg-brand-green-soft'
                            : 'bg-red-50 dark:bg-red-500/10'
                        }`}>
                          {t.type === 'credit'
                            ? <ArrowDownLeft className="w-4 h-4 text-brand-green" />
                            : <ArrowUpRight className="w-4 h-4 text-brand-error" />}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {t.type === 'credit' ? 'Money Added' : 'Money Used'}
                          </p>
                          <p className="text-[11px] text-steel truncate mt-0.5">
                            {t.description || (t.type === 'credit' ? 'Wallet top-up' : 'Service charge')}
                          </p>
                        </div>

                        {/* Amount + Time */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-semibold tabular-nums ${
                            t.type === 'credit' ? 'text-brand-green-deep' : 'text-brand-error'
                          }`}>
                            {t.type === 'credit' ? '+' : '−'} ₹{Math.abs(Number(t.amount)).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-steel mt-0.5">{formatDate(t.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* ════════════════ Modals ════════════════ */}

      {modal.kind !== 'none' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={modal.kind === 'confirm' || modal.kind === 'success' || modal.kind === 'error' ? closeModal : undefined}
          />

          {/* Modal Card */}
          <div className="relative bg-canvas border border-hairline rounded-lg shadow-modal w-full max-w-sm animate-fade-in">

            {/* ── Confirm ── */}
            {modal.kind === 'confirm' && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-brand-green-soft flex items-center justify-center mx-auto mb-4">
                  <IndianRupee className="w-7 h-7 text-brand-green" />
                </div>
                <h3 className="text-lg font-semibold text-ink">Confirm Payment</h3>
                <p className="text-sm text-steel mt-2">
                  You are adding <span className="font-semibold text-ink">₹{modal.amount.toLocaleString('en-IN')}</span> to your wallet.
                </p>

                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="btn-secondary flex-1 h-10 text-sm">
                    Cancel
                  </button>
                  <button onClick={executeTopUp} className="mint-btn-primary flex-1 h-10 text-sm">
                    Yes, Add ₹{modal.amount.toLocaleString('en-IN')}
                  </button>
                </div>
              </div>
            )}

            {/* ── Processing ── */}
            {modal.kind === 'processing' && (
              <div className="p-8 text-center">
                <RefreshCw className="w-10 h-10 text-brand-green animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-ink">Processing…</h3>
                <p className="text-sm text-steel mt-1">Please wait while we process your payment.</p>
              </div>
            )}

            {/* ── Success ── */}
            {modal.kind === 'success' && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-green-soft flex items-center justify-center mx-auto mb-4 relative">
                  <CheckCircle2 className="w-8 h-8 text-brand-green" />
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-brand-green/30 animate-ping" />
                </div>
                <h3 className="text-lg font-semibold text-ink">Money Added! 🎉</h3>
                <p className="text-sm text-steel mt-2">
                  {modal.amount > 0 
                    ? <><span className="font-semibold text-brand-green-deep">₹{modal.amount.toLocaleString('en-IN')}</span> has been added to your wallet.</>
                    : "Your payment was successful and your wallet balance has been updated."}
                </p>
                {modal.newBalance > 0 && (
                  <div className="mt-4 p-3 rounded-md bg-surface">
                    <p className="text-[11px] text-steel uppercase tracking-wider font-semibold">New Balance</p>
                    <p className="text-2xl font-semibold text-ink mt-1 tabular-nums">
                      ₹{modal.newBalance.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
                <button onClick={closeModal} className="mint-btn-primary w-full mt-5 h-10 text-sm">
                  Done
                </button>
              </div>
            )}

            {/* ── Error ── */}
            {modal.kind === 'error' && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <X className="w-7 h-7 text-brand-error" />
                </div>
                <h3 className="text-lg font-semibold text-ink">Payment Failed</h3>
                <p className="text-sm text-steel mt-2">{modal.message}</p>

                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="btn-secondary flex-1 h-10 text-sm">
                    Close
                  </button>
                  <button onClick={openConfirm} className="mint-btn-primary flex-1 h-10 text-sm">
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
