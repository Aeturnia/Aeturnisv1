import { useRef, ReactNode, CSSProperties } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualListProps<T> {
  items: T[]
  height: number | string
  itemHeight?: number
  estimateSize?: (index: number) => number
  overscan?: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  getItemKey?: (item: T, index: number) => string | number
  onEndReached?: () => void
  endReachedThreshold?: number
}

export function VirtualList<T>({
  items,
  height,
  itemHeight = 50,
  estimateSize,
  overscan = 3,
  renderItem,
  className = '',
  getItemKey,
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize || (() => itemHeight),
    overscan,
    // Handle end reached callback
    onChange: (instance) => {
      if (!onEndReached) return
      
      const { scrollOffset, scrollOffsetMax } = instance
      const scrollProgress = scrollOffset / scrollOffsetMax
      
      if (scrollProgress > endReachedThreshold) {
        onEndReached()
      }
    }
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  const containerStyle: CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: 'auto',
    position: 'relative',
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  }

  const contentStyle: CSSProperties = {
    height: `${totalSize}px`,
    width: '100%',
    position: 'relative',
  }

  return (
    <div
      ref={parentRef}
      className={`virtual-list-container ${className}`}
      style={containerStyle}
    >
      <div style={contentStyle}>
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index]
          const key = getItemKey ? getItemKey(item, virtualRow.index) : virtualRow.index

          return (
            <div
              key={key}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Example usage component for inventory items
interface InventoryItem {
  id: string
  name: string
  quantity: number
  icon: string
}

export function VirtualInventoryList({ items }: { items: InventoryItem[] }) {
  return (
    <VirtualList
      items={items}
      height="100%"
      itemHeight={80}
      className="bg-dark-900"
      getItemKey={(item) => item.id}
      renderItem={(item) => (
        <div className="flex items-center p-4 border-b border-dark-700 hover:bg-dark-800 transition-colors">
          <div className="text-2xl mr-4">{item.icon}</div>
          <div className="flex-1">
            <h3 className="text-white font-medium">{item.name}</h3>
            <p className="text-dark-400 text-sm">Quantity: {item.quantity}</p>
          </div>
        </div>
      )}
      onEndReached={() => {
        console.log('End of list reached - load more items')
      }}
    />
  )
}