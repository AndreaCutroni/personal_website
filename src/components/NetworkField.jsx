import { useEffect, useRef } from 'react'

// Network graph field: nodes drift slowly around their anchors, near
// neighbours connect with distance-faded edges, and the cursor joins the
// graph — accent edges reach out to nearby nodes and the cursor becomes
// a node itself.
const DENSITY = 14000 // px² of viewport per node
const MAX_NODES = 130
const CONNECT = 150
const MOUSE_CONNECT = 170

const hexToRgb = (hex) => {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

export default function NetworkField({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let w, h
    let nodes = []
    let t = 0
    let raf = 0
    let last = performance.now()
    let colors

    const readColors = () => {
      const s = getComputedStyle(document.documentElement)
      colors = {
        dot: hexToRgb(s.getPropertyValue('--ink')),
        accent: hexToRgb(s.getPropertyValue('--accent-mark')),
      }
    }
    readColors()

    const initNodes = () => {
      const count = Math.min(MAX_NODES, Math.max(40, Math.round((w * h) / DENSITY)))
      nodes = []
      for (let i = 0; i < count; i++) {
        const size = Math.random()
        const r =
          size > 0.88 ? 4.2 + Math.random() * 1.8 : size > 0.6 ? 2.2 + Math.random() : 1.1 + Math.random() * 0.8
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          baseX: 0,
          baseY: 0,
          wanderA: Math.random() * Math.PI * 2,
          wanderR: 25 + Math.random() * 45,
          wanderSpeed: 0.06 + Math.random() * 0.08,
          r,
          haloR: r * (6 + Math.random() * 10),
        })
      }
      for (const n of nodes) {
        n.baseX = n.x
        n.baseY = n.y
      }
    }

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initNodes()
    }
    resize()

    const mouse = { x: -9999, y: -9999, active: false }
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }

    const updateNodes = (dt) => {
      t += dt * 0.6 // matches the reference cadence at any refresh rate
      for (const n of nodes) {
        const tx = n.baseX + Math.cos(t * n.wanderSpeed + n.wanderA) * n.wanderR
        const ty = n.baseY + Math.sin(t * n.wanderSpeed * 0.8 + n.wanderA) * n.wanderR
        n.x += (tx - n.x) * 0.02
        n.y += (ty - n.y) * 0.02
      }
    }

    const draw = (withMouse) => {
      ctx.clearRect(0, 0, w, h)

      // soft halo dots for depth
      for (const n of nodes) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.haloR)
        grad.addColorStop(0, `rgba(${colors.dot}, 0.05)`)
        grad.addColorStop(1, `rgba(${colors.dot}, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.haloR, 0, Math.PI * 2)
        ctx.fill()
      }

      // node-to-node edges, opacity falling off with distance
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < CONNECT) {
            const s = 1 - dist / CONNECT
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(${colors.dot}, ${(s * 0.35).toFixed(3)})`
            ctx.lineWidth = 0.6 + s * 0.5
            ctx.stroke()
          }
        }
      }

      // the cursor joins the graph
      if (withMouse && mouse.active) {
        for (const n of nodes) {
          const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y)
          if (dist < MOUSE_CONNECT) {
            const s = 1 - dist / MOUSE_CONNECT
            ctx.beginPath()
            ctx.moveTo(mouse.x, mouse.y)
            ctx.lineTo(n.x, n.y)
            ctx.strokeStyle = `rgba(${colors.accent}, ${(0.25 + s * 0.55).toFixed(3)})`
            ctx.lineWidth = 0.8 + s * 1.4
            ctx.stroke()
          }
        }
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 3.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${colors.accent})`
        ctx.fill()
      }

      // solid nodes on top; those near the cursor pick up the accent
      for (const n of nodes) {
        const dist = withMouse && mouse.active ? Math.hypot(n.x - mouse.x, n.y - mouse.y) : Infinity
        const nearMouse = dist < MOUSE_CONNECT
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = nearMouse
          ? `rgba(${colors.accent}, ${(0.7 + (1 - dist / MOUSE_CONNECT) * 0.3).toFixed(3)})`
          : `rgba(${colors.dot}, 0.85)`
        ctx.fill()
      }
    }

    if (reduced) {
      // Static variant: one settled frame, no cursor coupling.
      for (let i = 0; i < 60; i++) updateNodes(1 / 60)
      draw(false)

      const onResize = () => {
        resize()
        draw(false)
      }
      const observer = new MutationObserver(() => {
        readColors()
        draw(false)
      })
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
      window.addEventListener('resize', onResize)
      return () => {
        observer.disconnect()
        window.removeEventListener('resize', onResize)
      }
    }

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      updateNodes(dt)
      draw(true)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const observer = new MutationObserver(readColors)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />
}
