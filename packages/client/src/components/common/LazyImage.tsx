import { useState, useEffect, ImgHTMLAttributes } from 'react'
import { useInView } from 'react-intersection-observer'

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  placeholderSrc?: string
  webpSrc?: string
  fallbackSrc?: string
  threshold?: number
  rootMargin?: string
  blurDataURL?: string
  aspectRatio?: number
  fadeIn?: boolean
  onLoadComplete?: () => void
}

export function LazyImage({
  src,
  placeholderSrc,
  webpSrc,
  fallbackSrc,
  alt = '',
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  blurDataURL,
  aspectRatio,
  fadeIn = true,
  onLoadComplete,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc || blurDataURL || '')
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [currentQuality, setCurrentQuality] = useState<'placeholder' | 'low' | 'high'>('placeholder')

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true
  })

  // Combine refs
  const setRefs = (node: HTMLImageElement | null) => {
    ref(node)
    setImageRef(node)
  }

  useEffect(() => {
    if (!inView || isLoaded) return

    // Progressive loading strategy
    const loadImage = async () => {
      try {
        // Try WebP first if supported and available
        if (webpSrc && supportsWebP()) {
          await preloadImage(webpSrc)
          setImageSrc(webpSrc)
          setCurrentQuality('high')
          setIsLoaded(true)
          onLoadComplete?.()
          return
        }

        // Load main image
        await preloadImage(src)
        setImageSrc(src)
        setCurrentQuality('high')
        setIsLoaded(true)
        onLoadComplete?.()
      } catch (error) {
        console.error('Image failed to load:', error)
        setIsError(true)
        
        // Try fallback image if available
        if (fallbackSrc) {
          try {
            await preloadImage(fallbackSrc)
            setImageSrc(fallbackSrc)
            setIsError(false)
          } catch {
            // Fallback also failed
            setImageSrc(placeholderSrc || '')
          }
        }
      }
    }

    loadImage()
  }, [inView, src, webpSrc, fallbackSrc, placeholderSrc, isLoaded, onLoadComplete])

  // Helper to preload images
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }

  // Check WebP support
  const supportsWebP = (): boolean => {
    if (typeof window === 'undefined') return false
    
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 0
  }

  // Container styles for aspect ratio
  const containerStyle = aspectRatio
    ? {
        position: 'relative' as const,
        paddingBottom: `${(1 / aspectRatio) * 100}%`,
        overflow: 'hidden'
      }
    : {}

  const imageStyle = aspectRatio
    ? {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const
      }
    : {}

  const imageClasses = `
    ${className}
    ${fadeIn ? 'transition-opacity duration-300' : ''}
    ${isLoaded && fadeIn ? 'opacity-100' : 'opacity-0'}
    ${isError ? 'image-error' : ''}
  `

  if (aspectRatio) {
    return (
      <div style={containerStyle} className="lazy-image-container">
        <img
          ref={setRefs}
          src={imageSrc}
          alt={alt}
          className={imageClasses}
          style={imageStyle}
          loading="lazy"
          {...props}
        />
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800 text-dark-400">
            <span>Failed to load image</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <img
        ref={setRefs}
        src={imageSrc}
        alt={alt}
        className={imageClasses}
        loading="lazy"
        {...props}
      />
      {isError && (
        <div className="text-center text-dark-400 p-4">
          Failed to load image
        </div>
      )}
    </>
  )
}

// Blur data URL generator for placeholder
export function generateBlurDataURL(color = '#1e293b'): string {
  const svg = `
    <svg width="1" height="1" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="1" fill="${color}"/>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Image gallery component using lazy loading
interface ImageGalleryProps {
  images: Array<{
    id: string
    src: string
    webpSrc?: string
    alt: string
    thumbnail?: string
  }>
}

export function LazyImageGallery({ images }: ImageGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id))
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <LazyImage
            src={image.src}
            webpSrc={image.webpSrc}
            placeholderSrc={image.thumbnail}
            alt={image.alt}
            aspectRatio={1}
            className="rounded-lg"
            fadeIn
            onLoadComplete={() => handleImageLoad(image.id)}
          />
          
          {/* Loading indicator */}
          {!loadedImages.has(image.id) && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-800 rounded-lg">
              <div className="text-primary-400 text-2xl animate-pulse">⚡</div>
            </div>
          )}
          
          {/* Hover overlay for desktop */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <p className="text-white text-sm px-2 text-center">{image.alt}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Optimized avatar component
interface LazyAvatarProps {
  src: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LazyAvatar({ src, name, size = 'md', className = '' }: LazyAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  }

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <LazyImage
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        fadeIn
        fallbackSrc={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23334155"/><text x="50" y="50" font-family="sans-serif" font-size="40" fill="%23fff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`}
      />
    </div>
  )
}