export default function TeamSection() {
  return (
    <section className="bg-[#0b1220] py-20 text-white">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#ff9b83]">
            People behind the robots
          </p>

          <h2 className="mt-3 text-4xl font-black">Meet the Cyborg Team.</h2>

          <p className="mt-4 text-gray-400">
            Introduce the founders, head instructor and mentors — and explain
            why Cyborg exists.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[260px_1fr]">
          <div className="grid h-[260px] place-items-center rounded-3xl bg-[#26344f] text-sm text-gray-400">
            FOUNDER PHOTO
          </div>

          <div>
            <h3 className="text-3xl font-black">Shikha Virmani</h3>

            <p className="mt-1 text-[#ff9b83]">
              Founder & Managing Director / Head Instructor
            </p>

            <p className="mt-5 leading-7 text-gray-300">
              “Our goal isn't simply to teach children how to build robots. We
              want them to become comfortable with experimenting, failing,
              thinking differently and finding solutions.”
            </p>

            <a
              href="#trial"
              className="mt-6 inline-block rounded-lg border border-gray-600 px-6 py-3 font-bold"
            >
              Meet Cyborg Through a Trial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
