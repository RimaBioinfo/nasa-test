import { useEffect, useRef } from "react";
import { Icon } from "./Icon.jsx";

/** Bottom sheet built on <dialog>: focus trap, Esc to close, backdrop tap to close. */
export function Sheet({ open, onClose, title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="sheet-body">
        <div className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}
