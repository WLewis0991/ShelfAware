import Image from "next/image";
import Link from "next/link";

const steps = [
  { number: 1, title: "Upload a PDF", description: "Add a book file" },
  { number: 2, title: "AI Processing", description: "We analyse the content" },
  { number: 3, title: "Voice Chat", description: "Discuss with AI" },
];

const page = () => {
  return (
    <div className="w-full pt-20 flex justify-center px-5">
      <div className="w-full max-w-6xl rounded-2xl bg-[var(--bg-secondary)] shadow-soft-md p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <h1 className="page-title-xl">Your Library</h1>
          <p className="subtitle">
            Transforms any books or PDFs into an interactive conversation with
            AI, using either text or voice.
          </p>
          <Link href="/books/new" className="btn-primary inline-block">
            Add New Book
          </Link>
        </div>

        <div className="flex-shrink-0">
          <Image
            src="/assets/hero-illustration.png"
            alt="Hero illustration"
            width={320}
            height={320}
            className="object-contain"
          />
        </div>

        <div className="steps w-full lg:w-72 bg-white rounded-xl shadow-soft p-6 space-y-5">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center text-sm font-bold font-serif">
                {step.number}
              </span>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {step.title}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
