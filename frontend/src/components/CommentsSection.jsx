import { AnimatePresence, motion } from "framer-motion";
import { Edit3, Heart, MessageCircle, Reply, Send, Trash2, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { getId, includesId } from "../utils/ids.js";

const countComments = (items = []) =>
  (Array.isArray(items) ? items : []).reduce((total, item) => total + 1 + countComments(item.replies || []), 0);

const asArray = (value) => (Array.isArray(value) ? value : []);

const updateCommentInTree = (items, id, updater) =>
  asArray(items).map((item) => {
    if (item._id === id) return updater(item);
    return { ...item, replies: updateCommentInTree(item.replies || [], id, updater) };
  });

const removeCommentFromTree = (items, id) =>
  asArray(items)
    .filter((item) => item._id !== id)
    .map((item) => ({ ...item, replies: removeCommentFromTree(item.replies || [], id) }));

const addReplyToTree = (items, parentId, reply) =>
  asArray(items).map((item) => {
    if (item._id === parentId) return { ...item, replies: [...(item.replies || []), reply] };
    return { ...item, replies: addReplyToTree(item.replies || [], parentId, reply) };
  });

export default function CommentsSection({ blogId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = () => {
    setLoading(true);
    setError("");
    api
      .get(`/comments/${blogId}`)
      .then((res) => setComments(asArray(res?.data)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (blogId) loadComments();
  }, [blogId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!user) return toast.error("Login to comment");
    if (!content.trim()) return;

    const temp = {
      _id: `temp-${Date.now()}`,
      content: content.trim(),
      user,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      pending: true
    };

    setComments((current) => [temp, ...current]);
    setContent("");
    setSubmitting(true);

    try {
      const res = await api.post(`/comments/${blogId}`, { content: temp.content });
      setComments((current) => asArray(current).map((item) => (item._id === temp._id ? res.data : item)));
    } catch (err) {
      setComments((current) => asArray(current).filter((item) => item._id !== temp._id));
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdated = (id, updater) => setComments((current) => updateCommentInTree(current, id, updater));
  const onDeleted = (id) => setComments((current) => removeCommentFromTree(current, id));
  const onReply = (parentId, reply) => setComments((current) => addReplyToTree(current, parentId, reply));

  return (
    <section className="mx-auto mt-12 max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
          <MessageCircle className="h-5 w-5 text-aurora" /> Comments
          <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-400">{countComments(comments)}</span>
        </h2>
        {error && <button className="secondary-btn" onClick={loadComments}>Retry</button>}
      </div>

      <form onSubmit={submit} className="glass-card mb-6 flex gap-3 p-3">
        <input
          className="input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={user ? "Add a thoughtful reply..." : "Login to join the discussion"}
          disabled={submitting}
        />
        <button className="primary-btn" disabled={submitting || !content.trim()}><Send className="h-4 w-4" /></button>
      </form>

      {loading ? <CommentSkeleton /> : null}
      {error && !loading ? <div className="glass-card p-6 text-center text-slate-400">{error}</div> : null}
      {!loading && !error && comments?.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400">No comments yet. Start the first signal.</div>
      ) : null}

      <AnimatePresence initial={false}>
        <div className="space-y-3">
          {comments?.map((comment) => (
            <CommentItem
              comment={comment}
              depth={0}
              key={comment._id}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
              onReply={onReply}
              onReload={loadComments}
            />
          ))}
        </div>
      </AnimatePresence>
    </section>
  );
}

const CommentItem = memo(function CommentItem({ comment, depth, onUpdated, onDeleted, onReply, onReload }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [replyDraft, setReplyDraft] = useState("");
  const canModify = user && (user.role === "admin" || getId(comment.user) === user._id);
  const liked = includesId(comment.likes, user?._id);
  const replies = asArray(comment?.replies);

  const avatar = comment.user?.profileImage?.url;
  const initials = (comment.user?.username || "U").slice(0, 2).toUpperCase();

  const saveEdit = async () => {
    if (!draft.trim()) return;
    const previous = comment.content;
    onUpdated(comment._id, (item) => ({ ...item, content: draft.trim() }));
    setEditing(false);
    try {
      const res = await api.put(`/comments/${comment._id}`, { content: draft.trim() });
      onUpdated(comment._id, (item) => ({ ...item, ...res.data }));
    } catch (err) {
      onUpdated(comment._id, (item) => ({ ...item, content: previous }));
      toast.error(err.message);
    }
  };

  const remove = async () => {
    const id = comment._id;
    onDeleted(id);
    try {
      await api.delete(`/comments/${id}`);
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err.message);
      onReload();
    }
  };

  const like = async () => {
    if (!user) return toast.error("Login to like comments");
    const previous = asArray(comment?.likes);
    const nextLikes = liked ? previous.filter((id) => getId(id) !== user._id) : [...previous, user._id];
    onUpdated(comment._id, (item) => ({ ...item, likes: nextLikes }));
    try {
      const res = await api.post(`/comments/${comment._id}/like`);
      onUpdated(comment._id, (item) => ({ ...item, likes: asArray(res?.likes).length ? asArray(res?.likes) : nextLikes }));
    } catch (err) {
      onUpdated(comment._id, (item) => ({ ...item, likes: previous }));
      toast.error(err.message);
    }
  };

  const submitReply = async (event) => {
    event.preventDefault();
    if (!user) return toast.error("Login to reply");
    if (!replyDraft.trim()) return;

    const temp = {
      _id: `temp-${Date.now()}`,
      content: replyDraft.trim(),
      user,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      parentComment: comment._id,
      pending: true
    };

    onReply(comment._id, temp);
    setReplyDraft("");
    setReplying(false);
    try {
      const res = await api.post(`/comments/${comment._id}/reply`, { content: temp.content });
      onUpdated(temp._id, (item) => ({ ...item, ...res.data, pending: false }));
    } catch (err) {
      onDeleted(temp._id);
      toast.error(err.message);
    }
  };

  return (
    <motion.div
      className={depth > 0 ? "ml-4 border-l border-white/10 pl-4 sm:ml-8 sm:pl-5" : ""}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`glass-card comment-card p-4 ${comment.pending ? "opacity-70" : ""}`}>
        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/10">
            {avatar ? <img src={avatar} alt={comment.user?.username} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-xs font-bold text-aurora">{initials}</div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-white">{comment.user?.username || "Unknown"}</p>
                <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
              </div>
              {canModify && (
                <div className="flex gap-1">
                  <button className="micro-action" onClick={() => setEditing(true)} title="Edit"><Edit3 className="h-4 w-4" /></button>
                  <button className="micro-action text-rose-300" onClick={remove} title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="mt-3 space-y-3">
                <textarea className="input min-h-24" value={draft} onChange={(event) => setDraft(event.target.value)} />
                <div className="flex gap-2">
                  <button className="primary-btn" onClick={saveEdit}>Save</button>
                  <button className="secondary-btn" onClick={() => { setEditing(false); setDraft(comment.content); }}><X className="h-4 w-4" /> Cancel</button>
                </div>
              </div>
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-slate-300">{comment.content}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <button className={`micro-action ${liked ? "micro-action-liked" : ""}`} onClick={like}>
                <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> {comment.likes?.length || 0}
              </button>
              <button className="micro-action" onClick={() => setReplying((value) => !value)}><Reply className="h-4 w-4" /> Reply</button>
              {replies.length > 0 && (
                <button className="micro-action" onClick={() => setCollapsed((value) => !value)}>
                  {collapsed ? "Show" : "Hide"} {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>

            <AnimatePresence>
              {replying && (
                <motion.form className="mt-4 flex gap-2" onSubmit={submitReply} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <input className="input" value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="Write a reply..." />
                  <button className="primary-btn" disabled={!replyDraft.trim()}><Send className="h-4 w-4" /></button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {!collapsed && replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies?.map((reply) => (
            <CommentItem comment={reply} depth={depth + 1} key={reply._id} onUpdated={onUpdated} onDeleted={onDeleted} onReply={onReply} onReload={onReload} />
          ))}
        </div>
      )}
    </motion.div>
  );
});

function CommentSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div className="glass-card p-4" key={item}>
          <div className="flex gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-12 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
