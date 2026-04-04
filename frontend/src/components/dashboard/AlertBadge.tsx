interface AlertBadgeProps {
  status: 'safe' | 'warning' | 'danger';
  label: string;
}

const styles = {
  safe: 'bg-safe/10 text-safe border-safe/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
};

const icons = {
  safe: '✓',
  warning: '⚠',
  danger: '✕',
};

const AlertBadge = ({ status, label }: AlertBadgeProps) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
    <span>{icons[status]}</span>
    {label}
  </span>
);

export default AlertBadge;
