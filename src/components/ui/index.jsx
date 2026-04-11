import clsx from 'clsx'

/* ── AVATAR ─────────────────────────────────────────────────────────────── */
export function Avatar({ initials, size = 'md', verified = false, className }) {
  const sizes = {
    xs: 'w-7 h-7 text-[11px]',
    sm: 'w-9 h-9 text-[13px]',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-24 h-24 text-4xl',
  }
  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div className={clsx('avatar rounded-full flex items-center justify-center font-display font-bold', sizes[size])}>
        {initials}
      </div>
      {verified && (
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">✓</span>
      )}
    </div>
  )
}

/* ── BADGE ──────────────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'navy', className }) {
  const variants = {
    navy:      'badge-navy',
    gold:      'badge-gold',
    verified:  'badge-verified',
    pending:   'badge-pending',
    neutral:   'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-semibold',
    danger:    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[11px] font-semibold',
    success:   'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px] font-semibold',
  }
  return (
    <span className={clsx(variants[variant], className)}>
      {children}
    </span>
  )
}

/* ── SUB BADGE ──────────────────────────────────────────────────────────── */
export function SubBadge({ plan }) {
  const plans = {
    free:       { cls: 'sub-free',      label: 'Free' },
    pro:        { cls: 'sub-pro',       label: '⬡ Pro' },
    premium:    { cls: 'sub-premium',   label: '✦ Premium' },
    spotlight:  { cls: 'sub-spotlight', label: '★ Spotlight' },
    enterprise: { cls: 'bg-navy-900 text-gold-400 border border-gold-500/30 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold', label: '◆ Enterprise' },
  }
  const { cls, label } = plans[plan] || plans.free
  return <span className={cls}>{label}</span>
}

/* ── STARS ──────────────────────────────────────────────────────────────── */
export function Stars({ rating, reviews }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex text-gold-500 text-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < full ? 'text-gold-500' : 'text-gray-200'}>★</span>
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-700">{rating}</span>
      {reviews && <span className="text-xs text-gray-400">({reviews} avis)</span>}
    </div>
  )
}

/* ── STATUS BADGE ───────────────────────────────────────────────────────── */
export function StatusBadge({ status }) {
  const map = {
    active:   { cls: 'bg-green-50 text-green-700 border-green-200',  label: 'En cours' },
    review:   { cls: 'bg-gold-100 text-gold-700 border-gold-300',    label: 'En révision' },
    done:     { cls: 'bg-gray-100 text-gray-500 border-gray-200',    label: 'Terminé' },
    pending:  { cls: 'bg-blue-50 text-blue-700 border-blue-200',     label: 'En attente' },
    rejected: { cls: 'bg-red-50 text-red-600 border-red-200',        label: 'Refusé' },
  }
  const { cls, label } = map[status] || map.pending
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', cls)}>
      {label}
    </span>
  )
}

/* ── SECTION HEADER ─────────────────────────────────────────────────────── */
export function SectionHeader({ overline, title, subtitle, center = false }) {
  return (
    <div className={clsx('mb-14', center && 'text-center')}>
      {overline && <p className="sec-label">{overline}</p>}
      <h2 className="sec-title">{title}</h2>
      {subtitle && (
        <p className={clsx('text-lg text-gray-400 leading-relaxed max-w-xl', center && 'mx-auto')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ── TOAST ──────────────────────────────────────────────────────────────── */
export function Toast({ type = 'info', icon, children }) {
  const classes = {
    success: 'toast-success',
    warning: 'toast-warning',
    error:   'toast-error',
    info:    'toast-info',
  }
  return (
    <div className={classes[type]}>
      {icon && <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>}
      <div>{children}</div>
    </div>
  )
}

/* ── DIVIDER ────────────────────────────────────────────────────────────── */
export function DividerOr() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-300">ou</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

/* ── PROGRESS BAR ───────────────────────────────────────────────────────── */
export function ProgressBar({ value, className }) {
  return (
    <div className={clsx('h-1.5 bg-gray-100 rounded-full overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: 'linear-gradient(90deg, #C9A84C, #D9BC72)' }}
      />
    </div>
  )
}
