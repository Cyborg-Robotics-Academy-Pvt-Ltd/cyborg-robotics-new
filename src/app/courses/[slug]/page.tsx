// import { Suspense } from "react";
// import loadDynamic from "next/dynamic";
// import { getCurriculumByCourseId, slugToCourseId } from "@/lib/courseData";

// // ✅ Force Node.js runtime (for any fs/path usage in courseData)
// export const runtime = "nodejs";

// // ✅ Force dynamic rendering (no static generation — works for any slug)
// export const dynamic = "force-dynamic";

// // ✅ Disable ISR / caching (always fresh)
// export const revalidate = 0;

// // ✅ Dynamically import client-only CourseTemplate component
// const CourseTemplateComponent = loadDynamic(
//   () => import("@/components/CourseTemplate"),
//   {
//     ssr: false,
//     loading: () => null,
//   }
// );

// // ✅ Main dynamic course page (Server Component)
// export default function CoursePage({ params }: { params: { slug: string } }) {
//   const slug = params.slug?.toLowerCase();
//   const courseId = slug ? slugToCourseId[slug] : undefined;
//   const curriculum = courseId ? getCurriculumByCourseId(courseId) : undefined;

//   // 🧩 Invalid slug → course not found
//   if (!courseId) {
//     return (
//       <div className="w-full h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-xl font-semibold">Course Not Found</p>
//           <p className="text-gray-500 mt-2">
//             The requested course does not exist.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // 🕒 Data still loading (safeguard)
//   if (!curriculum) {
//     return (
//       <div className="w-full h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // ✅ Render CourseTemplateComponent with fetched curriculum
//   return (
//     <Suspense
//       fallback={
//         <div className="w-full h-screen flex items-center justify-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       }
//     >
//       <CourseTemplateComponent
//         courseId={courseId}
//         curriculumData={curriculum}
//       />
//     </Suspense>
//   );
// }
import { posts } from "../../../../data/posts";

// Generate static params for all posts
export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Type for page props
interface PageProps {
  params: Promise<{ slug: string }>;
}

// The page component
export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article className="mt-32">
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
