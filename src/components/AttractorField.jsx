import { useEffect, useRef } from 'react'

// Lorenz system parameters (the classic chaotic regime).
const SIGMA = 10
const RHO = 28
const BETA = 8 / 3
const DT = 0.0045
const COUNT = 650
const ACCENT_EVERY = 80 // sparse accent particles punctuating the field

function step(p, dt) {
  const dx = SIGMA * (p.y - p.x)
  const dy = p.x * (RHO - p.z) - p.y
  const dz = p.x * p.y - BETA * p.z
  p.x += dx * dt
  p.y += dy * dt
  p.z += dz * dt
}

export default function AttractorField({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let w, h, cx, cy, scale
    let raf = 0
    let theta = 0

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = w / 2
      cy = h / 2
      scale = Math.min(w, h) / 56
      ctx.fillStyle = '#1b1b19'
      ctx.fillRect(0, 0, w, h)
    }
    resize()

    // Seed particles near the attractor, then let them settle onto it.
    const pts = []
    for (let i = 0; i < COUNT; i++) {
      pts.push({
        x: 1 + (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        z: 25 + (Math.random() - 0.5) * 10,
      })
    }
    for (let s = 0; s < 300; s++) for (const p of pts) step(p, DT)

    const project = (p, cos, sin) => {
      const xr = p.x * cos - p.y * sin
      return [cx + xr * scale * 1.15, cy - (p.z - RHO + 2) * scale * 0.95]
    }

    const drawParticles = (mouse) => {
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)
      // Cursor mapped back into the rotated (xr, z) projection plane.
      const mxr = mouse ? (mouse.x - cx) / (scale * 1.15) : 0
      const mz = mouse ? -(mouse.y - cy) / (scale * 0.95) + RHO - 2 : 0

      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        const [x0, y0] = project(p, cos, sin)
        step(p, DT)

        let fall = 0
        if (mouse && mouse.active) {
          // Bias the flow toward the cursor: a gentle pull in the projection
          // plane, gaussian falloff so the field bends rather than snaps.
          const dxs = mouse.x - x0
          const dys = mouse.y - y0
          fall = Math.exp(-(dxs * dxs + dys * dys) / (170 * 170))
          const g = 0.03 * fall
          const dxr = (mxr - (p.x * cos - p.y * sin)) * g
          p.x += dxr * cos
          p.y += -dxr * sin
          p.z += (mz - p.z) * g
        }

        const [x1, y1] = project(p, cos, sin)
        const seg = Math.abs(x1 - x0) + Math.abs(y1 - y0)
        if (seg > 40) continue // skip discontinuities (resize, re-entry)

        // Trails brighten slightly near the cursor so the response reads
        // as attention, not distortion.
        ctx.strokeStyle =
          i % ACCENT_EVERY === 0
            ? `rgba(253,175,13,${0.5 + 0.3 * fall})`
            : `rgba(237,235,230,${0.28 + 0.3 * fall})`
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.stroke()
      }
    }

    if (reduced) {
      // Static variant: accumulate the trajectory once, no animation loop,
      // no cursor coupling. Dimmed so centered text stays legible.
      ctx.globalAlpha = 0.28
      for (let s = 0; s < 140; s++) drawParticles(null)
      ctx.globalAlpha = 1
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }

    const mouse = { x: cx, y: cy, tx: cx, ty: cy, active: false }
    const onMove = (e) => {
      mouse.tx = e.clientX
      mouse.ty = e.clientY
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }

    const frame = () => {
      // Translucent ground fill each frame — this is what produces the trails.
      ctx.fillStyle = 'rgba(27,27,25,0.08)'
      ctx.fillRect(0, 0, w, h)

      // Ease toward the cursor so the response is quiet, not snappy.
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      theta += 0.0007

      drawParticles(mouse)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
}
