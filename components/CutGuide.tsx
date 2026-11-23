"use client";

import { useRef } from "react";

const CM_PER_INCH = 2.54;
const fmtIn = (n: number) => `${Number(n.toFixed(2))}″`;
const fmtCm = (n: number) => (n * CM_PER_INCH).toFixed(1);

/** Top-down picture of the loyang with the cut lines drawn in. */
export function CutDiagram({ rows, cols, panInch }: { rows: number; cols: number; panInch: number }) {
  const size = 220; // drawn pan size in SVG units
  const left = 34;
  const top = 30;
  const cellW = size / cols;
  const cellH = size / rows;
  const pieceW = panInch / cols;
  const pieceL = panInch / rows;
  const unitsPerInch = size / panInch;
  const wholeInches = Math.floor(panInch + 1e-9);
  // Thin out the piece numbers on very fine grids so they stay readable
  const showNumbers = rows <= 12 && cols <= 12;
  const fontSize = Math.max(7, Math.min(16, Math.min(cellW, cellH) * 0.36));

  return (
    <svg
      viewBox={`0 0 ${left + size + 14} ${top + size + 34}`}
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={`Loyang ${panInch} by ${panInch} inch cut into ${rows} rows by ${cols} columns, ${rows * cols} pieces`}
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
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return (
          <g key={i}>
            <rect
              x={left + c * cellW}
              y={top + r * cellH}
              width={cellW}
              height={cellH}
              fill={(r + c) % 2 === 0 ? "#4a2c1e" : "#643c28"}
            />
            {showNumbers && (
              <text
                x={left + c * cellW + cellW / 2}
                y={top + r * cellH + cellH / 2}
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
      <g stroke="#faf6f2" strokeWidth={1.5} strokeDasharray="4 3">
        {Array.from({ length: cols - 1 }, (_, i) => {
          const x = left + (i + 1) * cellW;
          return <line key={`v${i}`} x1={x} y1={top} x2={x} y2={top + size} />;
        })}
        {Array.from({ length: rows - 1 }, (_, i) => {
          const y = top + (i + 1) * cellH;
          return <line key={`h${i}`} x1={left} y1={y} x2={left + size} y2={y} />;
        })}
      </g>

      {/* Size of one piece, marked under the first column */}
      <g stroke="#7f4e32" strokeWidth={1}>
        <line x1={left} y1={top + size + 12} x2={left + cellW} y2={top + size + 12} />
        <line x1={left} y1={top + size + 8} x2={left} y2={top + size + 16} />
        <line x1={left + cellW} y1={top + size + 8} x2={left + cellW} y2={top + size + 16} />
      </g>
      <text x={left} y={top + size + 28} fontSize={9} fill="#643c28">
        1 piece = {fmtIn(pieceW)} × {fmtIn(pieceL)} ({fmtCm(pieceW)} × {fmtCm(pieceL)} cm)
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
  rows,
  cols,
  panInch,
  price,
  className = "",
  light = false,
}: {
  rows: number;
  cols: number;
  panInch: number;
  price?: number;
  className?: string;
  light?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pieces = rows * cols;
  const pieceW = panInch / cols;
  const pieceL = panInch / rows;
  const downCuts = cols - 1; // cuts from top to bottom make the columns
  const acrossCuts = rows - 1; // cuts from side to side make the rows
  const shape = rows === cols ? "square" : "rectangle";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // don't also select the table row
          ref.current?.showModal();
        }}
        aria-label={`Show how to cut ${rows} rows by ${cols} columns`}
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
                {rows} × {cols} cut: {pieces} piece{pieces > 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-cocoa-500">
                {rows} row{rows > 1 ? "s" : ""} × {cols} column{cols > 1 ? "s" : ""} · {panInch}″ × {panInch}″ loyang
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

          <CutDiagram rows={rows} cols={cols} panInch={panInch} />

          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-cocoa-800">
            {pieces === 1 ? (
              <li>No cutting needed: sell the whole loyang as one piece.</li>
            ) : (
              <>
                {downCuts > 0 && (
                  <li>
                    Make <b>{downCuts}</b> cut{downCuts > 1 ? "s" : ""} from <b>top to bottom</b>, every{" "}
                    <b>
                      {fmtIn(pieceW)} ({fmtCm(pieceW)} cm)
                    </b>
                    . This makes {cols} columns.
                  </li>
                )}
                {acrossCuts > 0 && (
                  <li>
                    Make <b>{acrossCuts}</b> cut{acrossCuts > 1 ? "s" : ""} from <b>side to side</b>, every{" "}
                    <b>
                      {fmtIn(pieceL)} ({fmtCm(pieceL)} cm)
                    </b>
                    . This makes {rows} rows.
                  </li>
                )}
                <li>
                  You get <b>{pieces}</b> {shape} pieces of {fmtIn(pieceW)} × {fmtIn(pieceL)}.
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
