import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1 font-medium',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${variants[variant] || variants.default} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    // Complaints
    'SUBMITTED': { label: 'Submitted', variant: 'warning' },
    'UNDER_REVIEW': { label: 'Under Review', variant: 'info' },
    'ASSIGNED': { label: 'Assigned', variant: 'purple' },
    'IN_PROGRESS': { label: 'In Progress', variant: 'primary' },
    'RESOLVED': { label: 'Resolved', variant: 'success' },
    'REJECTED': { label: 'Rejected', variant: 'danger' },

    // Fees
    'PAID': { label: 'Paid in Full', variant: 'success' },
    'PARTIAL': { label: 'Partially Paid', variant: 'warning' },
    'PENDING': { label: 'Pending Payment', variant: 'danger' },

    // Attendance
    'PRESENT': { label: 'Present', variant: 'success' },
    'ABSENT': { label: 'Absent', variant: 'danger' },
    'ON_LEAVE': { label: 'On Leave', variant: 'warning' },

    // Visitors
    'INSIDE': { label: 'Inside Campus', variant: 'success' },
    'EXITED': { label: 'Exited', variant: 'default' },

    // Allocations
    'ACTIVE': { label: 'Active', variant: 'success' },
    'VACATED': { label: 'Vacated', variant: 'default' },
    'TRANSFERRED': { label: 'Transferred', variant: 'info' },
  };

  const conf = map[status] || { label: status, variant: 'default' };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const map = {
    'LOW': { label: 'Low', variant: 'default' },
    'MEDIUM': { label: 'Medium', variant: 'info' },
    'HIGH': { label: 'High Priority', variant: 'warning' },
    'URGENT': { label: 'Urgent', variant: 'danger' },
  };
  const conf = map[priority] || { label: priority, variant: 'default' };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};
