"use client";

import { useRef } from "react";

const CM_PER_INCH = 2.54;

/** Top-down picture of the loyang with the cut lines drawn in. */
export function CutDiagram({ grid, panInch }: { grid: number; panInch: number }) {
  const size = 220; // drawn pan size in SVG units
  const left = 34;
  const top = 30;
  const cell = size / grid;
  const pieceIn = panInch / grid;
  const unitsPerInch = size / panInch;
  const wholeInches = Math.floor(panInch + 1e-9);
  // Thin out the piece numbers on very fine grids so they stay readable
  const showNumbers = grid <= 10;
  const fontSize = Math.max(7, Math.min(16, cell * 0.36));

  return (
    <svg
      viewBox={`0 0 ${left + size + 14} ${top + size + 34}`}
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={`Loyang ${panInch} by ${panInch} inch cut into ${grid} by ${grid}, ${grid * grid} pieces`}
    >
      {/* Ruler along the top, one tick per inch */}
      <line x1={left} y1={top - 12} x2={left + size} y2={top - 12} stroke="#b8835e" strokeWidth={1} />
      {Array.from({ length: wholeInches + 1 }, (_, i) => (
        <g key={i}>
          <line
            x1={left + i * unitsPerInch}
            y1={top - 16}
            x2={left + i * unitsPerInch}
            y2={top - 8}
            stroke="#b8835e"
            strokeWidth={1}
          />
          <text x={left + i * unitsPerInch} y={top - 19} fontSize={8} textAnchor="middle" fill="#9c6440">
            {i}″
          </text>
        </g>
      ))}

      {/* Pan edge */}
      <rect x={left - 4} y={top - 4} width={size + 8} height={size + 8} rx={6} fill="#cfa98a" />

      {/* Pieces, chequered so each one is easy to see */}
      {Array.from({ length: grid * grid }, (_, i) => {
        const r = Math.floor(i / grid);
        const c = i % grid;
        return (
          <g key={i}>
            <rect
              x={left + c * cell}
              y={top + r * cell}
              width={cell}
              height={cell}
              fill={(r + c) % 2 === 0 ? "#4a2c1e" : "#643c28"}
            />
            {showNumbers && (
              <text
                x={left + c * cell + cell / 2}
                y={top + r * cell + cell / 2}
                fontSize={fontSize}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e3cdb8"
                opacity={0.75}
              >
                {i + 1}
              </text>
            )}
          </g>
        );
      })}

      {/* Cut lines */}
      {Array.from({ length: grid - 1 }, (_, i) => {
        const pos = (i + 1) * cell;
        return (
          <g key={i} stroke="#faf6f2" strokeWidth={1.5} strokeDasharray="4 3">
            <line x1={left + pos} y1={top} x2={left + pos} y2={top + size} />
            <line x1={left} y1={top + pos} x2={left + size} y2={top + pos} />
          </g>
        );
      })}

      {/* Size of one piece, marked under the first column */}
      <g stroke="#7f4e32" strokeWidth={1}>
        <line x1={left} y1={top + size + 12} x2={left + cell} y2={top + size + 12} />
        <line x1={left} y1={top + size + 8} x2={left} y2={top + size + 16} />
        <line x1={left + cell} y1={top + size + 8} x2={left + cell} y2={top + size + 16} />
      </g>
      <text x={left} y={top + size + 28} fontSize={9} fill="#643c28">
        1 piece = {pieceIn.toFixed(2)}″ ({(pieceIn * CM_PER_INCH).toFixed(1)} cm)
      </text>

      {/* Side label: pan size */}
      <text
        x={left - 16}
        y={top + size / 2}
        fontSize={9}
        fill="#9c6440"
        textAnchor="middle"
        transform={`rotate(-90 ${left - 16} ${top + size / 2})`}
      >
        {panInch}″ ({(panInch * CM_PER_INCH).toFixed(1)} cm)
      </text>
    </svg>
  );
}

/** Small ⓘ button that opens a pop-up showing how to cut the loyang. */
export function CutInfoButton({
  grid,
  panInch,
  price,
  className = "",
  light = false,
}: {
  grid: number;
  panInch: number;
  price?: number;
  className?: string;
  light?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pieces = grid * grid;
  const pieceIn = panInch / grid;
  const cuts = grid - 1;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // don't also select the table row
          ref.current?.showModal();
        }}
        aria-label={`Show how to cut ${grid} by ${grid}`}
        title="See how to cut"
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] leading-none font-bold italic ${
          light
            ? "border-cocoa-300 text-cocoa-100 hover:bg-cocoa-700"
            : "border-cocoa-300 text-cocoa-600 hover:bg-cocoa-100"
        } ${className}`}
      >
        i
      </button>

      <dialog
        ref={ref}
        onClick={(e) => {
          // Click on the dark backdrop closes it
          if (e.target === ref.current) ref.current?.close();
          e.stopPropagation();
        }}
        className="m-auto w-[min(92vw,420px)] rounded-2xl bg-white p-0 text-cocoa-900 shadow-xl backdrop:bg-black/50"
      >
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">
                {grid}×{grid} cut: {pieces} pieces
              </h3>
              <p className="text-sm text-cocoa-500">
                {panInch}″ × {panInch}″ loyang
              </p>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="btn-ghost text-base"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <CutDiagram grid={grid} panInch={panInch} />

          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-cocoa-800">
            {cuts === 0 ? (
              <li>No cutting needed: sell the whole loyang as one piece.</li>
            ) : (
              <>
                <li>
                  Make <b>{cuts}</b> straight cut{cuts > 1 ? "s" : ""} from top to bottom, every{" "}
                  <b>
                    {pieceIn.toFixed(2)}″ ({(pieceIn * CM_PER_INCH).toFixed(1)} cm)
                  </b>
                  .
                </li>
                <li>
                  Turn the loyang and make <b>{cuts}</b> more cut{cuts > 1 ? "s" : ""} the other way, same spacing.
                </li>
                <li>
                  You get <b>{pieces}</b> square pieces ({grid} rows × {grid} pieces).
                </li>
              </>
            )}
          </ol>
          {price !== undefined && (
            <p className="mt-3 rounded-lg bg-cocoa-50 px-3 py-2 text-sm">
              Suggested price <b>RM{price.toFixed(2)}</b> each → <b>RM{(price * pieces).toFixed(2)}</b> for the
              whole loyang.
            </p>
          )}
          <p className="mt-3 text-xs text-cocoa-500">
            Tip: mark the spacing on the edge with a ruler first, and wipe the knife between cuts for clean edges.
          </p>
        </div>
      </dialog>
    </>
  );
}
