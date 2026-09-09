import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'

/* Same heading treatment as the About page's plain sections — a label, not
   a control, since nothing here collapses. */
function SectionHeading({ children }) {
  return (
    <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted">{children}</h2>
  )
}

export default function Credits() {
  return (
    <PageTransition>
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <Reveal>
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Credits &amp; Rights
          </h1>
        </Reveal>

        <section className="mt-10">
          <Reveal>
            <SectionHeading>Authorship</SectionHeading>
            <div className="max-w-2xl space-y-5 leading-relaxed text-ink/85">
              <p>
                The personal, academic and research work presented on this site is my own,
                though most of it was done collaboratively — every project page credits its
                team and, where applicable, the supervising faculty by name.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="mt-10">
          <Reveal>
            <SectionHeading>Professional Work</SectionHeading>
            <div className="max-w-2xl space-y-5 leading-relaxed text-ink/85">
              <p>
                Projects developed during my employment at Lombardini22 belong to
                Lombardini22 and its clients. They are shown here as documentation of my
                own role and contribution within a larger team effort, not as a claim of
                sole or primary authorship over the project.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="mt-10">
          <Reveal>
            <SectionHeading>Third-Party Images</SectionHeading>
            <div className="max-w-2xl space-y-5 leading-relaxed text-ink/85">
              <p>
                Some images illustrating professional work are taken from Lombardini22's
                own website and remain the property of Lombardini22. They are used here
                for non-commercial, portfolio purposes to document work I contributed to,
                not as original photography of mine.
              </p>
            </div>
          </Reveal>
        </section>
      </main>
    </PageTransition>
  )
}
