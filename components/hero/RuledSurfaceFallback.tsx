export default function RuledSurfaceFallback() {
  return (
    <svg
      viewBox="0 0 400 280"
      className="h-full w-full"
      role="img"
      aria-label="Ruled surface diagram"
    >
      <rect width="400" height="280" fill="#FCFBF7" />
      <path
        d="M40 200 C120 80, 200 220, 280 100 S 360 180, 360 120"
        fill="none"
        stroke="#1B1D1F"
        strokeWidth="1"
      />
      <path
        d="M40 230 C120 140, 200 250, 280 150 S 360 210, 360 160"
        fill="none"
        stroke="#1B1D1F"
        strokeWidth="1"
      />
      {Array.from({ length: 20 }, (_, i) => {
        const t = i / 19
        const x1 = 40 + t * 320
        const y1 = 200 - Math.sin(t * Math.PI) * 80
        const y2 = 230 - Math.sin(t * Math.PI) * 60
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x1 + (t - 0.5) * 20}
            y2={y2}
            stroke="#2547C8"
            strokeWidth="1"
            opacity="0.55"
          />
        )
      })}
      <circle cx="120" cy="120" r="5" fill="#2547C8" />
      <circle cx="280" cy="130" r="5" fill="#2547C8" />
    </svg>
  )
}
