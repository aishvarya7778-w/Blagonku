import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";

export default function NotFoundPage() {
  return (
    <PageTransition>
      <div className="grid min-h-[55vh] place-items-center text-center">
        <div>
          <p className="text-sm uppercase tracking-wide text-aurora">404</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">Signal lost</h1>
          <p className="mt-4 text-slate-400">This route drifted beyond the mapped galaxy.</p>
          <Link className="primary-btn mt-6 inline-flex" to="/">Return home</Link>
        </div>
      </div>
    </PageTransition>
  );
}
