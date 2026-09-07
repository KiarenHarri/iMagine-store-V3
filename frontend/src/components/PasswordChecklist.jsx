import { Check, Circle } from "lucide-react";

const RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "A number", test: (p) => /\d/.test(p) },
  { id: "special", label: "A special character (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const passwordValid = (p) => RULES.every((r) => r.test(p));

export default function PasswordChecklist({ password }) {
  if (!password) return null;
  return (
    <ul data-testid="password-checklist" className="space-y-1">
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
  );
}
