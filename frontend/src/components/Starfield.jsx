export default function Starfield() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.16),transparent_35%),radial-gradient(circle_at_70%_20%,rgba(244,114,182,.12),transparent_30%),linear-gradient(180deg,#050816,#070a18_55%,#03040b)]" />
      <div className="stars-layer stars-a" />
      <div className="stars-layer stars-b" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}
