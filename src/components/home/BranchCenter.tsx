import React from "react";
import { Building2, MapPin, Navigation, Crown } from "lucide-react";

const centers = [
  {
    name: "Kalyani Nagar",
    note: "HEAD OFFICE",
    isHQ: true,
    address:
      "North Court, Office No: 2A, 1st Floor,\nOpposite Joggers Park,\nAbove Punjab National Bank,\nKalyani Nagar, Pune 411006",
    mapsQuery: "North Court Office 2A Kalyani Nagar Pune",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2950.192111274928!2d73.89855296924844!3d18.549219829758282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c171b358032b%3A0x4458a6a5ef33d0c3!2sCyborg%20Robotics%20Academy%20Pvt%20Ltd!5e1!3m2!1sen!2sin!4v1778499346378!5m2!1sen!2sin",
  },
  {
    name: "Kharadi",
    note: "BRANCH",
    isHQ: false,
    address:
      "The Galaxy One, Eon Free Zone Rd,\nNext to EON IT Park & WTC, Kharadi,\nPune, Maharashtra 411014",
    mapsQuery: "The Galaxy One Kharadi EON Free Zone Pune",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11800.816892947823!2d73.9311816554199!3d18.548518799999993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c16264034c3f%3A0xa8598fade87cd741!2sEuroKids%20PreSchool%20in%20Kharadi%2C%20Pune!5e1!3m2!1sen!2sin!4v1778499089543!5m2!1sen!2sin ",
  },
  {
    name: "Magarpatta",
    note: "BRANCH",
    isHQ: false,
    address:
      "Bungalow No 7, Acacia Garden 1,\nMagarpatta, Hadapsar,\nPune, Maharashtra 411013",
    mapsQuery: "Bungalow 7 Acacia Garden 1 Magarpatta Hadapsar Pune",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2950.78540692325!2d73.92699624999999!3d18.5148503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c1262af74173%3A0x45bc7bbccec93c68!2sTovi%20International%20Preschool%20-%20Best%20Preschool%20%26%20Daycare%20in%20Magarpatta!5e1!3m2!1sen!2sin!4v1778499277429!5m2!1sen!2sin",
  },
];

const stats = [
  { num: "3", label: "Locations", color: "blue" },
  { num: "1", label: "Head Office", color: "red" },
  { num: "2", label: "Branches", color: "blue" },
];

const BranchLocations = () => {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-600 shadow-sm">
              <Building2 className="h-3.5 w-3.5" />
              OUR CENTERS
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Learn robotics at the center nearest to you in Pune.
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mb-4">
            Our head office in Kalyani Nagar and branches in Kharadi &amp;
            Magarpatta are here to help you build the future with robotics.
          </p>

          {/* Stats Pills */}
          <div className="flex flex-wrap gap-3 mb-4">
            {stats.map((stat, idx) => {
              const isRed = stat.color === "red";
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                    isRed
                      ? "border-red-200 bg-red-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <MapPin
                    className={`h-5 w-5 ${
                      isRed ? "text-red-600" : "text-blue-600"
                    }`}
                  />
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className={`text-lg font-bold ${
                        isRed ? "text-red-900" : "text-blue-900"
                      }`}
                    >
                      {stat.num}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        isRed ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {centers.map((center, idx) => (
              <a
                key={idx}
                href={`#${center.name.toLowerCase().replace(" ", "-")}`}
                className={`px-4 py-2 text-sm font-semibold transition-all ${
                  center.isHQ ? "text-red-600" : "text-blue-600"
                } hover:opacity-80`}
              >
                {center.name}
                {idx < centers.length - 1 && <span className="ml-2">•</span>}
              </a>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {centers.map((center) => (
            <div
              key={center.name}
              id={center.name.toLowerCase().replace(" ", "-")}
              className={`rounded-2xl overflow-hidden transition-all duration-150 ${
                center.isHQ
                  ? "md:col-span-2 lg:col-span-1  bg-gradient-to-br from-red-50 via-white to-red-50/30 shadow-lg hover:shadow-xl hover:border-red-500"
                  : "border border-slate-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {/* Map Container */}
              <div className="relative">
                <iframe
                  src={center.mapEmbedUrl}
                  width="100%"
                  height={center.isHQ ? "160" : "160"}
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${center.name} Location`}
                  className="w-full"
                />
                {center.isHQ && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <Crown className="h-4 w-4 fill-white" />
                    <span className="text-xs font-bold">MAIN HQ</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className={`p-4 ${center.isHQ ? "border-t-2 border-red-200" : ""}`}
              >
                {/* Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 ${
                    center.isHQ
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-blue-50 text-blue-600 border border-blue-200"
                  }`}
                >
                  {center.isHQ && <Crown className="h-3.5 w-3.5" />}
                  {center.note}
                </div>

                {/* Title */}
                <h2
                  className={`font-bold mb-2 ${
                    center.isHQ
                      ? "text-xl text-red-900"
                      : "text-lg text-slate-900"
                  }`}
                >
                  {center.name}
                </h2>

                {/* Address */}
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line mb-4 flex items-start gap-2">
                  <MapPin
                    className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                      center.isHQ ? "text-red-500" : "text-slate-400"
                    }`}
                  />
                  <span>{center.address}</span>
                </p>

                {/* Directions Button */}
                <a
                  href={
                    "https://www.google.com/maps/search/?api=1&query=" +
                    encodeURIComponent(center.mapsQuery)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all border text-sm ${
                    center.isHQ
                      ? "border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700 shadow-md hover:shadow-lg"
                      : "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-400"
                  }`}
                >
                  <Navigation className="h-4 w-4" />
                  Directions
                  <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
          <p className="text-slate-700 font-medium text-sm flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            All centers are equipped with advanced robotics labs and expert
            mentors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BranchLocations;
