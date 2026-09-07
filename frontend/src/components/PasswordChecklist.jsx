import { Check, Circle } from "lucide-react";

const RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "A number", test: (p) => /\d/.test(p) },
  { id: "special", label: "A special character (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: "Very weak", color: "#EF4444" },
  { label: "Weak", color: "#F97316" },
  { label: "Fair", color: "#EAB308" },
  { label: "Good", color: "#84CC16" },
  { label: "Strong", color: "#16A34A" },
];

export const passwordValid = (p) => RULES.every((r) => r.test(p));

export const passwordScore = (p) => RULES.filter((r) => r.test(p)).length;

export default function PasswordChecklist({ password }) {
  if (!password) return null;
  const score = passwordScore(password);
  const level = LEVELS[Math.max(0, score - 1)];
  return (
    <div>
      <div data-testid="password-strength-meter" className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {LEVELS.map((_, i) => (
            <span
              key={i}
              data-testid={`pwd-strength-segment-${i}`}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < score ? level.color : "rgba(128,128,128,0.25)" }}
            />
          ))}
        </div>
        <span data-testid="password-strength-label" className="w-16 text-right text-[11px] font-bold" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>
      <ul data-testid="password-checklist" className="mt-2 space-y-1">
        {RULES.map((r) => {
          const ok = r.test(password);
          return (
            <li
              key={r.id}
              data-testid={`pwd-rule-${r.id}`}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200 ${ok ? "text-green-600" : "text-ink/40"}`}
            >
              {ok ? <Check size={11} strokeWidth={3} /> : <Circle size={8} />} {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
