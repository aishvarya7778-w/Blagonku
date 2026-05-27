import { Ban, BarChart3, FileText, ShieldCheck, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageTransition from "../components/PageTransition.jsx";
import { api } from "../services/api.js";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);

  const load = () => {
    Promise.all([api.get("/admin/dashboard"), api.get("/admin/users?limit=12"), api.get("/admin/blogs?limit=12")]).then(([dash, userRes, blogRes]) => {
      setDashboard(dash);
      setUsers(userRes.data);
      setBlogs(blogRes.data);
    });
  };

  useEffect(() => { load(); }, []);

  const suspend = async (user) => {
    await api.patch(`/admin/users/${user._id}/suspension`, { isSuspended: !user.isSuspended });
    toast.success("User moderation updated");
    load();
  };

  const moderate = async (blog, status) => {
    await api.patch(`/admin/blogs/${blog._id}`, { status, featured: blog.featured });
    toast.success("Blog moderation updated");
    load();
  };

  const deleteBlog = async (blog) => {
    await api.delete(`/blogs/${blog._id}`);
    toast.success("Blog deleted");
    load();
  };

  return (
    <PageTransition>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-aurora">Admin command</p>
        <h1 className="font-display text-3xl font-bold text-white">Moderation dashboard</h1>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Stat icon={Users} label="Users" value={dashboard?.stats.totalUsers || 0} />
        <Stat icon={FileText} label="Blogs" value={dashboard?.stats.totalBlogs || 0} />
        <Stat icon={BarChart3} label="Comments" value={dashboard?.stats.totalComments || 0} />
        <Stat icon={ShieldCheck} label="Reports" value={(dashboard?.stats.reportedBlogs || 0) + (dashboard?.stats.reportedComments || 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Users">
          {users.map((user) => (
            <div className="row" key={user._id}>
              <div><p className="font-medium text-white">{user.username}</p><p className="text-sm text-slate-400">{user.email}</p></div>
              <button className="secondary-btn" onClick={() => suspend(user)}><Ban className="h-4 w-4" /> {user.isSuspended ? "Unsuspend" : "Suspend"}</button>
            </div>
          ))}
        </Panel>
        <Panel title="Blogs">
          {blogs.map((blog) => (
            <div className="row" key={blog._id}>
              <div><p className="font-medium text-white">{blog.title}</p><p className="text-sm text-slate-400">{blog.status} · {blog.author?.username}</p></div>
              <div className="flex flex-wrap gap-2">
                <button className="secondary-btn" onClick={() => moderate(blog, blog.status === "published" ? "draft" : "published")}>{blog.status === "published" ? "Unpublish" : "Publish"}</button>
                <button className="secondary-btn danger-btn" onClick={() => deleteBlog(blog)}><Trash2 className="h-4 w-4" /> Delete</button>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </PageTransition>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="glass-card p-5"><Icon className="h-5 w-5 text-aurora" /><p className="mt-4 text-3xl font-bold text-white">{value}</p><p className="text-sm text-slate-400">{label}</p></div>;
}

function Panel({ title, children }) {
  return <section className="glass-card overflow-hidden"><h2 className="border-b border-white/10 p-5 font-display text-xl font-semibold">{title}</h2><div>{children}</div></section>;
}
