import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import FlowField from '../components/FlowField'
import LogoMark from '../components/LogoMark'
import PageTransition from '../components/PageTransition'
import ProjectCluster from '../components/ProjectCluster'

export default function Home() {
  const reduce = useReducedMotion()
  const heroRunwayRef = useRef(null)
  const clusterRef = useRef(null)

  // Scroll-scrubbed values, driven by an explicit handler: the identity
  // block fades and drifts up while the hero is pinned, and the cluster
  // scales/settles as it rises into view. Reversible with the scroll.
  const identityOpacity = useMotionValue(1)
  const identityY = useMotionValue(0)
  const hintOpacity = useMotionValue(1)
  const clusterScale = useMotionValue(reduce ? 1 : 0.8)
  const clusterOpacity = useMotionValue(reduce ? 1 : 0)
  const clusterY = useMotionValue(reduce ? 0 : 56)

  useEffect(() => {
    if (reduce) return undefined
    const clamp01 = (v) => Math.max(0, Math.min(1, v))

    const onScroll = () => {
      const runway = heroRunwayRef.current
      const cluster = clusterRef.current
      if (!runway || !cluster) return

      const heroP = clamp01(window.scrollY / Math.max(1, runway.offsetHeight))
      const fade = clamp01(heroP / 0.45)
      identityOpacity.set(1 - fade)
      identityY.set(-48 * fade)
      hintOpacity.set(1 - clamp01(heroP / 0.12))

      const r = cluster.getBoundingClientRect()
      const start = window.innerHeight // cluster top touches viewport bottom
      const end = window.innerHeight * 0.6 - r.height / 2 // centre at 60% height
      const p = clamp01((start - r.top) / Math.max(1, start - end))
      clusterOpacity.set(clamp01(p / 0.55))
      clusterScale.set(0.8 + 0.2 * p)
      clusterY.set(56 * (1 - p))
    }

    // Poll on rAF rather than listening for scroll events: MotionValue.set
    // no-ops on unchanged values, and polling keeps the scrub working even
    // in embedded browsers that swallow window scroll events.
    let raf = 0
    const loop = () => {
      onScroll()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduce, identityOpacity, identityY, hintOpacity, clusterOpacity, clusterScale, clusterY])

  return (
    <PageTransition>
      <main className="relative">
        <div ref={heroRunwayRef} className="relative h-[150svh]">
          <section className="sticky top-0 h-svh overflow-hidden">
            <div className="absolute inset-0">
              <FlowField />
            </div>

            {/* Soft ground-colored falloff behind the identity block keeps it
                legible over the moving field without blur effects. */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_40%_at_center,var(--veil),transparent_74%)]" />

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
                <LogoMark className="h-10 w-10 text-ink" />
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
              className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-6 pb-5 font-mono text-[11px] tracking-[0.15em] text-muted"
            >
              <span className="hidden lg:inline">FIELD — VORTEX DRIFT / CYLINDER AT CURSOR</span>
              <span className="absolute left-1/2 -translate-x-1/2">SCROLL ↓</span>
              <span className="ml-auto hidden lg:inline">41.9028°N 12.4964°E</span>
            </motion.div>
          </section>
        </div>

        <section
          ref={clusterRef}
          className="relative z-10 mx-auto -mt-[38svh] flex min-h-svh max-w-5xl flex-col items-center justify-center px-6 pb-32"
        >
          <motion.div
            style={reduce ? undefined : { scale: clusterScale, opacity: clusterOpacity, y: clusterY }}
            className="flex w-full flex-col items-center"
          >
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
              01 — Selected work
            </p>
            <div className="mt-12 w-full">
              <ProjectCluster />
            </div>
          </motion.div>
        </section>
      </main>
    </PageTransition>
  )
}
