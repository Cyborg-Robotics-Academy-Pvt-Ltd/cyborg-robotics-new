"use client";

import { useRef, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  competitionsData,
  competitionCategories,
  competitionLevelColors,
  difficultyColors,
} from "../../../utils/competitionsData";
import { ExternalLink } from "lucide-react";

export default function CompetitionsSection() {
  const competitionsRef = useRef(null);
  const competitionsInView = useInView(competitionsRef, {
    once: true,
    margin: "-50px",
  });
  const [activeCategory, setActiveCategory] = useState("All Competitions");

  const filteredCompetitions = useMemo(() => {
    if (activeCategory === "All Competitions") {
      return competitionsData;
    }
    return competitionsData.filter(
      (competition) => competition.category === activeCategory
    );
  }, [activeCategory]);

  return (
    <motion.section
      ref={competitionsRef}
      initial={{ opacity: 0, y: 50 }}
      animate={competitionsInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-7xl mx-auto mb-20"
    >
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={competitionsInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          Global Robotics Competitions
        </h2>
        <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
          Participate in world-renowned robotics competitions like IRO, WRO, and
          WSRO. Challenge yourself, showcase your skills, and compete on the
          global stage.
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={competitionsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        {competitionCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === category
                ? "bg-purple-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102"
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Competitions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={competitionsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCompetitions.map((competition, index) => {
          const IconComponent = competition.icon;
          return (
            <motion.div
              key={competition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={competitionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <Image
                    src={competition.imageUrl}
                    alt={competition.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <IconComponent className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">
                      {competition.title}
                    </h3>
                    <div className="flex gap-2">
                      <Badge
                        className={`text-xs ${competitionLevelColors[competition.level]} border`}
                      >
                        {competition.level.charAt(0).toUpperCase() +
                          competition.level.slice(1)}
                      </Badge>
                      <Badge
                        className={`text-xs ${difficultyColors[competition.difficulty]} border`}
                      >
                        {competition.difficulty.charAt(0).toUpperCase() +
                          competition.difficulty.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {competition.description}
                  </p>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Eligibility:
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {competition.eligibility}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Key Skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {competition.skills
                        .slice(0, 3)
                        .map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="outline"
                            className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      {competition.skills.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-gray-200"
                        >
                          +{competition.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-600">
                      {competition.category}
                    </span>
                    {competition.website && (
                      <a
                        href={competition.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredCompetitions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">
            No competitions found in this category.
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}
