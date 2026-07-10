import { motion, useReducedMotion } from 'framer-motion'
import FlowField from '../components/FlowField'
import LogoMark from '../components/LogoMark'
import PageTransition from '../components/PageTransition'

export default function Home() {
  const reduce = useReducedMotion()

  return (
    <PageTransition>
      <main className="relative h-svh overflow-hidden">
        <div className="absolute inset-0">
          <FlowField />
        </div>

        {/* Soft ground-colored falloff behind the identity block keeps it
            legible over the moving field without blur effects. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_40%_at_center,var(--veil),transparent_74%)]" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
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
              Building Engineer <span className="text-accent">&amp;</span> Computational Designer
            </p>
          </motion.div>
        </div>

        {/* Drawing-style annotation: documents the system generating the field. */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-6 pb-5 font-mono text-[11px] tracking-[0.15em] text-muted">
          <span>FIELD — POTENTIAL FLOW / U∞ + CYLINDER AT CURSOR</span>
          <span className="hidden sm:inline">41.9028°N 12.4964°E</span>
        </div>
      </main>
    </PageTransition>
  )
}
