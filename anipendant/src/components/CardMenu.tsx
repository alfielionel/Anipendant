import { useState, useRef, useEffect, type ReactNode } from 'react'

interface MenuItem {
  label: string
  icon?: string
  danger?: boolean
  onClick: () => void
}

interface CardMenuProps {
  items: MenuItem[]
  children?: ReactNode
}

export default function CardMenu({ items, children }: CardMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="card-menu" ref={ref}>
      <button
        type="button"
        className="card-menu-trigger"
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o) }}
        aria-label="Options"
      >
        ⋮
      </button>
      {open && (
        <div className="card-menu-dropdown" onClick={e => e.stopPropagation()}>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className={`card-menu-item${item.danger ? ' card-menu-item-danger' : ''}`}
              onClick={e => { e.stopPropagation(); e.preventDefault(); setOpen(false); item.onClick() }}
            >
              {item.icon && <span className="card-menu-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
          {children}
        </div>
      )}
    </div>
  )
}
