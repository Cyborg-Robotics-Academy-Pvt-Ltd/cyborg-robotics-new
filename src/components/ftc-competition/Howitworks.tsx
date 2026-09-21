export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Build",
      desc: "Design and fabricate your combat robot from scratch.",
    },
    {
      num: "02",
      title: "Program",
      desc: "Wire up control systems and tune your bot's response.",
    },
    {
      num: "03",
      title: "Test",
      desc: "Run trials, fix issues, and harden the build.",
    },
    {
      num: "04",
      title: "Qualify",
      desc: "Meet the spec sheet and clear inspection to enter.",
    },
    {
      num: "05",
      title: "Compete",
      desc: "Face off in the arena against rival bots.",
    },
    { num: "06", title: "Win", desc: "Take the podium and claim the title." },
  ];

  return (
    <section className="bg-[#0a0a0a] py-20 px-6">
      <h2 className="text-center text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-14">
        How It Works
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-8">
        {steps.map((step, i) => (
          <div key={step.num} className="relative text-center px-2">
            <span className="text-orange-500 font-black text-lg italic">
              {step.num}
            </span>
            <h3 className="text-white font-extrabold italic text-lg mt-1 mb-2 tracking-wide">
              {step.title}
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {step.desc}
            </p>

            {i < steps.length - 1 && (
              <span className="hidden md:block absolute top-2 -right-4 text-neutral-700">
                &gt;
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
