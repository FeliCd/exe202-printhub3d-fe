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
    if (!dialog) return;
    if (!drawer) {
      if (!open) return;
      dialog.showModal();
      return () => dialog.close();
    }
    if (!open && !dialog.open) return;
    if (open && !dialog.open) dialog.showModal();

    const animation = dialog.animate(
      open
        ? [{ transform: 'translateX(100%)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }]
        : [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(100%)', opacity: 0 }],
      {
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
        fill: 'both',
      },
    );
    animation.onfinish = () => {
      if (!open) dialog.close();
      animation.cancel();
    };
    return () => animation.cancel();
  }, [open, drawer]);

  useEffect(() => {
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);

  return createPortal(
    <dialog
      ref={ref}
      aria-label={label}
      className={`app-dialog ${drawer ? 'app-dialog-drawer' : ''}`}
      onCancel={(event) => { event.preventDefault(); onClose?.(); }}
    >
      {(drawer || open) && children}
    </dialog>,
    document.body,
  );
}
