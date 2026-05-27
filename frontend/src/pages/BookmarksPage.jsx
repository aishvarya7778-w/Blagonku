import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard.jsx";
import PageTransition from "../components/PageTransition.jsx";
import { api } from "../services/api.js";

export default function BookmarksPage() {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => { api.get("/users/bookmarks").then((res) => setBlogs(res.data)); }, []);

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-3xl font-bold text-white">Saved transmissions</h1>
      {blogs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{blogs.map((blog) => <BlogCard blog={blog} key={blog._id} />)}</div> : <div className="glass-card p-10 text-center text-slate-400">Your bookmark vault is empty.</div>}
    </PageTransition>
  );
}
