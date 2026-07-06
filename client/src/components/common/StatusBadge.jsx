export default function StatusBadge({ status }) {
  const active = String(status).toLowerCase() === 'active' || status === true;
  return <span className={`badge ${active ? 'badge-success' : 'badge-muted'}`}>{active ? 'Active' : 'Inactive'}</span>;
}
