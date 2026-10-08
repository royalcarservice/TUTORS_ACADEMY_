import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, RotateCcw, X } from "lucide-react";
import type {
  ChoiceInteraction,
  Interaction,
  MatchInteraction,
  NumericInteraction,
  SequenceInteraction,
} from "../data/subjects";
import { cn } from "../lib/cn";

/* ════════════════════════════════════════════════════════════════════════
   SAMPLE PRACTICE

   Four small interaction types, one per subject's way of checking itself.
   Every one of them actually answers: keyboard operable, with feedback in a
   live region and the working shown either way, so a wrong attempt teaches
   something. Nothing here talks to a server — these are local previews.
   ════════════════════════════════════════════════════════════════════════ */

type Result = "idle" | "correct" | "incorrect";

export function Practice({
  interaction,
  tone = "light",
}: {
  interaction: Interaction;
  tone?: "light" | "dark";
}) {
  switch (interaction.kind) {
    case "numeric":
      return <NumericPractice spec={interaction} tone={tone} />;
    case "choice":
      return <ChoicePractice spec={interaction} tone={tone} />;
    case "sequence":
      return <SequencePractice spec={interaction} tone={tone} />;
    case "match":
      return <MatchPractice spec={interaction} tone={tone} />;
  }
}

/* ── shared chrome ─────────────────────────────────────────────────────── */

const fieldBase =
  "min-h-12 rounded-2xl border px-4 text-[0.9375rem] outline-none transition-colors";

function toneClasses(tone: "light" | "dark") {
  return tone === "dark"
    ? {
        field: "border-white/20 bg-white/[0.06] text-white placeholder:text-white/35 focus:border-teal-soft",
        action: "bg-white text-ink hover:bg-white/90",
        ghost: "border border-white/20 text-white/80 hover:bg-white/10",
        label: "text-white/55",
        body: "text-white/75",
        panel: "border-white/10 bg-white/[0.04]",
      }
    : {
        field: "border-line-2 bg-paper text-ink placeholder:text-ink-muted focus:border-teal",
        action: "bg-ink text-white hover:bg-ink-2",
        ghost: "border border-line-2 text-ink-soft hover:bg-ground",
        label: "text-ink-muted",
        body: "text-ink-soft",
        panel: "border-line bg-ground/60",
      };
}

function Feedback({
  result,
  work,
  tone,
}: {
  result: Result;
  work: string;
  tone: "light" | "dark";
}) {
  if (result === "idle") return null;
  const correct = result === "correct";
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mt-4 rounded-2xl border p-4",
        correct
          ? "border-teal/40 bg-teal/10"
          : tone === "dark"
            ? "border-white/20 bg-white/[0.06]"
            : "border-line-2 bg-ground",
      )}
    >
      <p
        className={cn(
          "flex items-center gap-2 text-[0.9375rem] font-medium",
          correct ? "text-teal-deep" : tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {correct ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <X className="h-4 w-4" aria-hidden="true" />
        )}
        {correct ? "Correct." : "Not yet."}
      </p>
      <p
        className={cn(
          "mt-2 text-[0.875rem] leading-relaxed",
          tone === "dark" ? "text-white/70" : "text-ink-soft",
        )}
      >
        {work}
      </p>
    </div>
  );
}

/* ── numeric ───────────────────────────────────────────────────────────── */

function NumericPractice({
  spec,
  tone,
}: {
  spec: NumericInteraction;
  tone: "light" | "dark";
}) {
  const t = toneClasses(tone);
  const id = useId();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result>("idle");

  const check = () => {
    const n = Number.parseFloat(value.replace(",", "."));
    if (!Number.isFinite(n)) {
      setResult("incorrect");
      return;
    }
    setResult(Math.abs(n - spec.answer) <= spec.tolerance ? "correct" : "incorrect");
  };

  const reset = () => {
    setValue("");
    setResult("idle");
  };

  return (
    <div data-practice="numeric" className={cn("rounded-2xl border p-4 sm:p-5", t.panel)}>
      <p className={cn("eyebrow", t.label)}>{spec.prompt}</p>
      <p className={cn("mt-3 text-[1rem] leading-relaxed", t.body)}>{spec.label}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <label htmlFor={id} className="sr-only">
          Your answer{spec.unit ? ` in ${spec.unit}` : ""}
        </label>
        <input
          id={id}
          value={value}
          inputMode="decimal"
          autoComplete="off"
          placeholder={spec.unit ?? "Answer"}
          onChange={(e) => {
            setValue(e.target.value);
            setResult("idle");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              check();
            }
          }}
          className={cn(fieldBase, "w-36", t.field)}
        />
        <button
          type="button"
          onClick={check}
          className={cn(
            "inline-flex min-h-12 items-center rounded-2xl px-5 text-[0.875rem] font-medium transition-colors",
            t.action,
          )}
        >
          Check answer
        </button>
        <ResetButton onClick={reset} tone={tone} />
      </div>

      <Feedback result={result} work={spec.work} tone={tone} />
    </div>
  );
}

/* ── multiple choice ───────────────────────────────────────────────────── */

function ChoicePractice({
  spec,
  tone,
}: {
  spec: ChoiceInteraction;
  tone: "light" | "dark";
}) {
  const t = toneClasses(tone);
  const groupId = useId();
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<Result>("idle");

  return (
    <div data-practice="choice" className={cn("rounded-2xl border p-4 sm:p-5", t.panel)}>
      <p className={cn("eyebrow", t.label)}>{spec.prompt}</p>
      <fieldset className="mt-3">
        <legend className={cn("text-[1rem] leading-relaxed", t.body)}>
          {spec.question}
        </legend>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {spec.options.map((o) => {
            const active = picked === o.id;
            return (
              <label
                key={o.id}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-[0.9375rem] transition-colors",
                  active
                    ? "border-ink bg-ink text-white"
                    : tone === "dark"
                      ? "border-white/15 text-white/80 hover:bg-white/[0.07]"
                      : "border-line-2 bg-paper text-ink-soft hover:border-ink/30",
                )}
              >
                <input
                  type="radio"
                  name={groupId}
                  value={o.id}
                  checked={active}
                  onChange={() => {
                    setPicked(o.id);
                    setResult("idle");
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 rounded-full border",
                    active ? "border-white bg-brass" : "border-current opacity-50",
                  )}
                />
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          disabled={!picked}
          onClick={() => setResult(picked === spec.answer ? "correct" : "incorrect")}
          className={cn(
            "inline-flex min-h-12 items-center rounded-2xl px-5 text-[0.875rem] font-medium transition-colors disabled:opacity-40",
            t.action,
          )}
        >
          Check answer
        </button>
        <ResetButton
          tone={tone}
          onClick={() => {
            setPicked(null);
            setResult("idle");
          }}
        />
      </div>

      <Feedback result={result} work={spec.work} tone={tone} />
    </div>
  );
}

/* ── ordering ──────────────────────────────────────────────────────────── */

function SequencePractice({
  spec,
  tone,
}: {
  spec: SequenceInteraction;
  tone: "light" | "dark";
}) {
  const t = toneClasses(tone);
  const [order, setOrder] = useState<ReadonlyArray<string>>(() =>
    spec.items.map((i) => i.id),
  );
  const [result, setResult] = useState<Result>("idle");

  const byId = useMemo(
    () => new Map(spec.items.map((i) => [i.id, i])),
    [spec.items],
  );

  const move = (index: number, delta: number) => {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    setOrder(next);
    setResult("idle");
  };

  const check = () => {
    const ok =
      order.length === spec.answer.length &&
      order.every((id, i) => id === spec.answer[i]);
    setResult(ok ? "correct" : "incorrect");
  };

  return (
    <div data-practice="sequence" className={cn("rounded-2xl border p-4 sm:p-5", t.panel)}>
      <p className={cn("eyebrow", t.label)}>{spec.prompt}</p>
      <p className={cn("mt-3 text-[1rem] leading-relaxed", t.body)}>{spec.question}</p>

      <ol className="mt-4 grid gap-2">
        {order.map((id, i) => {
          const item = byId.get(id)!;
          return (
            <li
              key={id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3 py-2",
                tone === "dark"
                  ? "border-white/15 bg-white/[0.04]"
                  : "border-line-2 bg-paper",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold",
                  tone === "dark" ? "bg-white/12 text-white" : "bg-ground text-ink-soft",
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-[0.9375rem]",
                    tone === "dark" ? "text-white/90" : "text-ink",
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    "block text-[0.75rem]",
                    tone === "dark" ? "text-white/45" : "text-ink-muted",
                  )}
                >
                  {item.note}
                </span>
              </span>
              <span className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-25",
                    t.ghost,
                  )}
                >
                  <span className="sr-only">Move {item.label} up</span>
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-25",
                    t.ghost,
                  )}
                >
                  <span className="sr-only">Move {item.label} down</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={check}
          className={cn(
            "inline-flex min-h-12 items-center rounded-2xl px-5 text-[0.875rem] font-medium transition-colors",
            t.action,
          )}
        >
          Check order
        </button>
        <ResetButton
          tone={tone}
          onClick={() => {
            setOrder(spec.items.map((i) => i.id));
            setResult("idle");
          }}
        />
      </div>

      <Feedback result={result} work={spec.work} tone={tone} />
    </div>
  );
}

/* ── matching ──────────────────────────────────────────────────────────── */

function MatchPractice({
  spec,
  tone,
}: {
  spec: MatchInteraction;
  tone: "light" | "dark";
}) {
  const t = toneClasses(tone);
  const [selected, setSelected] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Readonly<Record<string, string>>>({});
  const [result, setResult] = useState<Result>("idle");

  const rights = useMemo(() => spec.pairs.map((p) => p.right), [spec.pairs]);
  const used = new Set(Object.values(assigned));
  const complete = Object.keys(assigned).length === spec.pairs.length;

  const assign = (right: string) => {
    if (!selected) return;
    setAssigned((prev) => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) if (v !== right) next[k] = v;
      next[selected] = right;
      return next;
    });
    setSelected(null);
    setResult("idle");
  };

  const check = () => {
    const ok = spec.pairs.every((p) => assigned[p.left] === p.right);
    setResult(ok ? "correct" : "incorrect");
  };

  return (
    <div data-practice="match" className={cn("rounded-2xl border p-4 sm:p-5", t.panel)}>
      <p className={cn("eyebrow", t.label)}>{spec.prompt}</p>
      <p className={cn("mt-3 text-[1rem] leading-relaxed", t.body)}>{spec.question}</p>
      <p className={cn("mt-2 text-[0.8125rem]", t.label)}>
        Choose a quantity, then choose its unit.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          {spec.pairs.map((p) => {
            const active = selected === p.left;
            const value = assigned[p.left];
            return (
              <button
                key={p.left}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelected(active ? null : p.left);
                  setResult("idle");
                }}
                className={cn(
                  "flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 text-left text-[0.9375rem] transition-colors",
                  active
                    ? "border-ink bg-ink text-white"
                    : tone === "dark"
                      ? "border-white/15 text-white/85 hover:bg-white/[0.07]"
                      : "border-line-2 bg-paper text-ink hover:border-ink/30",
                )}
              >
                <span>{p.left}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 font-mono text-[0.75rem]",
                    value
                      ? active
                        ? "bg-white/20 text-white"
                        : "bg-teal/15 text-teal-deep"
                      : active
                        ? "bg-white/10 text-white/50"
                        : "bg-ground text-ink-muted",
                  )}
                >
                  {value ?? "—"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-2 sm:content-start">
          {rights.map((right) => {
            const taken = used.has(right);
            return (
              <button
                key={right}
                type="button"
                disabled={!selected}
                onClick={() => assign(right)}
                className={cn(
                  "min-h-12 rounded-2xl border px-4 text-left font-mono text-[0.875rem] transition-colors disabled:opacity-45",
                  taken
                    ? "border-teal/40 bg-teal/10 text-teal-deep"
                    : t.ghost,
                )}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          disabled={!complete}
          onClick={check}
          className={cn(
            "inline-flex min-h-12 items-center rounded-2xl px-5 text-[0.875rem] font-medium transition-colors disabled:opacity-40",
            t.action,
          )}
        >
          Check pairs
        </button>
        <ResetButton
          tone={tone}
          onClick={() => {
            setAssigned({});
            setSelected(null);
            setResult("idle");
          }}
        />
      </div>

      <Feedback result={result} work={spec.work} tone={tone} />
    </div>
  );
}

/* ── reset ─────────────────────────────────────────────────────────────── */

function ResetButton({
  onClick,
  tone,
}: {
  onClick: () => void;
  tone: "light" | "dark";
}) {
  const t = toneClasses(tone);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 text-[0.875rem] transition-colors",
        t.ghost,
      )}
    >
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      Reset
    </button>
  );
}
