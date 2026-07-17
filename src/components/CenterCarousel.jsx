import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

// Horizontal centre-stage carousel: items drift slowly on their own, the
// one nearest the viewport centre grows well past its neighbours, and the
// strip responds to wheel and drag. Clicking a side item brings it to the
// centre; only the centred item's link actually navigates. Items render
// three times and scroll wraps in both directions for a seamless loop.
const SPEED = 26 // auto-drift, px/s
const RESUME_AFTER = 2500 // ms of quiet before auto-drift resumes
const CENTER_MS = 650 // click-to-centre tween duration

const easeOutCubic = (t) => 1 - (1 - t) ** 3

export default function CenterCarousel({
  items,
  itemClassName = '',
  maxScale = 1.7,
  minScale = 0.62,
  falloff = 0.2, // gaussian width as a fraction of the track width
}) {
  const trackRef = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    let raf = 0
    let last = performance.now()
    let pausedUntil = 0
    let hovering = false
    let dragging = false
    let captured = false
    let pointerId = null
    let dragStartX = 0
    let dragStartScroll = 0
    let dragMoved = 0
    let tween = null // { from, to, start }

    const third = () => track.scrollWidth / 3

    // Wrap works both directions and compensates any in-flight drag or
    // tween, so the loop never hits a hard edge.
    const wrap = () => {
      const t = third()
      if (t <= 0) return
      let delta = 0
      if (track.scrollLeft >= t * 2) delta = -t
      else if (track.scrollLeft < t * 0.5) delta = t
      if (delta) {
        track.scrollLeft += delta
        dragStartScroll += delta
        if (tween) {
          tween.from += delta
          tween.to += delta
        }
      }
    }

    track.scrollLeft = third()

    // Captions start hidden in the markup; without the animation loop
    // (reduced motion) they should all simply be visible.
    if (reduce) {
      for (const el of track.children) {
        const caption = el.querySelector('[data-caption]')
        if (caption) caption.style.opacity = '1'
      }
    }

    const centerOffset = (el) => {
      const rect = track.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      return r.left + r.width / 2 - (rect.left + rect.width / 2)
    }

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (tween) {
        const t01 = Math.min(1, (now - tween.start) / CENTER_MS)
        track.scrollLeft = tween.from + (tween.to - tween.from) * easeOutCubic(t01)
        if (t01 >= 1) {
          tween = null
          pausedUntil = now + RESUME_AFTER
        }
      } else if (!reduce && !hovering && !dragging && now > pausedUntil) {
        track.scrollLeft += SPEED * dt
      }
      wrap()

      if (!reduce) {
        const rect = track.getBoundingClientRect()
        const fall = rect.width * falloff
        for (const el of track.children) {
          const d = centerOffset(el) / fall
          const g = Math.exp(-d * d)
          el.style.transform = `scale(${minScale + (maxScale - minScale) * g})`
          el.style.opacity = 0.4 + 0.6 * g
          el.style.zIndex = String(Math.round(g * 10))
          // Caption appears only on the centred item (neighbours sit at
          // g ≈ 0.17, safely below the ramp).
          const caption = el.querySelector('[data-caption]')
          if (caption) {
            caption.style.opacity = String(Math.max(0, Math.min(1, (g - 0.6) / 0.25)))
          }
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const interacted = () => {
      tween = null
      pausedUntil = performance.now() + RESUME_AFTER
    }
    const onWheel = (e) => {
      e.preventDefault()
      track.scrollLeft += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      interacted()
      wrap()
    }
    const onPointerDown = (e) => {
      dragging = true
      captured = false
      pointerId = e.pointerId
      dragMoved = 0
      dragStartX = e.clientX
      dragStartScroll = track.scrollLeft
      tween = null
      // Deliberately no pointer capture yet: capturing on pointerdown
      // retargets the eventual click to the track, so links inside the
      // strip would never receive plain clicks. Capture starts only once
      // an actual drag is underway.
    }
    const onPointerMove = (e) => {
      if (!dragging) return
      const dx = e.clientX - dragStartX
      dragMoved = Math.max(dragMoved, Math.abs(dx))
      if (!captured && dragMoved > 6) {
        try {
          track.setPointerCapture(pointerId)
        } catch {
          // stale/synthetic pointer id — drag still works without capture
        }
        captured = true
      }
      if (captured) {
        track.scrollLeft = dragStartScroll - dx
        wrap()
      }
    }
    const onPointerUp = () => {
      dragging = false
      captured = false
      interacted()
    }
    // Drags never navigate; side items centre themselves instead of
    // navigating; only the centred item's link opens.
    const onClickCapture = (e) => {
      if (dragMoved > 6) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      const item = e.target.closest('[data-carousel-item]')
      if (!item || reduce) return
      const offset = centerOffset(item)
      const pitch = item.offsetWidth * 0.6
      if (Math.abs(offset) > pitch) {
        e.preventDefault()
        e.stopPropagation()
        tween = { from: track.scrollLeft, to: track.scrollLeft + offset, start: performance.now() }
        pausedUntil = performance.now() + CENTER_MS + RESUME_AFTER
      }
    }
    const onEnter = () => {
      hovering = true
    }
    const onLeave = () => {
      hovering = false
      dragging = false
    }

    track.addEventListener('wheel', onWheel, { passive: false })
    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove)
    track.addEventListener('pointerup', onPointerUp)
    track.addEventListener('pointercancel', onPointerUp)
    track.addEventListener('click', onClickCapture, true)
    track.addEventListener('pointerenter', onEnter)
    track.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      track.removeEventListener('wheel', onWheel)
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', onPointerUp)
      track.removeEventListener('pointercancel', onPointerUp)
      track.removeEventListener('click', onClickCapture, true)
      track.removeEventListener('pointerenter', onEnter)
      track.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce, items.length, maxScale, minScale, falloff])

  return (
    <div
      ref={trackRef}
      className="flex cursor-grab select-none items-center gap-6 overflow-x-auto py-20 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {[0, 1, 2].map((copy) =>
        items.map((item) => (
          <div
            key={`${copy}-${item.key}`}
            data-carousel-item
            className={`shrink-0 ${itemClassName}`}
          >
            {item.node}
          </div>
        )),
      )}
    </div>
  )
}
