"use client";

import { useEffect } from "react";

const page = () => {
  useEffect(() => {
    const collections = [
      "admins",
      "counters",
      "galleryImage",
      "homeGalleryImage",
      "images",
      "invoices",
      "otps",
      "payments",
      "photo",
      "registrations",
      "renewals",
      "students",
      "trainers",
      "workshopRegistrations",
    ];

    console.log("Firestore collections:", collections);
  }, []);

  return <div></div>;
};

export default page;
