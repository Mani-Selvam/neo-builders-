export default function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="fullpage-loader">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}
