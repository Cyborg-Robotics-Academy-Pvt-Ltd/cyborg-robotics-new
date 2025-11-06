export interface Post {
  slug: string;
  title: string;
  content: string;
}

export const posts: Post[] = [
  {
    slug: 'hello-world',
    title: 'Hello World',
    content: 'This is my first post...'
  },
  {
    slug: 'nextjs-tips',
    title: 'Next.js Tips',
    content: 'Here are some tips...'
  }
];