type ArchicadLogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { width: 140, height: 44 },
  md: { width: 206, height: 64 },
  lg: { width: 260, height: 81 },
}

export default function ArchicadLogo({ className = '', size = 'md' }: ArchicadLogoProps) {
  const { width, height } = sizes[size]

  return (
    <img
      src="/media/archicad-logo.svg"
      alt="Graphisoft Archicad"
      width={width}
      height={height}
      className={`h-auto max-w-full border border-hairline ${className}`.trim()}
      loading="lazy"
    />
  )
}
