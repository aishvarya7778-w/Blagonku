export default function Spinner({ label = "Loading" }) {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full border-2 border-aurora/20 border-t-aurora animate-spin" />
        <p className="mt-4 text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}
