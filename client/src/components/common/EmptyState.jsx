import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', description, action }) {
  return (
    <div className="empty-state">
      <Inbox size={36} strokeWidth={1.5} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
