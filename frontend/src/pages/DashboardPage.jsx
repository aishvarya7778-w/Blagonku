import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { api } from "../services/api.js";

export default function DashboardPage() {
  const [blogs, setBlogs] = useState([]);

  const load = () => api.get("/blogs/mine").then((res) => setBlogs(res.data));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await api.delete(`/blogs/${id}`);
    toast.success("Blog deleted");
    load();
  };

  return (
    <PageTransition>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-aurora">Creator dashboard</p>
          <h1 className="font-display text-3xl font-bold text-white">Your studio</h1>
        </div>
        <Link className="primary-btn" to="/editor"><Plus className="h-4 w-4" /> New post</Link>
      </div>
      <div className="glass-card overflow-hidden">
        {blogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No posts yet. Launch your first draft.</div>
        ) : blogs.map((blog) => (
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 last:border-0 md:flex-row md:items-center md:justify-between" key={blog._id}>
            <div>
              <p className="text-xs uppercase tracking-wide text-aurora">{blog.status}</p>
              <h2 className="font-display text-xl font-semibold text-white">{blog.title}</h2>
              <p className="text-sm text-slate-400">{blog.category} · {blog.readingTime} min read</p>
            </div>
            <div className="flex gap-2">
              <Link className="icon-btn" to={`/blogs/${blog.slug}`} title="View"><Edit3 className="h-4 w-4" /></Link>
              <button className="icon-btn" onClick={() => remove(blog._id)} title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}
