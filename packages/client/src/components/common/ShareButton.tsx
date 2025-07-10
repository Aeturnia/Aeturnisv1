import { useShare } from '../../utils/shareTarget'

interface ShareButtonProps {
  type: 'achievement' | 'character' | 'item' | 'location' | 'custom'
  data: any
  customShareData?: {
    title?: string
    text?: string
    url?: string
  }
  className?: string
  children?: React.ReactNode
}

export function ShareButton({ 
  type, 
  data, 
  customShareData,
  className = '',
  children
}: ShareButtonProps) {
  const { isSupported, isSharing, share, shareGame } = useShare()

  if (!isSupported) return null

  const handleShare = async () => {
    if (type === 'custom' && customShareData) {
      await share(customShareData)
    } else {
      await shareGame(type as any, data)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600
        text-white rounded-lg transition-colors
        ${className}
      `}
      aria-label="Share"
    >
      {isSharing ? (
        <>
          <span className="animate-spin">⚡</span>
          <span>Sharing...</span>
        </>
      ) : (
        <>
          <span>📤</span>
          {children || <span>Share</span>}
        </>
      )}
    </button>
  )
}

// Compact share icon button
export function ShareIconButton({ 
  type, 
  data,
  className = ''
}: Omit<ShareButtonProps, 'children'>) {
  const { isSupported, isSharing, shareGame } = useShare()

  if (!isSupported) return null

  const handleShare = async () => {
    await shareGame(type as any, data)
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        p-2 rounded-full transition-colors
        hover:bg-dark-700 disabled:opacity-50
        ${className}
      `}
      aria-label="Share"
    >
      {isSharing ? (
        <span className="animate-spin text-lg">⚡</span>
      ) : (
        <span className="text-lg">📤</span>
      )}
    </button>
  )
}

// Share handler component for incoming shares
import { useEffect } from 'react'

export function ShareHandler() {
  const { incomingShare, clearIncomingShare } = useShare()

  useEffect(() => {
    if (!incomingShare) return

    // Handle the incoming share data
    console.log('Received share:', incomingShare)

    // Example: Parse and handle different types of shares
    if (incomingShare.url?.includes('/character/')) {
      // Navigate to character page
      const characterId = incomingShare.url.split('/character/')[1]
      console.log('View character:', characterId)
    } else if (incomingShare.url?.includes('/items/')) {
      // Navigate to item page
      const itemId = incomingShare.url.split('/items/')[1]
      console.log('View item:', itemId)
    } else if (incomingShare.text) {
      // Handle text share (maybe create a message?)
      console.log('Shared text:', incomingShare.text)
    }

    // Clear the share data
    clearIncomingShare()
  }, [incomingShare, clearIncomingShare])

  return null
}