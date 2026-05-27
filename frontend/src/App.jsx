import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Spinner from "./components/Spinner.jsx";

const AdminPage = lazy(() => import("./pages/AdminPage.jsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));
const BlogEditorPage = lazy(() => import("./pages/BlogEditorPage.jsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.jsx"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage.jsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Spinner label="Loading interface" />}>
        <Routes location={location} key={location.pathname}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/blogs/:slug" element={<BlogPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor"
              element={
                <ProtectedRoute>
                  <BlogEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <ProtectedRoute>
                  <BookmarksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
