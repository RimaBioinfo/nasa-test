import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { SharedNote } from "./ui.jsx";
import { StepVisual } from "./StepVisual.jsx";

const CHOICES = ["No", "Not sure", "Yes"];

/**
 * Guided test: one instruction per screen with a progress indicator.
 * A step ending in "?" asks for an answer; a step marked "(optional)" takes a note.
 * A final step starting with "Done" is shown after saving.
 */
export function GuidedFlow({ testId, title, steps, onSave, onExit, doneActions }) {
  const last = steps[steps.length - 1] ?? "";
  const hasDone = /^done\b/i.test(last);
  const instructions = hasDone ? steps.slice(0, -1) : steps;
  const doneText = hasDone ? last : "Done. Your result is saved.";

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [i, saved]);

  const text = instructions[i];
  const isQuestion = text?.trim().endsWith("?");
  const isNote = /\(optional\)/i.test(text ?? "");
  const answered = !isQuestion || answers[i] != null;
  const isLast = i === instructions.length - 1;

  const next = async () => {
    if (!isLast) return setI(i + 1);
    setSaving(true);
    const result = Object.fromEntries(
      Object.entries(answers).map(([k, v]) => [instructions[k], v]).filter(([, v]) => v !== ""),
    );
    await onSave(result);
    setSaving(false);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="guided">
        <section className="panel guided-done" aria-labelledby="done-title">
          <Icon name="check" size={56} className="big" />
          <h1 id="done-title" ref={headingRef} tabIndex={-1}>
            {title} complete
          </h1>
          <p className="guided-instruction" style={{ fontSize: 20 }}>
            {doneText}
          </p>
          <SharedNote />
          <div className="btn-row" style={{ justifyContent: "center" }}>
            {doneActions}
          </div>
        </section>
      </div>
    );
  }

  const pct = Math.round(((i + 1) / instructions.length) * 100);

  return (
    <div className="guided">
      <div className="panel-head" style={{ marginBottom: 0 }}>
        <h1 style={{ fontSize: 26 }}>{title}</h1>
        <button type="button" className="btn btn-ghost" onClick={onExit}>
          <Icon name="close" size={18} /> Stop test
        </button>
      </div>

      <div className="guided-progress">
        <div className="guided-progress-label">
          <span>
            Step {i + 1} of {instructions.length}
          </span>
          <span>{pct}%</span>
        </div>
        <div
          className="guided-track"
          role="progressbar"
          aria-label="Test progress"
          aria-valuemin={1}
          aria-valuemax={instructions.length}
          aria-valuenow={i + 1}
          aria-valuetext={`Step ${i + 1} of ${instructions.length}`}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <section className="panel guided-step" aria-live="polite">
        <h2 className="guided-instruction" ref={headingRef} tabIndex={-1}>
          {text}
        </h2>
        <div className="guided-visual">
          <StepVisual testId={testId} text={text} />
        </div>
        {isQuestion && (
          <div className="choice-row guided-choices" role="group" aria-label="Your answer">
            {CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                className="choice"
                aria-pressed={answers[i] === c}
                onClick={() => setAnswers((a) => ({ ...a, [i]: c }))}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {isNote && (
          <>
            <label htmlFor="step-note" className="visually-hidden">
              Your note
            </label>
            <textarea
              id="step-note"
              className="guided-note"
              value={answers[i] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
              placeholder="Type here, or leave empty"
            />
          </>
        )}
      </section>

      <div className="guided-nav">
        <button type="button" className="btn btn-ghost" onClick={() => setI(i - 1)} disabled={i === 0}>
          <Icon name="arrowLeft" size={20} /> Back
        </button>
        <button type="button" className="btn btn-primary" onClick={next} disabled={!answered || saving}>
          {saving ? "Saving…" : isLast ? "Finish and save" : "Next"}
          {!isLast && <Icon name="arrowRight" size={20} />}
        </button>
      </div>
      {isQuestion && !answered && (
        <p className="muted small" style={{ textAlign: "right", marginTop: 8 }}>
          Choose an answer to continue.
        </p>
      )}
    </div>
  );
}
