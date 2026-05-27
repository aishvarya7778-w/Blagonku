import { motion } from "framer-motion";
import { ArrowRight, Mail, Search, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BlogCard from "../components/BlogCard.jsx";
import PageTransition from "../components/PageTransition.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import blackHole from "../assets/black_hole.png";
import useDebounce from "../hooks/useDebounce.js";
import { api } from "../services/api.js";

const categories = ["All", "Cosmology", "Mars Exploration", "Black Holes", "Exoplanets", "AI & Space"];

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    const params = new URLSearchParams({ page: "1", limit: "9" });
    if (debouncedQuery) params.set("search", debouncedQuery);
    if (category !== "All") params.set("category", category);
    setLoading(true);
    api
      .get(`/blogs?${params}`)
      .then((res) => setBlogs(res.data))
      .finally(() => setLoading(false));
  }, [debouncedQuery, category]);

  useEffect(() => {
    Promise.all([api.get("/blogs/featured"), api.get("/blogs/trending")]).then(([featuredRes, trendingRes]) => {
      setFeatured(featuredRes.data);
      setTrending(trendingRes.data);
    }).catch(() => {});
  }, []);

  const hero = featured[0] || blogs[0];

  return (
    <PageTransition>
      <section className="grid items-center gap-8 pb-10 lg:grid-cols-[1.2fr_.8fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-aurora/20 bg-aurora/10 px-3 py-2 text-sm text-aurora shadow-glow">
            <Sparkles className="h-4 w-4" /> Premium cosmic publishing
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            Blagonku turns ideas into constellations.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A dark, elegant platform for writing, discovering, bookmarking, and moderating thoughtful long-form posts.
          </p>
          <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-2 backdrop-blur">
            <Search className="ml-3 h-5 w-5 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-white outline-none" placeholder="Search blogs, tags, categories..." />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="primary-btn" to="/editor">Start writing <ArrowRight className="h-4 w-4" /></Link>
            <a className="secondary-btn" href="#latest">Explore posts</a>
          </div>
        </motion.div>
        {hero && (
          <motion.div className="glass-card card-hover overflow-hidden" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.08 }}>
            <img src={hero.coverImage?.url || blackHole} alt={hero.title} className="h-64 w-full object-cover" />
            <div className="p-6">
              <p className="text-sm uppercase tracking-wide text-aurora">Featured transmission</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">{hero.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{hero.excerpt}</p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-aurora" to={`/blogs/${hero.slug}`}>Read feature <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </motion.div>
        )}
      </section>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`chip ${category === item ? "chip-active" : ""}`}>
            {item}
          </button>
        ))}
      </div>

      {featured.length > 1 && (
        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-white">Featured signals</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{featured.slice(1, 4).map((blog) => <BlogCard blog={blog} compact key={blog._id} />)}</div>
        </section>
      )}

      <section id="latest" className="mb-12 scroll-mt-24">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-white">Latest launches</h2>
        </div>
        {loading ? <SkeletonGrid /> : blogs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{blogs.map((blog) => <BlogCard blog={blog} key={blog._id} />)}</div> : <EmptyState />}
      </section>

      <section>
        <h2 className="mb-5 flex items-center gap-2 font-display text-2xl font-semibold text-white"><TrendingUp className="h-5 w-5 text-flare" /> Trending orbits</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{trending.map((blog) => <BlogCard blog={blog} compact key={blog._id} />)}</div>
      </section>

      <section className="my-12 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-aurora/15 via-white/[0.06] to-flare/10 p-8 shadow-glow">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-aurora"><Mail className="h-5 w-5" /></div>
          <h2 className="font-display text-3xl font-bold text-white">Join the weekly orbit.</h2>
          <p className="mt-3 text-slate-300">A curated digest of featured writing, creator picks, and cosmic product updates.</p>
          <div className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input className="input" placeholder="you@galaxy.dev" />
            <button className="primary-btn whitespace-nowrap">Notify me</button>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

function EmptyState() {
  return <div className="glass-card p-10 text-center text-slate-400">No transmissions found. Try a different search path.</div>;
}
