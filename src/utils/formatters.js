// src/utils/formatters.js

/**
 * Format ISO timestamp or Date object into human-readable string
 */
export function formatDate(timestamp, options = {}) {
  if (!timestamp) return '-';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';

    if (options.relative) {
      return formatRelativeTime(date);
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: options.includeYear ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      second: options.includeSeconds ? '2-digit' : undefined,
      hour12: false,
      ...options,
    });
  } catch {
    return '-';
  }
}

/**
 * Format date into relative human time (e.g. "Just now", "2m ago")
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';

  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 5) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Return risk level styling classes for badges & borders
 */
export function getRiskConfig(level = 'low') {
  const normalized = String(level).toLowerCase();
  switch (normalized) {
    case 'critical':
      return {
        label: 'Critical',
        bg: 'bg-rose-500/15',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-500',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
        color: '#f43f5e',
      };
    case 'high':
      return {
        label: 'High',
        bg: 'bg-orange-500/15',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        dot: 'bg-orange-500',
        glow: 'shadow-[0_0_10px_rgba(249,115,22,0.35)]',
        color: '#f97316',
      };
    case 'medium':
      return {
        label: 'Medium',
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500',
        glow: 'shadow-[0_0_8px_rgba(245,158,11,0.25)]',
        color: '#f59e0b',
      };
    case 'low':
    default:
      return {
        label: 'Low',
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500',
        glow: 'shadow-[0_0_8px_rgba(16,185,129,0.25)]',
        color: '#10b981',
      };
  }
}

/**
 * Format confidence decimal (0.0 - 1.0) into percentage
 */
export function formatConfidence(confidence) {
  if (confidence === undefined || confidence === null) return 'N/A';
  const val = confidence > 1 ? confidence : confidence * 100;
  return `${val.toFixed(1)}%`;
}

/**
 * Format bitrate into human readable Mbps or Kbps
 */
export function formatBitrate(kbps) {
  if (!kbps) return '0 Kbps';
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${Math.round(kbps)} Kbps`;
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Export array of objects as CSV download
 */
export function exportToCSV(data = [], filename = 'ibvap_export.csv') {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers
      .map((header) => {
        const val = item[header];
        if (typeof val === 'object' && val !== null) {
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export array or object as JSON download
 */
export function exportToJSON(data, filename = 'ibvap_export.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
