This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Project Structure

```text
cyborg-robotics-new/
  ├─ middleware.ts
  ├─ next.config.js
  ├─ package.json
  ├─ tailwind.config.ts
  ├─ tsconfig.json
  ├─ eslint.config.mjs
  ├─ README.md
  ├─ public/
  │  ├─ favicon.ico
  │  ├─ next.svg, vercel.svg, globe.svg, window.svg
  │  ├─ assets/
  │  │  ├─ carousel.jpg, carousel2.jpg, carousel3.jpeg
  │  │  ├─ certificate.png, latest.png, Template.jpg, Education.png, ...
  │  │  ├─ logo.png, logo1.png, mylogo.png
  │  │  ├─ gallery/            # 40+ images + 1 video
  │  │  ├─ online-course/      # aigif.webp, python.webp, webdesigning.webp, ...
  │  │  ├─ classroom-course/   # arduino.webp, ev3.webp, iot.webp, ...
  │  │  └─ pdf/                # course PDFs (JAVA.pdf, PYTHON.pdf, ...)
  └─ src/
     ├─ app/
     │  ├─ layout.tsx
     │  ├─ globals.css
     │  ├─ page.tsx
     │  ├─ not-found.tsx
     │  ├─ api/
     │  │  ├─ blogs/route.ts
     │  │  ├─ generate-blog/route.ts
     │  │  ├─ send-email/route.ts
     │  │  └─ upload/route.ts
     │  ├─ about/page.tsx
     │  ├─ contact-us/page.tsx
     │  ├─ blogs/
     │  │  ├─ page.tsx
     │  │  ├─ create/page.tsx
     │  │  └─ [id]/page.tsx
     │  ├─ admin-dashboard/
     │  │  ├─ page.tsx
     │  │  ├─ layout.tsx
     │  │  ├─ create-task/page.tsx
     │  │  └─ new-registration/page.tsx
     │  ├─ student-dashboard/
     │  │  ├─ page.tsx
     │  │  └─ [additional dashboard pages]
     │  ├─ registration/
     │  │  ├─ page.tsx
     │  │  └─ layout.tsx
     │  ├─ gallery/
     │  │  ├─ page.tsx
     │  │  └─ media/page.tsx
     │  └─ classroom-courses/, online-courses/, events/, terms-conditions/, privacy-policy/
     ├─ components/
     │  ├─ Navbar.tsx, Footer.tsx, HomePage.tsx, HeroSection.tsx
     │  ├─ CourseCard.tsx, CourseTemplate.tsx
     │  ├─ GallerySection.tsx, GalleryImage.tsx, GalleryVideos.tsx
     │  ├─ Features.tsx, Feature2.tsx, VisionSection.tsx, WhatWeOffer.tsx
     │  ├─ WhatsAppWidget.tsx, ScrollButton.tsx, LoadingSpinner.tsx, AuthLoadingSpinner.tsx
     │  ├─ login-form.tsx, CreateTasks.tsx, EmailComposition.ts
     │  ├─ ui/                 # 25+ shared UI components
     │  ├─ layout/             # layout components and providers
     │  └─ courses/            # 15+ course-specific components
     ├─ hooks/
     │  ├─ use-outside-click.ts
     │  └─ useScrollDirection.ts
     ├─ lib/
     │  ├─ auth-context.tsx
     │  ├─ firebase.ts
     │  ├─ courseData.ts
     │  └─ utils.ts
     └─ utils/
        ├─ courses.ts
        ├─ curriculum.ts
        ├─ Images.ts
        └─ MenuItemsData.ts
```
