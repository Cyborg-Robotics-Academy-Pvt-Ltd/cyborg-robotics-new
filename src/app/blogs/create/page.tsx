"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import Image from "next/image";

const CreateBlogPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [wordCount, setWordCount] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [prompt, setPrompt] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);

  // Cloudinary config
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.CLOUDINARY_UPLOAD_PRESET || "shrikant";
  const CLOUDINARY_CLOUD_NAME =
    process.env.CLOUDINARY_CLOUD_NAME || "dz8enfjtx";

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        router.push("/login");
        return;
      }
      const adminDocRef = doc(db, "admins", user.uid);
      const adminDoc = await getDoc(adminDocRef);
      if (!adminDoc.exists()) {
        setIsAdmin(false);
        router.push("/login");
        return;
      }
      setIsAdmin(true);
      setAuthor(user.email || "");
    };
    checkAdmin();
  }, [router]);

  // Update word count when content changes
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  useEffect(() => {
    if (contentRef.current && content !== contentRef.current.innerHTML) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!title || !content || !author) {
        setError("Title, content, and author are required.");
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          author,
          date: new Date().toISOString().split("T")[0],
          imageUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create blog');
      }
      
      router.push("/blogs");
    } catch {
      setError("Failed to create blog. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image file upload to Cloudinary
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");
      setImageUrl(data.secure_url);
      setImagePreview(data.secure_url);
    } catch (err) {
      setError((err as Error).message || "Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  // Rich text formatting functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const renderPreview = () => {
    return (
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {title || "Blog Title"}
        </h1>
        {imagePreview && (
          <Image
            src={imagePreview}
            alt="Featured"
            width={800}
            height={256}
            className="w-full h-64 object-cover rounded-lg mb-6"
            priority
          />
        )}
        <div className="text-sm text-gray-500 mb-6">
          By {author} • {new Date().toLocaleDateString()}
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: content || "Your blog content will appear here...",
          }}
          className="text-gray-700 leading-relaxed"
        />
      </div>
    );
  };

  const generateBlog = async () => {
    setLoading(true);
    // Step 1: Generate initial blog
    const res = await fetch("/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    // Step 2: Automatically refine the generated blog
    const refinePrompt = `
Refine and format the following blog post as a real blog article.
- The main heading should be inside <h1 style=\"text-align:center;font-weight:bold;margin-top:32px;margin-bottom:32px;\"> ... </h1>.
- Each section should have a subheading in <h2 style=\"margin-top:24px;margin-bottom:16px;\">.
- Use <p style=\"margin-bottom:16px;line-height:1.7;\"> for each paragraph.
- For any lists, use <ul style=\"margin:16px 0 16px 32px;\"><li style=\"margin-bottom:8px;\"> ... </li></ul> and do NOT use asterisks or dashes.
- Use <strong> for bold text where appropriate.
- Add proper vertical and horizontal spacing using CSS styles or appropriate HTML structure so the blog is visually appealing and readable.
- Do not include any Markdown, asterisks, or plain text section titles.
- Return only valid HTML.
- Do not include the word 'Conclusion' as a heading; instead, use a proper closing paragraph.
- Do NOT wrap the output in any code block or Markdown. Return only the raw HTML.
- Do not include any explanations, only the HTML blog content.
Content:
${data.generated}
    `;
    const refineRes = await fetch("/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: refinePrompt }),
    });
    const refineData = await refineRes.json();
    // Remove code block markers if present
    let html = refineData.generated.trim();
    if (html.startsWith("```html")) {
      html = html
        .replace(/^```html/, "")
        .replace(/```$/, "")
        .trim();
    } else if (html.startsWith("```")) {
      html = html.replace(/^```/, "").replace(/```$/, "").trim();
    }
    setContent(html);
    if (contentRef.current) {
      contentRef.current.innerHTML = html;
    }
    setLoading(false);
  };

  const refineBlog = async () => {
    setLoading(true);
    const refinePrompt = `
    Write an SEO-optimized blog post on the following content:
    
    **HTML Structure & SEO Requirements:**
    - Start with a bold, centered main heading using an HTML <h1> tag that includes the primary keyword
    - Add a meta description suggestion in an HTML comment at the top (150-160 characters)
    - Write a compelling introduction paragraph (100-150 words) that includes the primary keyword within the first 100 words
    - Use descriptive subheadings with <h2> tags that incorporate relevant keywords and semantic variations
    - Include <h3> tags for sub-sections when needed for better content hierarchy
    - Use proper paragraphs (150-300 words each) with natural keyword placement
    - For any lists, use HTML <ul><li> or <ol><li> tags with descriptive list items
    - Add internal linking opportunities using <a href="#"> placeholders where relevant
    - Include image placeholders with SEO-friendly alt text: <img src="placeholder.jpg" alt="descriptive alt text">
    - End with a strong conclusion that includes a call-to-action
    
    **SEO Content Guidelines:**
    - Target keyword density: 1-2% (natural placement, avoid keyword stuffing)
    - Include LSI (Latent Semantic Indexing) keywords and related terms
    - Write in a conversational, engaging tone that provides real value
    - Aim for 1500-2500 words total for better search ranking potential
    - Use transition words and phrases for better readability
    - Include relevant statistics, facts, or data points when applicable
    - Structure content to answer common user questions about the topic
    - Add schema markup suggestions in HTML comments where relevant
    
    **Technical SEO Elements:**
    - Ensure proper heading hierarchy (H1 > H2 > H3)
    - Include focus keyphrases in subheadings naturally
    - Optimize for featured snippets by answering questions directly
    - Add table of contents structure using anchor links if content is long
    - Include social sharing meta tags suggestions in comments
    
    Return only clean, semantic HTML with SEO comments and suggestions. No Markdown, no asterisks.
    
    Content: \${content}
    `;
    const res = await fetch("/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: refinePrompt }),
    });
    const data = await res.json();
    setContent(data.generated);
    if (contentRef.current) {
      contentRef.current.innerHTML = data.generated;
    }
    setLoading(false);
  };

  if (!isAdmin) return null;

  return (
    <main
      role="main"
      aria-label="Create Blog Page"
      className="min-h-screen bg-gray-50 py-12"
    >
      {/* Prompt Input at the Top */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter blog topic or prompt"
          rows={2}
          className="border-2 border-[#991b1b] focus:border-[#991b1b] focus:ring-2 focus:ring-[#991b1b] rounded-xl p-4 w-full mb-4 text-lg shadow-sm transition-all duration-200 placeholder-gray-400 font-semibold resize-y"
          style={{ boxShadow: "0 2px 8px rgba(153,27,27,0.08)" }}
        />
        <button
          onClick={generateBlog}
          disabled={loading}
          className={`px-5 py-2 text-base font-bold  shadow-md transition-all duration-200 rounded-xl
            ${loading ? "bg-[#991b1b]/70 cursor-not-allowed" : "bg-[#991b1b] hover:bg-[#b91c1c] cursor-pointer"}
            text-white mt-2 mb-2`}
          style={{ letterSpacing: "0.03em", minWidth: "140px" }}
        >
          {loading ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-4">
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className="w-16 h-16 flex items-center justify-center rounded-full shadow-lg bg-white border-2 border-gray-200 hover:bg-gray-100 transition-colors text-gray-700 font-bold"
        >
          <span className="text-sm">{isPreviewMode ? "Edit" : "Preview"}</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition-all text-white font-bold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          }`}
        >
          <span className="text-sm">{loading ? "..." : "Publish"}</span>
        </button>
      </div>

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {isPreviewMode ? (
            // Preview Mode
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="p-8">{renderPreview()}</div>
            </div>
          ) : (
            // Edit Mode
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                  <div className="p-8 space-y-8">
                    {/* Title Input */}
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Blog Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-0 py-4 text-3xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-400"
                        placeholder="Enter your compelling title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    {/* Rich Text Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-xl border">
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => formatText("bold")}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                          title="Bold"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 3v14h6.5c2.5 0 4.5-2 4.5-4.5 0-1.5-.8-2.8-2-3.5 1.2-.7 2-2 2-3.5C14 3 12 3 9.5 3H3zm3 2h3c1 0 2 0 2 1.5S10 8 9 8H6V5zm0 5h3.5c1.5 0 2.5 1 2.5 2.5S11 15 9.5 15H6v-5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("italic")}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                          title="Italic"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M8 3v2h2.5l-2 12H6v2h8v-2h-2.5l2-12H16V3H8z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("underline")}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                          title="Underline"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 17h12v2H4v-2zm6-16C7.8 1 6 2.8 6 5v6c0 2.2 1.8 4 4 4s4-1.8 4-4V5c0-2.2-1.8-4-4-4zm2 10c0 1.1-.9 2-2 2s-2-.9-2-2V5c0-1.1.9-2 2-2s2 .9 2 2v6z" />
                          </svg>
                        </button>
                      </div>

                      <div className="w-px h-6 bg-gray-300"></div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => formatText("insertUnorderedList")}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                          title="Bullet List"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 4a1 1 0 100 2 1 1 0 000-2zM6 4h11v2H6V4zM3 9a1 1 0 100 2 1 1 0 000-2zM6 9h11v2H6V9zM3 14a1 1 0 100 2 1 1 0 000-2zM6 14h11v2H6v-2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("insertOrderedList")}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                          title="Numbered List"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 3v2h1v1H3v1h2V6h1V5H5V4h1V3H3zM3 8v1h1v1H3v1h2v-1h1v-1H5v-1h1V8H3zM2 12v4h4v-1H3v-1h2v-1H3v-1h3v-1H2zM8 4h9v2H8V4zM8 9h9v2H8V9zM8 14h9v2H8v-2z" />
                          </svg>
                        </button>
                      </div>

                      <div className="w-px h-6 bg-gray-300"></div>

                      <select
                        onChange={(e) =>
                          formatText("formatBlock", e.target.value)
                        }
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="div">Normal</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="blockquote">Quote</option>
                      </select>
                    </div>

                    {/* Content Editor */}
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Content
                      </label>
                      <div
                        ref={contentRef}
                        contentEditable
                        onInput={handleContentChange}
                        className="min-h-[400px] p-6 bg-white border-2 border-[#991b1b] rounded-xl focus:border-[#991b1b] focus:ring-2 focus:ring-[#991b1b] transition-all duration-200 prose prose-lg max-w-none w-full text-base text-gray-800 shadow-sm content-placeholder"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          lineHeight: "1.7",
                        }}
                        suppressContentEditableWarning={true}
                        data-placeholder="Write your blog content here..."
                      />
                      <div className="mt-3 flex justify-between text-sm text-gray-500">
                        <span>
                          {wordCount} words • {Math.ceil(wordCount / 200)} min
                          read
                        </span>
                        <span>{content.length} characters</span>
                      </div>
                      <button
                        type="button"
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
                        onClick={refineBlog}
                        disabled={loading || !content}
                      >
                        {loading ? "Refining..." : "Refine Blog"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Featured Image
                  </h3>

                  <div className="space-y-4">
                    <input
                      type="url"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder-gray-400"
                      placeholder="Image URL"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                    />

                    <div className="text-center text-gray-500 text-sm">or</div>

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        className="hidden"
                        onChange={handleImageFileChange}
                        disabled={imageUploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                          imageUploading
                            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        {imageUploading ? (
                          <div className="flex items-center space-x-2">
                            <svg
                              className="animate-spin w-5 h-5 text-gray-500"
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
                            <span className="text-sm text-gray-500">
                              Uploading...
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg
                              className="w-8 h-8 text-gray-400 mx-auto mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span className="text-sm text-gray-600">
                              Upload Image
                            </span>
                          </div>
                        )}
                      </label>
                    </div>

                    {imagePreview && (
                      <div className="relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={400}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg"
                          priority
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl("");
                            setImagePreview("");
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Author Info */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Author
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{author}</div>
                      <div className="text-sm text-gray-500">Admin</div>
                    </div>
                  </div>
                </div>

                {/* Writing Tips */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    ✨ Writing Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>
                        Use <strong>bold text</strong> for emphasis
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Break up content with headings</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Add bullet points for lists</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Aim for 200+ words for better SEO</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0"
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
                <span className="text-red-700 text-sm font-medium">
                  {error}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CreateBlogPage;
