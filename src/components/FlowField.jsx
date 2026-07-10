import { useEffect, useRef } from 'react'

// A slow potential-flow field. Uniform wind crosses the viewport left to
// right; a cylinder obstacle — the classic analytic solution for flow
// around a body — is carried by the cursor. Until the pointer moves (and
// whenever it leaves), the obstacle parks at the centre so the flow
// parts around the identity block. Three weak wandering vortices keep
// the field breathing when everything else is still.
const WIND = 30 // free-stream velocity, px/s
const RADIUS = 110 // obstacle radius, px
const COUNT = 1100
const ACCENT_EVERY = 90
const MAX_SPEED = 80
const TRAIL = 56 // trail samples per particle, taken at SAMPLE_HZ
const SAMPLE_HZ = 30 // fixed sampling rate → trail length is refresh-rate independent
const VORTICES = [
  { fx: 0.11, fy: 0.17, phase: 0.0, str: 9000 },
  { fx: 0.15, fy: 0.09, phase: 2.1, str: -11000 },
  { fx: 0.07, fy: 0.13, phase: 4.4, str: 8000 },
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
    let colors

    const readColors = () => {
      const s = getComputedStyle(document.documentElement)
      const [ir, ig, ib] = hexToRgb(s.getPropertyValue('--ink'))
      const [ar, ag, ab] = hexToRgb(s.getPropertyValue('--accent'))
      colors = {
        inkHead: `rgba(${ir},${ig},${ib},0.42)`,
        inkTail: `rgba(${ir},${ig},${ib},0.14)`,
        inkStatic: `rgba(${ir},${ig},${ib},0.3)`,
        accentHead: `rgba(${ar},${ag},${ab},0.65)`,
        accentTail: `rgba(${ar},${ag},${ab},0.22)`,
      }
    }
    readColors()

    // The canvas stays transparent — the page ground shows through. Trails
    // are faded with destination-out so they erase fully; fading by painting
    // ground color over dark strokes leaves permanent 8-bit residue.
    const clear = () => {
      ctx.clearRect(0, 0, w, h)
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      clear()
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
        const r2 = dx * dx + dy * dy + 140 * 140
        vx += (-v.str * dy) / r2
        vy += (v.str * dx) / r2
      }

      // Doublet: exact potential flow around a cylinder at the obstacle.
      const dx = x - mx
      const dy = y - my
      const d2 = dx * dx + dy * dy
      const r2c = Math.max(d2, R2 * 0.3)
      const r4 = r2c * r2c
      vx += (-WIND * R2 * (dx * dx - dy * dy)) / r4
      vy += (-WIND * R2 * (2 * dx * dy)) / r4

      // Gentle radial exhale keeps particles from pooling inside the body.
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
      // Static variant: a streamline diagram around the parked obstacle.
      const drawStatic = () => {
        clear()
        ctx.lineWidth = 1
        ctx.strokeStyle = colors.inkStatic
        const rows = 42
        for (let i = 0; i <= rows; i++) {
          let x = -12
          let y = ((i + 0.5) * h) / (rows + 1)
          ctx.beginPath()
          ctx.moveTo(x, y)
          for (let s = 0; s < 800; s++) {
            velocity(x, y, 0, w / 2, h / 2)
            const sp = Math.hypot(vel.x, vel.y) || 1
            x += (vel.x / sp) * 3
            y += (vel.y / sp) * 3
            ctx.lineTo(x, y)
            if (x > w + 12 || y < -12 || y > h + 12) break
          }
          ctx.stroke()
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
      p.max = 6 + Math.random() * 10
      if (Math.random() < 0.3) {
        p.x = -12
        p.y = Math.random() * h
      } else {
        p.x = Math.random() * w
        p.y = Math.random() * h
      }
      p.hist = [p.x, p.y]
    }
    const count = Math.min(COUNT, Math.max(300, Math.round((w * h) / 1200)))
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
    let sinceSample = 0

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt
      sinceSample += dt
      const sample = sinceSample >= 1 / SAMPLE_HZ
      if (sample) sinceSample = 0

      // Full clear + explicit trail polylines: alpha-fade compositing either
      // burns in (fading toward a color) or stalls at a residue floor
      // (destination-out rounding), so trails are drawn, not accumulated.
      ctx.clearRect(0, 0, w, h)

      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05

      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        p.age += dt
        if (p.age > p.max || p.x > w + 16 || p.x < -16 || p.y > h + 16 || p.y < -16) {
          reseed(p)
        }
        velocity(p.x, p.y, t, mouse.x, mouse.y)
        p.x += vel.x * dt
        p.y += vel.y * dt

        if (sample) {
          p.hist.push(p.x, p.y)
          if (p.hist.length > TRAIL * 2) p.hist.splice(0, p.hist.length - TRAIL * 2)
        }

        const accent = i % ACCENT_EVERY === 0
        const n = p.hist.length
        const mid = Math.max(2, (n >> 2) << 1) // older half drawn fainter

        ctx.strokeStyle = accent ? colors.accentTail : colors.inkTail
        ctx.beginPath()
        ctx.moveTo(p.hist[0], p.hist[1])
        for (let j = 2; j <= mid; j += 2) ctx.lineTo(p.hist[j], p.hist[j + 1])
        ctx.stroke()

        ctx.strokeStyle = accent ? colors.accentHead : colors.inkHead
        ctx.beginPath()
        ctx.moveTo(p.hist[mid], p.hist[mid + 1])
        for (let j = mid + 2; j < n; j += 2) ctx.lineTo(p.hist[j], p.hist[j + 1])
        ctx.lineTo(p.x, p.y) // head always reaches the live position
        ctx.stroke()
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
      clear()
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
