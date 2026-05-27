import { memo, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Clock, Heart, MessageCircle, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import fallback from "../assets/nebula.png";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { getId, includesId } from "../utils/ids.js";
import { shareBlog } from "../utils/share.js";
const asArray = (value) => (Array.isArray(value) ? value : []);

function BlogCard({ blog, compact = false }) {
  const { user, syncBookmarks } = useAuth();
  const image = blog.coverImage?.url || fallback;
  const [likes, setLikes] = useState(asArray(blog?.likes));
  const [liked, setLiked] = useState(() => includesId(blog.likes, user?._id));
  const [bookmarked, setBookmarked] = useState(() => includesId(user?.bookmarks, blog._id));
  const [busy, setBusy] = useState({ like: false, bookmark: false });
  const blogUrl = useMemo(() => `${window.location.origin}/blogs/${blog.slug}`, [blog.slug]);

  useEffect(() => {
    setLiked(includesId(likes, user?._id));
    setBookmarked(includesId(user?.bookmarks, blog._id));
  }, [user?._id, user?.bookmarks, blog._id, likes]);

  const toggleLike = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) return toast.error("Login to like posts");
    if (busy.like) return;

    const previousLikes = asArray(likes);
    const previousLiked = liked;
    const optimisticLikes = liked ? likes.filter((id) => getId(id) !== user._id) : [...likes, user._id];
    setLiked(!liked);
    setLikes(optimisticLikes);
    setBusy((current) => ({ ...current, like: true }));

    try {
      const res = await api.post(`/blogs/${blog._id}/like`);
      setLiked(res.liked);
      setLikes(asArray(res?.likes));
    } catch (error) {
      setLiked(previousLiked);
      setLikes(previousLikes);
      toast.error(error.message);
    } finally {
      setBusy((current) => ({ ...current, like: false }));
    }
  };

  const toggleBookmark = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) return toast.error("Login to bookmark posts");
    if (busy.bookmark) return;

    const previous = bookmarked;
    setBookmarked(!bookmarked);
    setBusy((current) => ({ ...current, bookmark: true }));

    try {
      const res = await api.post(`/users/bookmarks/${blog._id}`);
      setBookmarked(res.bookmarked);
      syncBookmarks(asArray(res?.bookmarks));
      toast.success(res.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch (error) {
      setBookmarked(previous);
      toast.error(error.message);
    } finally {
      setBusy((current) => ({ ...current, bookmark: false }));
    }
  };

  const share = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await shareBlog({ title: blog.title, text: blog.excerpt, url: blogUrl });
  };

  return (
    <motion.article
      className="glass-card card-hover group overflow-hidden"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28 }}
    >
      <Link to={`/blogs/${blog.slug}`} className="block">
        <div className={compact ? "h-40" : "h-52"}>
          <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={image} alt={blog.title} loading="lazy" />
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-aurora">
          <span>{blog.category}</span>
          <span className="flex items-center gap-1 text-slate-400"><Clock className="h-3.5 w-3.5" /> {blog.readingTime || 1} min</span>
        </div>
        <Link to={`/blogs/${blog.slug}`}>
          <h3 className="font-display text-xl font-semibold leading-tight text-white transition group-hover:text-aurora">{blog.title}</h3>
        </Link>
        <p className="line-clamp-3 text-sm leading-6 text-slate-400">{blog.excerpt}</p>
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400">
          <span>{blog.author?.username || "Blagonku"}</span>
          <span className="flex items-center gap-2">
            <button className={`micro-action ${liked ? "micro-action-liked" : ""}`} onClick={toggleLike} aria-label="Like post" disabled={busy.like}>
              <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> {likes?.length || 0}
            </button>
            <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {blog.commentsCount || 0}</span>
            <button className={`micro-action ${bookmarked ? "micro-action-saved" : ""}`} onClick={toggleBookmark} aria-label="Bookmark post" disabled={busy.bookmark}>
              <Bookmark className="h-4 w-4" fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <button className="micro-action" onClick={share} aria-label="Share post">
              <Share2 className="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(BlogCard);
