import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BlogCard from "../components/BlogCard.jsx";
import PageTransition from "../components/PageTransition.jsx";
import Spinner from "../components/Spinner.jsx";
import { api } from "../services/api.js";

const asArray = (value) => (Array.isArray(value) ? value : []);

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get(`/users/${id}`).then((res) => setProfile({ ...res, blogs: asArray(res?.blogs) })).catch(() => setProfile({ user: null, blogs: [] }));
  }, [id]);

  if (!profile) return <Spinner label="Loading profile" />;
  if (!profile.user) return <div className="glass-card p-10 text-center text-slate-400">Profile not found.</div>;

  return (
    <PageTransition>
      <div className="glass-card mb-8 p-6">
        <p className="text-sm uppercase tracking-wide text-aurora">{profile.user.role}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">{profile.user.username}</h1>
        <p className="mt-3 max-w-2xl text-slate-400">{profile.user.bio || "No bio yet."}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{profile.blogs?.map((blog) => <BlogCard blog={{ ...blog, author: profile.user }} key={blog._id} />)}</div>
    </PageTransition>
  );
}
