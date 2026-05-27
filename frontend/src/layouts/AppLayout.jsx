import { Bookmark, LayoutDashboard, LogOut, PenLine, Rocket, Shield, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { Outlet, Link, NavLink } from "react-router-dom";
import Starfield from "../components/Starfield.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-void text-slate-100">
      <Starfield />
      <motion.header
        className="sticky top-0 z-40 border-b border-white/10 bg-void/70 backdrop-blur-xl"
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-aurora/30 bg-aurora/10 shadow-glow">
              <Rocket className="h-5 w-5 text-aurora" />
            </span>
            <span className="font-display text-xl font-bold tracking-wide">BLAGONKU</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavItem to="/">Explorer</NavItem>
            <NavItem to="/dashboard">Studio</NavItem>
            <NavItem to="/bookmarks">Bookmarks</NavItem>
            {user?.role === "admin" && <NavItem to="/admin">Admin</NavItem>}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link className="icon-btn" to="/editor" title="New post">
                  <PenLine className="h-4 w-4" />
                </Link>
                <Link className="icon-btn md:hidden" to="/dashboard" title="Studio">
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
                <Link className="icon-btn md:hidden" to="/bookmarks" title="Bookmarks">
                  <Bookmark className="h-4 w-4" />
                </Link>
                {user.role === "admin" && (
                  <Link className="icon-btn md:hidden" to="/admin" title="Admin">
                    <Shield className="h-4 w-4" />
                  </Link>
                )}
                <button className="icon-btn" onClick={logout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link className="primary-btn" to="/auth">
                <UserRound className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </nav>
      </motion.header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Blagonku · Cosmic publishing for modern creators</span>
          <span>Built for thoughtful writing, fast discovery, and calm moderation.</span>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-4 py-2 text-sm font-medium transition ${isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`
      }
    >
      {children}
    </NavLink>
  );
}
