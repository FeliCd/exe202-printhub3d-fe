import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  label: string;
  children: ReactNode;
  drawer?: boolean;
}

/** Native modal semantics, focus containment and restoration; portals escape page transforms. */
export default function Modal({ open, onClose, label, children, drawer = false }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    dialog.showModal();
    return () => dialog.close();
  }, [open]);

  return createPortal(
    <dialog
      ref={ref}
      aria-label={label}
      className={`app-dialog ${drawer ? 'app-dialog-drawer' : ''}`}
      onCancel={(event) => { event.preventDefault(); onClose?.(); }}
    >
      {open && children}
    </dialog>,
    document.body,
  );
}
