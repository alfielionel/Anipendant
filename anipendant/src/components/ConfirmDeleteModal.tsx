import { type ReactNode } from 'react'

interface ConfirmDeleteModalProps {
  title: string
  children?: ReactNode
  onCancel: () => void
  onConfirm: () => void
  confirming?: boolean
}

export default function ConfirmDeleteModal({
  title,
  children,
  onCancel,
  onConfirm,
  confirming,
}: ConfirmDeleteModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card confirm-modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
        <div className="confirm-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={confirming}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
