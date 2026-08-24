import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
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

function TimelineItem({ period, role, org, details, isLast }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(true)
  const hasDetails = details?.length > 0

  return (
    <div className={`relative border-l border-line pl-8 ${isLast ? 'pb-0' : 'pb-12'}`}>
      <span className="absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-ink bg-ground" />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{period}</p>
      <h3 className="mt-2 text-lg font-medium sm:text-xl">{role}</h3>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-base text-muted">{org}</p>
        {hasDetails && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? 'Hide' : 'Show'} details for ${role}`}
            className="shrink-0 text-muted transition-colors duration-200 hover:text-accent"
          >
            <svg
              viewBox="0 0 12 12"
              className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </button>
        )}
      </div>
      {hasDetails && (
        // Pure CSS grid-rows collapse (no framer-motion): reliably animates
        // to/from an unknown content height without measuring scrollHeight.
        <div
          style={{
            display: 'grid',
            gridTemplateRows: open ? '1fr' : '0fr',
            transition: `grid-template-rows ${reduce ? '10ms' : '250ms'} cubic-bezier(0.25,0.1,0.25,1)`,
          }}
        >
          <ul className="max-w-2xl space-y-1.5 overflow-hidden pt-3" style={{ minHeight: 0 }}>
            {details.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SectionHeading({ index, children }) {
  return (
    <h2 className="mb-10 font-mono text-xs uppercase tracking-[0.25em] text-muted">
      <span className="text-accent">{index}</span> — {children}
    </h2>
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
                  I'm Andrea Cutroni, a building engineer and computational designer based in
                  Rome. My work bridges architecture, complex structures and sustainable design,
                  built on a foundation of computational workflows and data-driven methods.
                </p>
                <p>
                  With an international background across Italy, Spain and remote research
                  collaborations, my academic and professional path reflects a consistent
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

        <section className="mt-24">
          <Reveal>
            <SectionHeading index="A">Experience</SectionHeading>
          </Reveal>
          <div>
            {experience.map((item, i) => (
              <Reveal key={item.role} delay={i * 0.04}>
                <TimelineItem {...item} isLast={i === experience.length - 1} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <Reveal>
            <SectionHeading index="B">Education</SectionHeading>
          </Reveal>
          <div>
            {education.map((item, i) => (
              <Reveal key={item.role} delay={i * 0.04}>
                <TimelineItem {...item} isLast={i === education.length - 1} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <Reveal>
            <SectionHeading index="C">Technical Skills</SectionHeading>
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

        <section className="mt-24">
          <Reveal>
            <SectionHeading index="D">Languages</SectionHeading>
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
