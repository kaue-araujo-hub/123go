import { useRef, useEffect } from 'react'

interface DragFixedOptions {
  onDragStart?: (info: { x: number; y: number; element: HTMLElement }) => void
  onDragMove?: (info: { x: number; y: number; dx: number; dy: number }) => void
  onDragEnd?: (info: { x: number; y: number; dx: number; dy: number; finalAbsX: number; finalAbsY: number; cancelled?: boolean }) => void
  disabled?: boolean
}

export function useDragFixed({ onDragStart, onDragMove, onDragEnd, disabled = false }: DragFixedOptions) {
  const ref = useRef<HTMLElement>(null)
  const dragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    el.style.touchAction = 'none'
    el.style.userSelect = 'none'
    ;(el.style as any).webkitUserSelect = 'none'
    el.style.cursor = 'grab'

    function onPointerDown(e: PointerEvent) {
      el!.setPointerCapture(e.pointerId)
      dragging.current = true
      startPos.current = { x: e.clientX, y: e.clientY }
      el!.style.cursor = 'grabbing'
      el!.style.zIndex = '1000'
      onDragStart?.({ x: e.clientX, y: e.clientY, element: el! })
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging.current) return
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      el!.style.transform = `translate(${dx}px, ${dy}px) translateZ(0) scale(1.08)`
      onDragMove?.({ x: e.clientX, y: e.clientY, dx, dy })
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging.current) return
      dragging.current = false
      el!.style.cursor = 'grab'
      el!.style.zIndex = ''
      onDragEnd?.({
        x: e.clientX,
        y: e.clientY,
        dx: e.clientX - startPos.current.x,
        dy: e.clientY - startPos.current.y,
        finalAbsX: e.clientX,
        finalAbsY: e.clientY,
      })
    }

    function onPointerCancel(e: PointerEvent) {
      if (!dragging.current) return
      dragging.current = false
      el!.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
      el!.style.transform = 'translate(0,0) translateZ(0) scale(1)'
      setTimeout(() => { if (el) el.style.transition = '' }, 350)
      onDragEnd?.({ x: e.clientX, y: e.clientY, dx: 0, dy: 0, finalAbsX: e.clientX, finalAbsY: e.clientY, cancelled: true })
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerCancel)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [disabled])

  return ref
}

export function returnToOrigin(el: HTMLElement) {
  el.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
  el.style.transform = 'translate(0,0) translateZ(0) scale(1)'
  setTimeout(() => { el.style.transition = '' }, 350)
}

export function isInsideDropZone(absX: number, absY: number, dropZoneEl: HTMLElement | null, margin = 24): boolean {
  if (!dropZoneEl) return false
  const rect = dropZoneEl.getBoundingClientRect()
  return (
    absX >= rect.left - margin &&
    absX <= rect.right + margin &&
    absY >= rect.top - margin &&
    absY <= rect.bottom + margin
  )
}
