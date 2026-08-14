import { Users, BookOpen, CreditCard, BarChart3, Layers3 } from 'lucide-react';

export function ProductMockup() {
  return (
    <div className="bg-canvas rounded-lg border border-hairline-soft shadow-[rgba(0,0,0,0.12)_0px_24px_48px_-8px] overflow-hidden">
      <div className="h-11 bg-surface border-b border-hairline-soft flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-error" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-warn" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-steel font-mono">
          maneza.in/dashboard
        </div>
      </div>

      <div className="grid grid-cols-[160px_1fr] min-h-[520px]">
        <aside className="hidden sm:block border-r border-hairline-soft bg-canvas p-4">
          <div className="h-8 rounded-md bg-surface mb-5" />
          {[
            ['Dashboard', Layers3],
            ['Students', Users],
            ['Batches', BookOpen],
            ['Fees', CreditCard],
            ['Reports', BarChart3],
          ].map(([label, Icon], index) => {
            const LucideIcon = Icon as typeof Layers3;
            return (
              <div key={label as string} className={`flex items-center gap-2 h-9 px-3 rounded-md text-sm mb-1 ${index === 0 ? 'bg-surface text-ink font-medium' : 'text-steel'}`}>
                <LucideIcon className={`w-4 h-4 ${index === 0 ? 'text-brand-green' : 'text-steel'}`} />
                <span>{label as string}</span>
              </div>
            );
          })}
        </aside>

        <div className="col-span-2 sm:col-span-1 p-4 sm:p-6 bg-canvas">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel">Today</p>
              <h3 className="text-[24px] sm:text-[28px] leading-[1.25] font-semibold text-ink">Institute overview</h3>
            </div>
            <div className="h-9 rounded-full bg-primary text-on-primary px-4 inline-flex items-center justify-center text-sm font-medium self-start sm:self-auto">
              Collect fee
            </div>
          </div>

          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              ['Students', '1,248'],
              ['Collected', 'INR 4.8L'],
              ['Pending', 'INR 86K'],
              ['Attendance', '92%'],
            ].map(([label, value], index) => (
              <div key={label} className="rounded-lg border border-hairline p-4 bg-canvas">
                <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-steel">{label}</p>
                <p className="mt-2 text-xl font-semibold text-ink font-mono">{value}</p>
                <div className="mt-3 h-1.5 rounded-full bg-surface overflow-hidden">
                  <div className={`h-full rounded-full ${index === 2 ? 'bg-brand-error' : 'bg-brand-green'}`} style={{ width: `${index === 2 ? 38 : 78}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-hairline overflow-x-auto">
            <div className="min-w-[400px]">
              <div className="grid grid-cols-4 bg-surface text-[11px] font-semibold uppercase tracking-[0.5px] text-steel">
              <div className="px-4 py-3">Student</div>
              <div className="px-4 py-3">Batch</div>
              <div className="px-4 py-3">Status</div>
              <div className="px-4 py-3 text-right">Balance</div>
            </div>
            {[
              ['Aarav Sharma', 'Physics XI', 'Paid', '0'],
              ['Nisha Verma', 'Maths XII', 'Due', '4,500'],
              ['Kabir Khan', 'Foundation', 'Paid', '0'],
              ['Meera Joshi', 'Chemistry', 'Partial', '1,800'],
            ].map(([name, batch, status, balance]) => (
              <div key={name} className="grid grid-cols-4 border-t border-hairline-soft text-sm">
                <div className="px-4 py-4 font-medium text-ink truncate">{name}</div>
                <div className="px-4 py-4 text-steel truncate">{batch}</div>
                <div className="px-4 py-4">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status === 'Paid' ? 'bg-brand-green-soft text-ink' : 'bg-danger-50 text-brand-error'}`}>
                    {status}
                  </span>
                </div>
                <div className="px-4 py-4 text-right text-ink font-mono">{balance}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
