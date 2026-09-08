import { useId, useState } from 'react'
import Collapsible, { Chevron } from '../components/Collapsible'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import portrait from '../assets/AndreaCutroni_11.jpg'

const experience = [
  {
    period: '2026',
    role: 'Research Assistant',
    org: 'Institute for Advanced Architecture of Catalonia (IAAC) — Remote',
    details: ['Developed parametric workflow to run 70+ energy simulations to compare different design strategies in different climates'],
  },
  {
    period: '2024 – 2025',
    role: 'Sustainability Consultant & Computational Designer',
    org: 'Lombardini22, Milan',
    details: [
      'Executed parametric environmental analysis in early design stages for data-driven design',
      'Developed energy models for large-scale projects',
      'Involved in R&D projects',
      'Led lectures for internal Academy and university',
      'Supported LEED certification process and site supervisions',
    ],
  },
  {
    period: '2023 – 2024',
    role: 'Research Fellow',
    org: 'University of Rome Tor Vergata',
    details: [
      'Topology optimization for sustainable architecture: application to structural and thermal design',
      'Executed structural optimization and environmental analysis',
      'Realized prototypes through 3D printing, laser cutting and AR visualization',
    ],
  },
  {
    period: '2022',
    role: 'Junior MEP Engineer',
    org: 'DFM Consulting, Rome',
    details: ['Supported mechanical and electrical design'],
  },
]

const education = [
  {
    period: '2025 – 2026',
    role: 'Master in Advanced Computational Design for Architecture (MACAD)',
    org: 'Institute for Advanced Architecture of Catalonia (IAAC) — Remote',
    details: [
      'Advanced computation for environmental and structural design',
      'Building information modelling and smart construction',
      'Artificial intelligence in architecture',
    ],
  },
  {
    period: '2021 – 2023',
    role: 'MSc in Engineering and Building Technologies',
    org: 'University of Rome Tor Vergata',
    details: [
      'Thesis: Topology optimization for architectural structures, an easy-to-use working space',
      'Grade: 110/110 with honors',
      'Awarded as best student 2021–2023',
    ],
  },
  {
    period: '2022',
    role: 'Exchange Semester',
    org: 'University of Burgos, Spain',
    details: [],
  },
  {
    period: '2017 – 2021',
    role: 'BEng in Building Engineering',
    org: 'University of Rome Tor Vergata',
    details: [
      'Thesis: Steel bridges in Italy — history and a project of Studio Matildi',
      'Grade: 110/110',
    ],
  },
]

const skills = [
  { label: '2D / 3D Modeling', items: 'Rhinoceros, Revit, AutoCAD, Rhino.Inside.Revit, Speckle' },
  {
    label: 'Parametric Modeling',
    items: 'Grasshopper, Ladybug, Honeybee, Karamba3D, Alpaca4D, Autodesk Forma, infrared.city',
  },
  { label: 'Programming', items: 'Python, JavaScript' },
  { label: 'Energy & Structural', items: 'IES VE, SAP2000' },
]

const languages = [
  { name: 'Italian', level: 'Native' },
  { name: 'English', level: 'Proficient' },
  { name: 'French', level: 'Proficient' },
  { name: 'Spanish', level: 'Independent' },
]

/* Details render unconditionally now — the show/hide lives one level up, on
   the section itself, rather than on every entry inside it.

   The marker and the rail line live in this static wrapper, never inside
   Reveal — every earlier attempt at the ring (bordered, filled, SVG) showed
   the same hairline gap on real GPU-accelerated Chrome, never reproducible
   under this session's software-rendered testing browser, which points to a
   compositor artifact tied to sitting under Reveal's per-item, staggered
   scroll-in transform rather than to the shape itself. Only the text below
   animates now; the line and marker are never touched by a transform. */
function TimelineItem({ period, role, org, details, isLast, delay }) {
  const hasDetails = details?.length > 0

  return (
    <div className={`relative border-l border-line pl-8 ${isLast ? 'pb-0' : 'pb-12'}`}>
      <svg viewBox="0 0 9 9" className="absolute -left-[5px] top-1.5 h-[9px] w-[9px]" aria-hidden="true">
        <circle cx="4.5" cy="4.5" r="4.5" className="fill-ink" />
        <circle cx="4.5" cy="4.5" r="2.5" className="fill-ground" />
      </svg>
      <Reveal delay={delay}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{period}</p>
        <h3 className="mt-2 text-lg font-medium sm:text-xl">{role}</h3>
        <p className="mt-1 text-base text-muted">{org}</p>
        {hasDetails && (
          <ul className="mt-3 max-w-2xl space-y-1.5">
            {details.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </div>
  )
}

/* A plain label — Technical Skills and Languages have nothing to collapse. */
function SectionHeading({ children }) {
  return (
    <h2 className="mb-8 font-mono text-xs uppercase tracking-[0.25em] text-muted">{children}</h2>
  )
}

/* Experience and Education are long enough to want folding away; the heading
   itself is the control, the same pattern as a project's own sections. */
function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(true)
  const panelId = useId()

  return (
    <>
      <Reveal>
        <h2 className="mb-8 font-mono text-xs uppercase tracking-[0.25em] text-muted">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="inline-flex cursor-pointer items-center gap-3 text-left uppercase transition-colors duration-200 hover:text-accent"
          >
            <span>{title}</span>
            <Chevron open={open} />
          </button>
        </h2>
      </Reveal>
      <Collapsible open={open} id={panelId}>
        {children}
      </Collapsible>
    </>
  )
}

export default function About() {
  return (
    <PageTransition>
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_280px] lg:gap-16">
            <div>
              <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Building Engineer &amp; Computational Designer
              </h1>
              <div className="mt-8 max-w-2xl space-y-5 leading-relaxed text-ink/85">
                <p>
                  I'm Andrea Cutroni, a building engineer and computational designer. 
                  My work bridges architecture, complex structures and sustainable design,
                  built on a foundation of computational workflows and data-driven methods.
                </p>
                <p>
                  With an international background across Italy, Spain and France, 
                  my academic and professional path reflects a consistent
                  commitment to research and innovation — from topology optimization and
                  environmental simulation to parametric tooling for large-scale projects.
                </p>
              </div>
            </div>
            <figure className="h-fit overflow-hidden rounded-lg border border-line bg-surface">
              <img
                src={portrait}
                alt="Portrait of Andrea Cutroni"
                className="aspect-[4/5] w-full object-cover object-[55%_20%] grayscale"
              />
            </figure>
          </div>
        </Reveal>

        <section className="mt-14">
          <CollapsibleSection title="Experience">
            <div>
              {experience.map((item, i) => (
                <TimelineItem
                  key={item.role}
                  {...item}
                  isLast={i === experience.length - 1}
                  delay={i * 0.04}
                />
              ))}
            </div>
          </CollapsibleSection>
        </section>

        <section className="mt-14">
          <CollapsibleSection title="Education">
            <div>
              {education.map((item, i) => (
                <TimelineItem
                  key={item.role}
                  {...item}
                  isLast={i === education.length - 1}
                  delay={i * 0.04}
                />
              ))}
            </div>
          </CollapsibleSection>
        </section>

        <section className="mt-14">
          <Reveal>
            <SectionHeading>Technical Skills</SectionHeading>
          </Reveal>
          <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {skills.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.04}>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{s.label}</p>
                <p className="mt-2 leading-relaxed text-ink/85">{s.items}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <Reveal>
            <SectionHeading>Languages</SectionHeading>
            <div className="flex flex-wrap gap-x-12 gap-y-4">
              {languages.map((l) => (
                <div key={l.name}>
                  <p className="font-medium">{l.name}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                    {l.level}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <Reveal className="mt-24 border-t border-line pt-10">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Contact</p>
          <a
            href="mailto:andrea.cutroni.eng@gmail.com"
            className="mt-3 inline-block text-lg transition-colors duration-200 hover:text-accent"
          >
            andrea.cutroni.eng@gmail.com
          </a>
        </Reveal>
      </main>
    </PageTransition>
  )
}
