import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import NetworkField from '../components/NetworkField'
import LogoMark from '../components/LogoMark'
import PageTransition from '../components/PageTransition'
import CenterCarousel from '../components/CenterCarousel'
import { projects } from '../content/projects'

function CarouselCard({ project }) {
  return (
    <Link to={`/projects/${project.slug}`} className="group block" draggable={false}>
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-200 group-hover:border-accent/70">
        {project.cover?.svg ? (
          <div
            aria-hidden="true"
            className="h-full w-full p-4 text-ink [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: project.cover.svg }}
          />
        ) : project.cover?.url ? (
          <img
            src={project.cover.url}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div data-caption style={{ opacity: 0 }} className="mt-4 text-center">
        <p className="font-medium">{project.title}</p>
        {(project.tags ?? []).length > 0 && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {project.tags.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function Home() {
  const reduce = useReducedMotion()
  const heroRunwayRef = useRef(null)
  const carouselRef = useRef(null)

  // Scroll-scrubbed values, driven by an explicit handler: the identity
  // block fades and drifts up while the hero is pinned, and the carousel
  // settles as it rises into view. Reversible with the scroll.
  const identityOpacity = useMotionValue(1)
  const identityY = useMotionValue(0)
  const hintOpacity = useMotionValue(1)
  const carouselOpacity = useMotionValue(reduce ? 1 : 0)
  const carouselY = useMotionValue(reduce ? 0 : 56)

  useEffect(() => {
    if (reduce) return undefined
    const clamp01 = (v) => Math.max(0, Math.min(1, v))

    const onScroll = () => {
      const runway = heroRunwayRef.current
      const section = carouselRef.current
      if (!runway || !section) return

      const heroP = clamp01(window.scrollY / Math.max(1, runway.offsetHeight))
      const fade = clamp01(heroP / 0.45)
      identityOpacity.set(1 - fade)
      identityY.set(-48 * fade)
      hintOpacity.set(1 - clamp01(heroP / 0.12))

      const r = section.getBoundingClientRect()
      const start = window.innerHeight
      const end = window.innerHeight * 0.6 - r.height / 2
      const p = clamp01((start - r.top) / Math.max(1, start - end))
      carouselOpacity.set(clamp01(p / 0.55))
      carouselY.set(56 * (1 - p))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // Deep link straight to the work strip (also used by automated checks).
    if (window.location.hash === '#work') {
      carouselRef.current?.scrollIntoView({ block: 'center' })
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reduce, identityOpacity, identityY, hintOpacity, carouselOpacity, carouselY])

  return (
    <PageTransition>
      <main className="relative">
        <div ref={heroRunwayRef} className="relative h-[150svh]">
          <section className="sticky top-0 h-svh overflow-hidden">
            <div className="absolute inset-0">
              <NetworkField />
            </div>

            {/* Soft ground-colored falloff behind the identity block keeps it
                legible over the moving field without blur effects. */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_40%_at_center,var(--veil),transparent_74%)]" />

            {/* Same treatment behind the fixed nav bar, so it stays legible
                over the graph exactly like the identity block does. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--veil)] to-transparent sm:h-40" />

            <motion.div
              style={reduce ? undefined : { opacity: identityOpacity, y: identityY }}
              className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col items-center"
              >
                <LogoMark className="h-16 w-auto text-ink" />
                <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                  Andrea Cutroni
                </h1>
                <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-muted sm:text-sm">
                  Building Engineer <span className="text-accent">&amp;</span> Computational
                  Designer
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              style={reduce ? undefined : { opacity: hintOpacity }}
              className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-6 pb-5 font-mono text-[11px] tracking-[0.15em] text-muted"
            >
              <span>SCROLL ↓</span>
            </motion.div>
          </section>
        </div>

        <section
          ref={carouselRef}
          className="relative z-10 -mt-[38svh] flex min-h-svh w-full flex-col justify-center overflow-hidden pb-24"
        >
          <motion.div style={reduce ? undefined : { opacity: carouselOpacity, y: carouselY }}>
            <div className="flex justify-end px-6 sm:px-10">
              <Link
                to="/projects"
                className="border-b border-accent pb-0.5 font-mono text-sm uppercase tracking-[0.2em] text-ink transition-colors duration-200 hover:text-accent"
              >
                View all projects →
              </Link>
            </div>
            <CenterCarousel
              itemClassName="w-[44vw] sm:w-[280px] md:w-[320px]"
              trackPadding="py-24 md:py-36"
              maxScale={1.7}
              minScale={0.62}
              items={projects.map((project) => ({
                key: project.slug,
                node: <CarouselCard project={project} />,
              }))}
            />
          </motion.div>
        </section>
      </main>
    </PageTransition>
  )
}
