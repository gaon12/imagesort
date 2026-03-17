import type { Strip } from '../types'

type StripVisualizationProps = {
  strips: Strip[]
  imageSrc: string
  imageSize: { width: number; height: number } | null
  isViewportLandscape: boolean
  activeIndices: [number, number] | null
  stepDelay: number
  label?: string
}

export const StripVisualization = ({
  strips,
  imageSrc,
  imageSize,
  isViewportLandscape,
  activeIndices,
  stepDelay,
  label,
}: StripVisualizationProps) => {
  return (
    <div
      className="image-frame"
      style={
        imageSize
          ? isViewportLandscape
            ? {
                aspectRatio: imageSize.width / imageSize.height,
                height: '100%',
                maxWidth: '100%',
              }
            : {
                aspectRatio: imageSize.width / imageSize.height,
                width: '100%',
                maxHeight: '100%',
              }
          : undefined
      }
    >
      {label && <div className="visualization-label">{label}</div>}
      {strips.length === 0 && (
        <img src={imageSrc} alt="Selected" className="preview-image" />
      )}
      {strips.length > 0 && (
        <div className="strip-container">
          {strips.map((strip, index) => {
            const isActive =
              activeIndices?.[0] === index || activeIndices?.[1] === index
            return (
              <div
                key={strip.id}
                className={isActive ? 'image-strip image-strip-active' : 'image-strip'}
                style={{
                  width: `${100 / strips.length}%`,
                  backgroundImage: `url(${imageSrc})`,
                  backgroundSize: `${strips.length * 100}% 100%`,
                  backgroundPosition: `${strip.offsetPercent}% 0`,
                  transitionDuration: `${stepDelay * 0.9}ms`,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
