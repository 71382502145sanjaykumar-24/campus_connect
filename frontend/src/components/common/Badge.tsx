import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'md' }) => {
  const styles = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status ? status.toUpperCase() : '';
  let variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';

  if (['PRESENT', 'PAID', 'APPROVED', 'ACTIVE', 'RETURNED'].includes(s)) {
    variant = 'success';
  } else if (['PENDING', 'PARTIAL', 'LATE', 'UNDER_REVIEW'].includes(s)) {
    variant = 'warning';
  } else if (['ABSENT', 'OVERDUE', 'REJECTED', 'DROPPED'].includes(s)) {
    variant = 'danger';
  } else if (['EXCUSED', 'ISSUED', 'COMPLETED'].includes(s)) {
    variant = 'info';
  }

  return <Badge variant={variant}>{status}</Badge>;
};
