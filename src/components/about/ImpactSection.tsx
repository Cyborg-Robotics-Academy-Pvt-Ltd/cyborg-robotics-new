"use client";
export default function ImpactSection() {
  return (
    <section className="max-w-6xl mx-auto mb-20">
      <div className="bg-white rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Impact
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">5000+</div>
              <div className="text-red-100 text-sm md:text-base">
                Students Trained
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">6+</div>
              <div className="text-red-100 text-sm md:text-base">
                Years Experience
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-red-100 text-sm md:text-base">
                Projects Completed
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
              <div className="text-red-100 text-sm md:text-base">
                Dedication
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
