// TODO: Remove blogs.json usage and migrate all blog logic to Firestore.
// Blog listing page: Fetches blogs from Firestore and links to dynamic blog detail pages. Only admin can create blogs.
// TODO: Implement pagination or infinite scroll if blog list grows large.
// TODO: Add loading and error states for better UX.
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth } from "../../../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { motion } from "framer-motion";
import Image from "next/image";
import Head from "next/head";

interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  static?: boolean;
}

// Static blogs about Cyborg Robotics Academy
const staticBlogs: Blog[] = [
  {
    id: "static-1",
    title: "Welcome to Cyborg Robotics Academy!",
    content:
      "Cyborg Robotics Academy Private Limited, based in Pune, offers a wide range of technical courses, including Lego Robotics, Electronics, Arduino, IoT, Python, Java, Web Design, App Design, 3D Printing, Animation and Coding both in-person and online. Our hands-on programs emphasize Learning by Doing to develop problem-solving and inquiry skills. Join us to unlock your potential in technology!",
    author: "Cyborg Robotics Academy",
    date: "2024-06-01",
    imageUrl: "/assets/logo.png",
    static: true,
  },
  {
    id: "static-2",
    title: "Explore Our Robotics Courses",
    content:
      "From Lego Robotics to Arduino and EV3, our robotics courses are designed for all age groups. Students learn to build, program, and innovate with real-world robotics kits, fostering creativity and technical skills.",
    author: "Cyborg Robotics Academy",
    date: "2024-06-01",
    imageUrl: "/assets/classroom-course/ev3.webp",
    static: true,
  },
  {
    id: "static-3",
    title: "Learn Programming: Python, Java, and More",
    content:
      "Our programming courses cover Python, Java, Web Design, and App Design. Whether you are a beginner or looking to advance your skills, our curriculum is tailored to help you succeed in the digital world.",
    author: "Cyborg Robotics Academy",
    date: "2024-06-01",
    imageUrl: "/assets/courses/coding.png",
    static: true,
  },
  {
    id: "static-4",
    title: "3D Printing and Animation Coding",
    content:
      "Step into the future with our 3D Printing and Animation Coding courses. Learn to design, print, and animate your own creations, combining technology and creativity in exciting new ways.",
    author: "Cyborg Robotics Academy",
    date: "2024-06-01",
    imageUrl: "/assets/courses/3dprinter.png",
    static: true,
  },
];

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsCol = collection(db, "blogs");
        const blogSnapshot = await getDocs(blogsCol);
        const blogList = blogSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Blog[];
        // Merge static blogs with Firestore blogs
        setBlogs([...staticBlogs, ...blogList]);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUserChecked(true);
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        // Check if user is admin (same logic as admin-dashboard)
        const { doc, getDoc } = await import("firebase/firestore");
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Loading skeleton component
  const BlogSkeleton = () => (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-2xl mb-6"></div>
      <div className="h-6 bg-gray-200 rounded-lg mb-3 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    // Strip HTML tags before truncating
    const strippedContent = content.replace(/<[^>]+>/g, "");
    if (strippedContent.length <= maxLength) return strippedContent;
    return strippedContent.substr(0, maxLength) + "...";
  };

  return (
    <>
      <Head>
        <title>Cyborg Blog | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Insights, tutorials, and the latest in robotics, programming, and tech education from Cyborg Robotics Academy."
        />
        <meta
          property="og:title"
          content="Cyborg Blog | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Insights, tutorials, and the latest in robotics, programming, and tech education from Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Blog Listing"
        className="min-h-screen bg-white"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-gradient-to-r from-white via-red-50 to-white  border-b border-red-100 shadow-sm"
        >
          <div className="relative max-w-3xl mx-auto px-4 text-center flex flex-col items-center mt-8">
            <motion.div initial={false} animate={false} className="w-full">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight"
              >
                Cyborg <span className="text-red-700">Blog</span>
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0.7 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mx-auto w-16 h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600 rounded-full mb-4 origin-center"
              />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-2"
              >
                Insights, tutorials, and the latest in robotics, programming,
                and tech education.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Admin Controls */}
          {userChecked && isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12 flex justify-center"
            >
              <button
                className="group relative bg-gradient-to-r from-red-700 to-red-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                onClick={() => router.push("/blogs/create")}
                style={{
                  background:
                    "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)",
                }}
              >
                <svg
                  className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Create New Blog</span>
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && blogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">
                No blogs found
              </h3>
              <p className="text-gray-500">Check back later for new content!</p>
            </motion.div>
          )}

          {/* Blog Grid */}
          {!loading && blogs.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, idx) =>
                blog.static ? (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.3 },
                    }}
                    className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                  >
                    {/* Static blog indicator */}
                    <div className="absolute top-4 right-4 z-10">
                      <span
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                        style={{ background: "#991b1b" }}
                      >
                        Featured
                      </span>
                    </div>

                    {blog.imageUrl && (
                      <div className="relative overflow-hidden h-56">
                        <Image
                          src={blog.imageUrl}
                          alt={blog.title}
                          width={600}
                          height={224}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}

                    <div className="p-8">
                      <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-red-700 transition-colors duration-300 line-clamp-2">
                        {blog.title}
                      </h2>

                      <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="font-medium">{blog.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
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
                      </div>

                      <p
                        className="text-gray-700 text-base leading-relaxed line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: truncateContent(blog.content),
                        }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.id}`}
                    className="block group"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      whileHover={{
                        y: -8,
                        transition: { duration: 0.3 },
                      }}
                      className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                    >
                      {blog.imageUrl && (
                        <div className="relative overflow-hidden h-56">
                          <Image
                            src={blog.imageUrl}
                            alt={blog.title}
                            width={600}
                            height={224}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            priority
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}

                      <div className="p-8">
                        <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-red-700 transition-colors duration-300 line-clamp-2">
                          {blog.title}
                        </h2>

                        <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                          <div className="flex items-center space-x-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span className="font-medium">{blog.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg
                              className="w-4 h-4"
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
                        </div>

                        <p
                          className="text-gray-700 text-base leading-relaxed line-clamp-3 mb-4"
                          dangerouslySetInnerHTML={{
                            __html: truncateContent(blog.content),
                          }}
                        />

                        <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                          <span>Read More</span>
                          <svg
                            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default BlogsPage;
