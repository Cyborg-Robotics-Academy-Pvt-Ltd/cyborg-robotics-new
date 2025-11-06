import Link from "next/link";
import { posts } from "../../../data/posts";

export default function BlogList() {
  return (
    <div>
      <h1>Blog Posts</h1>
      <ul className="mt-32">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/courses/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
