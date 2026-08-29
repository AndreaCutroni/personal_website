import { useEffect, useRef } from 'react'

/* A silent looping clip with a hairline telling you how far through the loop
   it is. Sits on the bottom edge of the video itself, inside the frame's
   rounded border and above any figcaption, so it reads as part of the frame
   rather than as player chrome.

   Driven by requestAnimationFrame rather than the video's own timeupdate
   event: timeupdate fires roughly four times a second, which on a short loop
   is visibly steppy. The frame callback writes a transform straight to the
   node, so the bar never costs a React render. */
export default function LoopVideo({ src, poster, label, aspect }) {
  const video = useRef(null)
  const bar = useRef(null)

  useEffect(() => {
    const el = video.current
    if (!el) return

    let frame = 0

    const paint = () => {
      const { duration, currentTime } = el
      if (bar.current && duration > 0) {
        bar.current.style.transform = `scaleX(${currentTime / duration})`
      }
    }

    const draw = () => {
      paint()
      frame = requestAnimationFrame(draw)
    }

    const start = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    /* Nothing to animate while the clip is paused or scrolled away — an
       offscreen hero would otherwise keep a frame callback alive for the whole
       page. The browser already stops decoding; this stops us reading. */
    const seen = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !el.paused ? start() : stop()),
      { threshold: 0 },
    )
    seen.observe(el)

    el.addEventListener('play', start)
    el.addEventListener('pause', stop)
    /* The frame callback is the smooth path, not the only one: a background
       tab throttles rAF to nothing while the clip may still advance, and a
       seek moves the position with no frame in between. Both events repaint
       once, so the bar is never left behind. */
    el.addEventListener('timeupdate', paint)
    el.addEventListener('seeked', paint)
    el.addEventListener('loadedmetadata', paint)
    if (!el.paused) start()
    paint()

    return () => {
      stop()
      seen.disconnect()
      el.removeEventListener('play', start)
      el.removeEventListener('pause', stop)
      el.removeEventListener('timeupdate', paint)
      el.removeEventListener('seeked', paint)
      el.removeEventListener('loadedmetadata', paint)
    }
  }, [])

  return (
    <div className="relative">
      <video
        ref={video}
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        aria-label={label}
        style={aspect ? { aspectRatio: aspect } : undefined}
        className={aspect ? 'block w-full object-cover' : 'block h-auto w-full'}
      />
      {/* A track under the bar, so the length of the loop is legible even at
          the start of it. Decorative: the clip is silent and looping, and
          there is nothing here to operate. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-ink/10">
        {/* Scale set inline rather than with scale-x-0/origin-left: Tailwind v4
            writes those to the `scale` and `transform-origin` properties, and
            the frame callback writes `transform` — two different properties
            fighting over the same bar. */}
        <div
          ref={bar}
          className="h-full w-full bg-accent-mark"
          style={{ transform: 'scaleX(0)', transformOrigin: 'left', willChange: 'transform' }}
        />
      </div>
    </div>
  )
}
