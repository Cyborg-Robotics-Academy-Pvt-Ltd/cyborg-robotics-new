"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Person = {
  id: string;
  name: string;
  designation: string;
  bio: string;
  linkedin?: string;
  image_url?: string;
  category?: "core" | "mentor" | "advisor";
};

const sectionTitle = (title: string, subtitle?: string) => (
  <div className="mx-auto max-w-4xl text-center">
    <h2 className="text-3xl font-bold text-[#8C2D2D] sm:text-4xl">{title}</h2>
    {subtitle ? (
      <p className="mt-2 text-sm sm:text-base text-gray-600">{subtitle}</p>
    ) : null}
  </div>
);

const AboutPage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "core" | "mentor" | "advisor" | "all"
  >("mentor");

  React.useEffect(() => {
    const mentorsRef = collection(db, "mentors");
    const q = query(mentorsRef, orderBy("name"));
    const unsub = onSnapshot(q, (snap) => {
      const docs: Person[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Person, "id">),
      }));
      setPeople(docs);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return people;
    return people.filter((p) => (p.category ?? "mentor") === activeFilter);
  }, [people, activeFilter]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#8C2D2D] text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/assets/Template.jpg"
            alt="About hero"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold sm:text-5xl"
          >
            Who We Are
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-3 max-w-2xl text-white/90"
          >
            Empowering young innovators with robotics, coding, and real-world
            problem solving.
          </motion.p>
          <div className="mt-6 flex gap-3">
            <Link href="#story">
              <Button className="bg-white text-[#8C2D2D] hover:bg-white/90">
                Explore Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {sectionTitle("Mission & Vision")}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-[#8C2D2D]">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              To inspire creativity and build future-ready skills through
              hands-on STEM learning and mentorship.
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-[#8C2D2D]">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              A world where every student can design, build, and launch
              meaningful technology.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Brand Story */}
      <section id="story" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          {sectionTitle(
            "Our Story",
            "From a small lab to a growing community of makers."
          )}
          <div className="mt-6 grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3 text-sm leading-6 text-gray-700">
              <p>
                Since day one, we have focused on empowering students with
                project-based learning across robotics, coding, and electronics.
                Our mentors guide learners through competitions, prototypes, and
                real-world challenges. Along the journey, we built partnerships,
                refined our curriculum, and celebrated countless student wins.
                Today, our programs combine creativity, engineering, and
                entrepreneurship to help every learner discover confidence and
                purpose in technology.
              </p>
              <div className="mt-4 rounded-md border-l-4 border-[#8C2D2D] bg-[#8C2D2D]/5 p-4 text-gray-800">
                “Learning happens best when building with heart, purpose, and
                curiosity.”
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#8C2D2D]">2019</Badge>
                    <p className="text-sm text-gray-700">
                      Founded with a mission to teach robotics through play.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#8C2D2D]">2021</Badge>
                    <p className="text-sm text-gray-700">
                      Expanded curriculum to coding, IoT, and product design.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#8C2D2D]">2024</Badge>
                    <p className="text-sm text-gray-700">
                      Students reached global stages with award-winning
                      projects.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="bg-[#8C2D2D]/5">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          {sectionTitle("Achievements")}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              { n: "500+", t: "Students Trained" },
              { n: "120+", t: "Projects Shipped" },
              { n: "30+", t: "Competition Wins" },
              { n: "25+", t: "Industry Partners" },
            ].map((a) => (
              <Card key={a.t} className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl text-[#8C2D2D]">
                    {a.n}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">
                  {a.t}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founders (static placeholder; can be Firestore-backed similarly) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {sectionTitle("Meet the Founders")}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[
            {
              name: "Founder One",
              role: "CEO",
              img: "/assets/gallery/gallery (61).jpg",
            },
            {
              name: "Founder Two",
              role: "COO",
              img: "/assets/gallery/gallery (62).jpg",
            },
          ].map((f) => (
            <Card key={f.name} className="hover-lift">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    src={f.img}
                    alt={f.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-[#8C2D2D]">{f.name}</div>
                  <div className="text-sm text-gray-600">{f.role}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    Builder, educator, and lifelong tinkerer.
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mentors & Team */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          {sectionTitle("Mentors & Team", "Browse by category")}
          <div className="mt-4 flex flex-wrap gap-2">
            {(["mentor", "core", "advisor", "all"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setActiveFilter(k)}
                className={`rounded-full border px-4 py-1 text-sm ${activeFilter === k ? "bg-[#8C2D2D] text-white border-[#8C2D2D]" : "border-gray-300 text-gray-700"}`}
              >
                {k === "core"
                  ? "Core Team"
                  : k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((p) => (
              <Card key={p.id} className="group hover-lift">
                <CardContent className="p-4">
                  <div className="relative h-44 w-full overflow-hidden rounded-md">
                    <Image
                      src={p.image_url || "/assets/gallery/gallery (60).jpg"}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-[#8C2D2D]">
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {p.designation}
                      </div>
                    </div>
                    {p.linkedin ? (
                      <Link
                        href={p.linkedin}
                        target="_blank"
                        className="text-xs text-[#8C2D2D] underline"
                      >
                        LinkedIn
                      </Link>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                    {p.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-sm text-gray-600">
                No profiles found.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#8C2D2D]/5">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          {sectionTitle("Our Values & Culture")}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[
              "Innovation",
              "Integrity",
              "Collaboration",
              "Student-first",
              "Excellence",
              "Ownership",
            ].map((v) => (
              <Card key={v} className="hover-lift">
                <CardHeader>
                  <CardTitle className="text-[#8C2D2D]">{v}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">
                  We practice {v.toLowerCase()} every day—in classrooms, labs,
                  and communities.
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 text-center">
          {sectionTitle("Be part of our journey.")}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/contact-us">
              <Button className="bg-[#8C2D2D] text-white hover:bg-[#7a2727]">
                Contact Us
              </Button>
            </Link>
            <Link href="/careers">
              <Button
                variant="outline"
                className="border-[#8C2D2D] text-[#8C2D2D] hover:bg-[#8C2D2D]/10"
              >
                Explore Careers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
export const dynamic = "force-dynamic";
