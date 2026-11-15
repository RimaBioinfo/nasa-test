import { useRef, useState } from "react";
import { messageFlightSurgeon } from "../services/api.js";
import { Icon } from "./Icon.jsx";

/**
 * "Message flight surgeon" button + compose dialog. The flight surgeon is a contact,
 * not a user of the app; messages are queued and arrive with communication delay.
 */
export function MessageSurgeonButton({ context = "", variant = "btn-ghost", label = "Message flight surgeon" }) {
  const dialogRef = useRef(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(null);
  const [sending, setSending] = useState(false);

  const open = () => {
    setText(context ? `About: ${context}\n\n` : "");
    setSent(null);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const send = async (e) => {
    e.preventDefault();
    setSending(true);
    const res = await messageFlightSurgeon(text, { context });
    setSending(false);
    setSent(res);
  };

  return (
    <>
      <button type="button" className={`btn ${variant}`} onClick={open}>
        <Icon name="message" size={20} />
        {label}
      </button>
      <dialog ref={dialogRef} className="modal" aria-labelledby="surgeon-title">
        <div className="modal-head">
          <h2 id="surgeon-title">Message flight surgeon</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        {sent ? (
          <div>
            <p className="saved-msg">
              <Icon name="check" /> Message queued for Earth.
            </p>
            <p className="muted" style={{ marginTop: 8 }}>
              It takes about {sent.oneWayDelayMin} minutes to arrive, and a reply takes as long again. In an
              emergency, keep following the protocol steps. Don&apos;t wait for an answer.
            </p>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={close}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={send}>
            <p className="muted small">Your latest results are attached automatically.</p>
            <label htmlFor="surgeon-text" className="visually-hidden">
              Message
            </label>
            <textarea id="surgeon-text" value={text} onChange={(e) => setText(e.target.value)} required />
            <div className="btn-row">
              <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                {sending ? "Sending…" : "Send message"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={close}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
