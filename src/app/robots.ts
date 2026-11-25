import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin-dashboard/",
        "/student-dashboard/",
        "/trainer-dashboard/",
        "/sales-dashboard/",
        "/marketing-dashboard/",
        "/student-list/",
        "/user-profile/",
        "/payment/",
        "/create-user/",
        "/verify-email/",
        "/verify-otp/",
      ],
    },
    host: "https://www.cyborgrobotics.in",
  };
}
