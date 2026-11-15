import { useState } from "react";
import { ALL_PARTS } from "./EyeAvatar.jsx";
import { ACTIVE_SYNDROME } from "../syndromes/index.js";
import { partLabels, STATUS_TEXT } from "./parts.js";
import { Icon } from "./Icon.jsx";

function Chip({ id, status = "normal", selected, onSelect }) {
  const { plain, medical } = partLabels(id);
  return (
    <button
      type="button"
      className={`chip st-${status}`}
      aria-pressed={selected}
      onClick={() => onSelect(id)}
      title={medical ?? plain}
    >
      <span className={`dot dot-${status}`} aria-hidden="true" />
      {plain}
      <span className="visually-hidden">
        {medical ? ` (${medical})` : ""}, {STATUS_TEXT[status]}
      </span>
    </button>
  );
}

/** Chips for the key parts of the current view, plus an expandable list of all parts. */
export function PartChips({ view, statusById = {}, selectedId, onSelect }) {
  const [showAll, setShowAll] = useState(false);
  const keyIds = ACTIVE_SYNDROME.keyParts[view] ?? [];

  const viewParts = ALL_PARTS.filter((p) => p.view === view && !keyIds.includes(p.id));
  const groups = [];
  for (const p of viewParts) {
    let g = groups.find((x) => x.name === p.group);
    if (!g) groups.push((g = { name: p.group, ids: [] }));
    g.ids.push(p.id);
  }

  return (
    <div className="chips-section">
      <div className="chips" role="group" aria-label={`Key ${ACTIVE_SYNDROME.name} parts`}>
        {keyIds.map((id) => (
          <Chip key={id} id={id} status={statusById[id]} selected={id === selectedId} onSelect={onSelect} />
        ))}
      </div>
      <div>
        <button
          type="button"
          className="btn btn-ghost"
          aria-expanded={showAll}
          aria-controls="all-parts"
          onClick={() => setShowAll((s) => !s)}
        >
          <Icon name={showAll ? "minus" : "plus"} size={18} />
          {showAll ? "Hide other parts" : "Show all parts"}
        </button>
      </div>
      {showAll && (
        <div className="all-parts" id="all-parts">
          {groups.map((g) => (
            <div key={g.name}>
              <h4>{g.name}</h4>
              <div className="chips">
                {g.ids.map((id) => (
                  <Chip key={id} id={id} status={statusById[id]} selected={id === selectedId} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
