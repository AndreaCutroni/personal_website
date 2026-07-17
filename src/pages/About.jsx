import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import portrait from '../assets/AndreaCutroni_11.jpg'

const experience = [
  {
    period: '2026',
    role: 'Research Assistant',
    org: 'Institute for Advanced Architecture of Catalonia (IAAC) — Remote',
    detail:
      'Developed a parametric workflow orchestrating 70+ energy simulations for design-space exploration.',
  },
  {
    period: '2024 – 2025',
    role: 'Sustainability Consultant & Computational Designer',
    org: 'Lombardini22, Milan',
    detail:
      'Parametric environmental analysis in early design stages, energy models for large-scale projects, R&D initiatives, lectures for the internal Academy and university courses, LEED certification support and site supervision.',
  },
  {
    period: '2023 – 2024',
    role: 'Research Fellow',
    org: 'University of Rome Tor Vergata',
    detail:
      'Topology optimization for sustainable architecture, applied to structural and thermal design. Structural optimization, environmental analysis, and prototyping through 3D printing, laser cutting and AR visualization.',
  },
  {
    period: '2022',
    role: 'Junior MEP Engineer',
    org: 'DFM Consulting, Rome',
    detail: 'Supported mechanical and electrical design.',
  },
]

const education = [
  {
    period: '2025 – 2026',
    role: 'Master in Advanced Computational Design for Architecture (MaCAD)',
    org: 'Institute for Advanced Architecture of Catalonia (IAAC) — Remote',
    detail:
      'Advanced computation for environmental and structural design, BIM and smart construction, artificial intelligence in architecture.',
  },
  {
    period: '2021 – 2023',
    role: 'MSc in Engineering and Building Technologies',
    org: 'University of Rome Tor Vergata',
    detail:
      '110/110 with honors — awarded best student 2021–2023. Thesis: topology optimization for architectural structures, an easy-to-use working space.',
  },
  {
    period: '2022',
    role: 'Exchange Semester',
    org: 'University of Burgos, Spain',
    detail: null,
  },
  {
    period: '2017 – 2021',
    role: 'BEng in Building Engineering',
    org: 'University of Rome Tor Vergata',
    detail: '110/110. Thesis: steel bridges in Italy — history and a project of Studio Matildi.',
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

function TimelineItem({ period, role, org, detail, isLast }) {
  return (
    <div className={`relative border-l border-line pl-8 ${isLast ? 'pb-0' : 'pb-12'}`}>
      <span className="absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-ink bg-ground" />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{period}</p>
      <h3 className="mt-2 text-lg font-medium sm:text-xl">{role}</h3>
      <p className="mt-1 text-sm text-muted">{org}</p>
      {detail && <p className="mt-3 max-w-2xl leading-relaxed text-ink/85">{detail}</p>}
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
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Building Engineer &amp; Computational Designer
          </h1>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px] lg:gap-16">
            <div className="max-w-2xl space-y-5 leading-relaxed text-ink/85">
              <p>
                I'm Andrea Cutroni, a building engineer and computational designer based in Rome.
                My work bridges architecture, complex structures and sustainable design, built on
                a foundation of computational workflows and data-driven methods.
              </p>
              <p>
                With an international background across Italy, Spain and remote research
                collaborations, my academic and professional path reflects a consistent commitment
                to research and innovation — from topology optimization and environmental
                simulation to parametric tooling for large-scale projects.
              </p>
            </div>
            <figure className="h-fit border border-line bg-surface">
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
