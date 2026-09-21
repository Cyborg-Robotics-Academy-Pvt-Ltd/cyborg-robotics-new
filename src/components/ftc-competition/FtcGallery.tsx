import ThreeDImagePageflip, {
  PageFlipLeaf,
} from "@/components/lightswind/3d-image-pageflip";

const pages: PageFlipLeaf[] = [
  {
    frontImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    backImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    frontTitle: "Villa Solarium",
    frontSubtitle: "Horizon Pool & Architecture",
    frontBadge: "Cover",
    backTitle: "Minimal Horizon",
    backSubtitle: "Geometric Water Pavilion",
    backBadge: "Plate 01",
  },
  {
    frontImage:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    backImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    frontTitle: "Apex Structure",
    frontSubtitle: "Parametric Glass Facade",
    frontBadge: "Plate 02",
    backTitle: "Glass Skyline",
    backSubtitle: "Monolith Tower",
    backBadge: "Plate 03",
  },
];

export default function FtcGallery() {
  return (
    <section id="gallery" className="w-full bg-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-red-500 mb-3">
            FTC COMPETITION
          </p>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            The <span className="text-red-500">FTC Journey</span>
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-gray-400 text-base md:text-lg">
            From building and programming robots to teamwork, strategy, and the
            final match — experience every stage of the FTC competition journey.
          </p>
        </div>

        {/* Gallery */}
        <div className="w-full min-h-[500px] flex items-center justify-center">
          <ThreeDImagePageflip
            pages={pages}
            pageWidth={330}
            pageHeight={400}
            perspective={1300}
            duration={0.65}
            peekAngle={14}
            spineShift={true}
            showPageNumbers={true}
          />
        </div>
      </div>
    </section>
  );
}
