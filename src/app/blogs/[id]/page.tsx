// Dynamic blog detail page: Fetches a blog by ID from Firestore. Only admin can edit/delete.
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../../firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { auth } from "../../../../firebaseConfig";
import Image from "next/image";
import Head from "next/head";

interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  createdAt?: unknown;
}

const BlogDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        const blogRef = doc(db, "blogs", id);
        const blogSnap = await getDoc(blogRef);
        if (blogSnap.exists()) {
          setBlog({ id: blogSnap.id, ...blogSnap.data() } as Blog);
        } else {
          setError("Blog not found");
        }
      } catch {
        setError("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return setIsAdmin(false);
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleDelete = async () => {
    if (!blog) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "blogs", blog.id));
      router.push("/blogs");
    } catch {
      setError("Failed to delete blog");
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  if (loading) {
    return (
      <main
        role="main"
        aria-label="Loading Blog"
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pt-24"
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg mb-6 w-32"></div>
            <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-48"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main
        role="main"
        aria-label="Blog Not Found"
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pt-24"
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {error || "Blog not found"}
            </h1>
            <p className="text-gray-600 mb-8">
              The blog post you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Link
              href="/blogs"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Blogs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{blog.title} | Cyborg Blog</title>
        <meta
          name="description"
          content={
            blog.content?.slice(0, 150) ||
            "Blog post from Cyborg Robotics Academy."
          }
        />
        <meta property="og:title" content={blog.title} />
        <meta
          property="og:description"
          content={
            blog.content?.slice(0, 150) ||
            "Blog post from Cyborg Robotics Academy."
          }
        />
        <meta property="og:type" content="article" />
      </Head>
      <main
        role="main"
        aria-label="Blog Detail"
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pt-24 pb-12"
      >
        <div className="max-w-4xl mx-auto px-4">
          {/* Navigation */}
          <div className="mb-8">
            <Link
              href="/blogs"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium transition-colors duration-200 group"
            >
              <svg
                className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Blogs
            </Link>
          </div>

          {/* Main Content */}
          <article className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Featured Image */}
            {blog.imageUrl && (
              <div className="relative h-80 md:h-96 overflow-hidden">
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  width={800}
                  height={384}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}

            <div className="p-4 md:p-6">
              {/* Article Header */}
              <header className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {blog.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {blog.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-700">
                      By {blog.author}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDate(blog.date)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{getReadingTime(blog.content)} min read</span>
                  </div>
                </div>
              </header>

              {/* Article Content */}
              <div className="prose max-w-none text-gray-800">
                <div
                  className="text-base"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => router.push(`/blogs/${blog.id}/edit`)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Blog
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Blog
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Blog Post
                </h3>

                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete &quot;{blog.title}&quot;? This
                  action cannot be undone.
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Deleting...
                      </div>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default BlogDetailPage;
