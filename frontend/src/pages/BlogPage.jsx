import { motion } from "framer-motion";
import { Bookmark, Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import BlogCard from "../components/BlogCard.jsx";
import CommentsSection from "../components/CommentsSection.jsx";
import PageTransition from "../components/PageTransition.jsx";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import fallback from "../assets/black_hole.png";
import { getId, includesId } from "../utils/ids.js";
import { shareBlog } from "../utils/share.js";

export default function BlogPage() {
  const { slug } = useParams();
  const { user, syncBookmarks } = useAuth();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ like: false, bookmark: false });
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/blogs/${slug}`)
      .then((res) => {
        setBlog(res.data);
        setRelated(res.related || []);
        document.title = `${res.data.title} | Blagonku`;
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const like = async () => {
    if (!user) return toast.error("Login to like posts");
    if (actionLoading.like) return;

    const liked = includesId(blog.likes, user._id);
    const previous = blog.likes || [];
    const optimisticLikes = liked ? previous.filter((id) => getId(id) !== user._id) : [...previous, user._id];
    setBlog((current) => ({ ...current, likes: optimisticLikes }));
    setActionLoading((current) => ({ ...current, like: true }));

    try {
      const res = await api.post(`/blogs/${blog._id}/like`);
      setBlog((current) => ({ ...current, likes: res.likes || Array.from({ length: res.likesCount }) }));
    } catch (err) {
      setBlog((current) => ({ ...current, likes: previous }));
      toast.error(err.message);
    } finally {
      setActionLoading((current) => ({ ...current, like: false }));
    }
  };

  const bookmark = async () => {
    if (!user) return toast.error("Login to bookmark posts");
    if (actionLoading.bookmark) return;

    const wasBookmarked = includesId(user.bookmarks, blog._id);
    const previousBookmarks = user.bookmarks || [];
    const optimisticBookmarks = wasBookmarked
      ? previousBookmarks.filter((id) => getId(id) !== blog._id)
      : [...previousBookmarks, blog._id];
    syncBookmarks(optimisticBookmarks);
    setActionLoading((current) => ({ ...current, bookmark: true }));
    try {
      const res = await api.post(`/users/bookmarks/${blog._id}`);
      syncBookmarks(res.bookmarks);
      toast.success(res.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch (err) {
      syncBookmarks(previousBookmarks);
      toast.error(err.message);
    } finally {
      setActionLoading((current) => ({ ...current, bookmark: false }));
    }
  };

  const share = async () => {
    await shareBlog({
      title: blog.title,
      text: blog.excerpt,
      url: `${window.location.origin}/blogs/${blog.slug}`
    });
  };

  if (loading) return <Spinner label="Opening transmission" />;
  if (error) return <div className="glass-card p-10 text-center text-slate-300">{error}</div>;
  if (!blog) return null;

  const liked = includesId(blog.likes, user?._id);
  const bookmarked = includesId(user?.bookmarks, blog._id);

  return (
    <PageTransition>
      <article className="mx-auto max-w-4xl">
        <motion.img
          className="h-[380px] w-full rounded-lg object-cover shadow-violet"
          src={blog.coverImage?.url || fallback}
          alt={blog.title}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        />
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-aurora">
            <span>{blog.category}</span><span>{blog.readingTime} min read</span><span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">{blog.title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">{blog.excerpt}</p>
          <div className="mt-6 flex items-center justify-between border-y border-white/10 py-4">
            <Link to={`/profile/${blog.author?._id}`} className="text-sm text-slate-300">By {blog.author?.username || "Blagonku"}</Link>
            <div className="flex gap-2">
              <button className={`icon-btn ${liked ? "action-active-like" : ""}`} onClick={like} title="Like" disabled={actionLoading.like}>
                <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> {blog.likes?.length || 0}
              </button>
              <button className={`icon-btn ${bookmarked ? "action-active-save" : ""}`} onClick={bookmark} title="Bookmark" disabled={actionLoading.bookmark}>
                <Bookmark className="h-4 w-4" fill={bookmarked ? "currentColor" : "none"} />
              </button>
              <button className="icon-btn" onClick={share} title="Share"><Share2 className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="prose prose-invert prose-slate mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </article>

      <CommentsSection blogId={blog._id} />

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-2xl font-semibold">Related posts</h2>
          <div className="grid gap-5 md:grid-cols-3">{related.map((item) => <BlogCard blog={item} compact key={item._id} />)}</div>
        </section>
      )}
    </PageTransition>
  );
}
