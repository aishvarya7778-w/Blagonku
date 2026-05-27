import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", adminSecretKey: "" });
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") await login({ email: form.email, password: form.password });
      else {
        const payload = { username: form.username, email: form.email, password: form.password };
        if (form.adminSecretKey.trim()) payload.adminSecretKey = form.adminSecretKey.trim();
        await signup(payload);
      }
      navigate("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <div className="py-8">
          <p className="text-sm uppercase tracking-wide text-aurora">Creator access</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">Enter the Blagonku studio.</h1>
          <p className="mt-4 leading-7 text-slate-400">Publish drafts, bookmark discoveries, comment with your community, and manage your writing from one focused cockpit.</p>
        </div>
        <form onSubmit={submit} className="glass-card space-y-5 p-6">
          <div className="grid grid-cols-2 rounded-lg bg-white/5 p-1">
            <button type="button" onClick={() => setMode("login")} className={`segmented ${mode === "login" ? "segmented-active" : ""}`}>Login</button>
            <button type="button" onClick={() => setMode("signup")} className={`segmented ${mode === "signup" ? "segmented-active" : ""}`}>Signup</button>
          </div>
          {mode === "signup" && <Field label="Username" value={form.username} onChange={(value) => setForm({ ...form, username: value })} />}
          <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
          <Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
          {mode === "signup" && (
            <Field
              label="Admin invite key (optional)"
              required={false}
              type="password"
              value={form.adminSecretKey}
              onChange={(value) => setForm({ ...form, adminSecretKey: value })}
            />
          )}
          <button disabled={submitting} className="primary-btn w-full justify-center py-3">{submitting ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
      </div>
    </PageTransition>
  );
}

function Field({ label, value, onChange, type = "text", required = true }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input className="input mt-2" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}
