import { useEffect, useRef } from 'react'

// A sparse drift field: a few dozen long, tapered filaments carried by
// slowly wandering vortices over a faint ambient wind. A cylinder doublet
// travels with the cursor and bends the flow around the pointer; until
// the pointer moves (and whenever it leaves) it parks at the centre,
// sheltering the identity block.
const WIND = 6 // faint ambient drift, px/s
const OBSTACLE = 46 // cursor doublet strength (independent of the weak wind)
const RADIUS = 110 // obstacle radius, px
const DENSITY = 20000 // px² of viewport per filament — keeps the field sparse
const MAX_COUNT = 110
const ACCENT_EVERY = 11
const MAX_SPEED = 55
const TRAIL = 100 // history points per filament
const SAMPLE_DIST = 2 // px travelled between history points → tails are a
// fixed length in pixels, independent of frame rate or tab throttling
const TAPER_STEPS = 16
const VORTICES = [
  { fx: 0.11, fy: 0.17, phase: 0.0, str: 20000 },
  { fx: 0.15, fy: 0.09, phase: 2.1, str: -24000 },
  { fx: 0.07, fy: 0.13, phase: 4.4, str: 17000 },
]

const hexToRgb = (hex) => {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export default function FlowField({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let w, h
    let inkSteps = []
    let accentSteps = []
    let inkStatic = ''

    const readColors = () => {
      const s = getComputedStyle(document.documentElement)
      const [ir, ig, ib] = hexToRgb(s.getPropertyValue('--ink'))
      const [ar, ag, ab] = hexToRgb(s.getPropertyValue('--accent'))
      inkSteps = []
      accentSteps = []
      for (let k = 1; k <= TAPER_STEPS; k++) {
        const a = Math.pow(k / TAPER_STEPS, 1.6)
        inkSteps.push(`rgba(${ir},${ig},${ib},${(0.5 * a).toFixed(3)})`)
        accentSteps.push(`rgba(${ar},${ag},${ab},${(0.68 * a).toFixed(3)})`)
      }
      inkStatic = `rgba(${ir},${ig},${ib},0.3)`
    }
    readColors()

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.clearRect(0, 0, w, h)
    }
    resize()

    const R2 = RADIUS * RADIUS
    const vel = { x: 0, y: 0 }

    const velocity = (x, y, t, mx, my) => {
      let vx = WIND
      let vy = 0

      for (const v of VORTICES) {
        const cx = w * (0.5 + 0.38 * Math.sin(v.fx * t + v.phase))
        const cy = h * (0.5 + 0.38 * Math.sin(v.fy * t + v.phase * 1.7))
        const dx = x - cx
        const dy = y - cy
        const r2 = dx * dx + dy * dy + 170 * 170
        vx += (-v.str * dy) / r2
        vy += (v.str * dx) / r2
      }

      // Cylinder doublet carried by the cursor: bends the flow around it.
      const dx = x - mx
      const dy = y - my
      const d2 = dx * dx + dy * dy
      const r2c = Math.max(d2, R2 * 0.3)
      const r4 = r2c * r2c
      vx += (-OBSTACLE * R2 * (dx * dx - dy * dy)) / r4
      vy += (-OBSTACLE * R2 * (2 * dx * dy)) / r4

      // Gentle radial exhale keeps filaments from pooling inside the body.
      if (d2 < R2) {
        const r = Math.sqrt(d2) || 1
        const k = 30 * (1 - d2 / R2)
        vx += (dx / r) * k
        vy += (dy / r) * k
      }

      const sp = Math.hypot(vx, vy)
      if (sp > MAX_SPEED) {
        vx = (vx / sp) * MAX_SPEED
        vy = (vy / sp) * MAX_SPEED
      }
      vel.x = vx
      vel.y = vy
    }

    if (reduced) {
      // Static variant: a field of short streamlines around the parked
      // obstacle, seeded on a loose grid.
      const drawStatic = () => {
        ctx.clearRect(0, 0, w, h)
        ctx.lineWidth = 1
        ctx.strokeStyle = inkStatic
        const step = 130
        for (let gy = step / 2; gy < h; gy += step) {
          for (let gx = step / 2; gx < w; gx += step) {
            let x = gx + (((gx * 7 + gy * 13) % 47) - 23)
            let y = gy + (((gx * 11 + gy * 5) % 43) - 21)
            ctx.beginPath()
            ctx.moveTo(x, y)
            for (let s = 0; s < 60; s++) {
              velocity(x, y, 0, w / 2, h / 2)
              const sp = Math.hypot(vel.x, vel.y) || 1
              x += (vel.x / sp) * 2.5
              y += (vel.y / sp) * 2.5
              ctx.lineTo(x, y)
              if (x < -12 || x > w + 12 || y < -12 || y > h + 12) break
            }
            ctx.stroke()
          }
        }
      }
      drawStatic()

      const onResize = () => {
        resize()
        drawStatic()
      }
      const observer = new MutationObserver(() => {
        readColors()
        drawStatic()
      })
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
      window.addEventListener('resize', onResize)
      return () => {
        observer.disconnect()
        window.removeEventListener('resize', onResize)
      }
    }

    const pts = []
    const reseed = (p) => {
      p.age = 0
      p.max = 7 + Math.random() * 11
      p.x = Math.random() * w
      p.y = Math.random() * h
      p.hist = [p.x, p.y]
    }
    const count = Math.min(MAX_COUNT, Math.max(28, Math.round((w * h) / DENSITY)))
    for (let i = 0; i < count; i++) {
      const p = {}
      reseed(p)
      p.age = Math.random() * p.max // desynchronise lifetimes
      pts.push(p)
    }

    // Obstacle rests behind the identity block until the cursor takes over.
    const mouse = { x: w / 2, y: h / 2, tx: w / 2, ty: h / 2 }
    const onMove = (e) => {
      mouse.tx = e.clientX
      mouse.ty = e.clientY
    }
    const onLeave = () => {
      mouse.tx = w / 2
      mouse.ty = h / 2
    }

    let raf = 0
    let last = performance.now()
    let t = 0

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt

      ctx.clearRect(0, 0, w, h)

      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        p.age += dt
        if (p.age > p.max || p.x > w + 20 || p.x < -20 || p.y > h + 20 || p.y < -20) {
          reseed(p)
        }
        velocity(p.x, p.y, t, mouse.x, mouse.y)
        p.x += vel.x * dt
        p.y += vel.y * dt

        const lx = p.hist[p.hist.length - 2]
        const ly = p.hist[p.hist.length - 1]
        const ddx = p.x - lx
        const ddy = p.y - ly
        if (ddx * ddx + ddy * ddy >= SAMPLE_DIST * SAMPLE_DIST) {
          p.hist.push(p.x, p.y)
          if (p.hist.length > TRAIL * 2) p.hist.splice(0, p.hist.length - TRAIL * 2)
        }

        // Tapered filament: the tail is drawn in chunks of rising alpha
        // and width, so each line fades in from nothing to its head.
        const nPts = p.hist.length / 2
        if (nPts < 2) continue
        const accent = i % ACCENT_EVERY === 0
        const steps = accent ? accentSteps : inkSteps
        const chunks = Math.min(TAPER_STEPS, nPts - 1)
        for (let c = 0; c < chunks; c++) {
          const a = Math.floor((c * (nPts - 1)) / chunks)
          const b = Math.floor(((c + 1) * (nPts - 1)) / chunks)
          if (b <= a) continue
          const frac = (c + 1) / chunks
          const si = Math.max(0, Math.min(TAPER_STEPS - 1, Math.round(frac * TAPER_STEPS) - 1))
          ctx.strokeStyle = steps[si]
          ctx.lineWidth = 0.5 + 1.1 * frac
          ctx.beginPath()
          ctx.moveTo(p.hist[a * 2], p.hist[a * 2 + 1])
          for (let m = a + 1; m <= b; m++) ctx.lineTo(p.hist[m * 2], p.hist[m * 2 + 1])
          ctx.stroke()
        }
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const onResize = () => {
      const centered = Math.abs(mouse.tx - w / 2) < 1 && Math.abs(mouse.ty - h / 2) < 1
      resize()
      if (centered) {
        mouse.tx = w / 2
        mouse.ty = h / 2
      }
    }
    const observer = new MutationObserver(() => {
      readColors()
      ctx.clearRect(0, 0, w, h)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
}
