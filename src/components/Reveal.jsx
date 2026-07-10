import { motion, useReducedMotion } from 'framer-motion'

export default function Reveal({ children, delay = 0, className }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: reduce ? 0.01 : 0.34, delay: reduce ? 0 : delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
