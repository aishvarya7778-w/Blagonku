import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Save, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { api } from "../services/api.js";

export default function BlogEditorPage() {
  const [form, setForm] = useState({ title: "", excerpt: "", category: "Cosmology", tags: "" });
  const [cover, setCover] = useState(null);
  const navigate = useNavigate();
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Write a signal worth sending..." })],
    content: ""
  });

  const submit = async (status) => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("status", status);
    data.append("content", editor?.getHTML() || "");
    if (cover) data.append("coverImage", cover);
    const res = await api.post("/blogs", data);
    toast.success(status === "published" ? "Blog published" : "Draft saved");
    navigate(status === "published" ? `/blogs/${res.data.slug}` : "/dashboard");
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-wide text-aurora">Creator studio</p>
          <h1 className="font-display text-3xl font-bold text-white">Launch a new post</h1>
        </div>
        <div className="glass-card space-y-5 p-6">
          <input className="input text-xl font-semibold" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <textarea className="input min-h-24" placeholder="Excerpt" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} />
          <div className="grid gap-4 md:grid-cols-3">
            <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              <option>Cosmology</option>
              <option>Mars Exploration</option>
              <option>Black Holes</option>
              <option>Exoplanets</option>
              <option>AI & Space</option>
            </select>
            <input className="input md:col-span-2" placeholder="tags, separated, by commas" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
          </div>
          <input className="input" type="file" accept="image/*" onChange={(event) => setCover(event.target.files?.[0])} />
          <div className="editor-shell">
            <EditorContent editor={editor} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="secondary-btn" onClick={() => submit("draft")}><Save className="h-4 w-4" /> Save draft</button>
            <button className="primary-btn" onClick={() => submit("published")}><Send className="h-4 w-4" /> Publish</button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
