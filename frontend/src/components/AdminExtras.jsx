import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrendingUp, Tag, Trash2, ImagePlus, Wrench, Percent, Inbox } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function StatsStrip() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/admin/stats`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const cards = [
    { icon: Inbox, label: "New this week", value: stats?.new_this_week, testId: "stat-new-week" },
    { icon: Wrench, label: "Pending repairs", value: stats?.pending_repairs, testId: "stat-pending-repairs" },
    { icon: Percent, label: "Acceptance rate", value: stats ? `${stats.acceptance_rate}%` : null, testId: "stat-acceptance" },
    { icon: Tag, label: "Active sales", value: stats?.active_sales, testId: "stat-sales" },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="admin-stats-strip">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-black/5 bg-white p-5">
          <c.icon size={17} className="text-brand" />
          <p className="mt-3 font-display text-3xl font-extrabold text-ink" data-testid={c.testId}>
            {c.value ?? "—"}
          </p>
          <p className="mt-1 text-xs font-medium text-mute">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

export function SalesPanel() {
  const salePhase = (s) => {
    const now = new Date().toISOString();
    if (s.ends_at && s.ends_at < now) return { t: "Ended", cls: "bg-red-50 text-red-500 border-red-200" };
    if (s.starts_at && s.starts_at > now) return { t: "Scheduled", cls: "bg-brand-subtle text-brand border-brand/30" };
    return { t: "Live now", cls: "bg-green-50 text-green-600 border-green-200" };
  };

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  const [sales, setSales] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", was_price: "", description: "", image: "", starts_at: "", ends_at: "" });
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch(`${API}/admin/sales/all`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setSales)
      .catch(() => setSales([]));

  useEffect(() => {
    load();
  }, []);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const imgEl = new Image();
      imgEl.onload = () => {
        const size = 500;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const side = Math.min(imgEl.width, imgEl.height);
        const sx = (imgEl.width - side) / 2;
        const sy = (imgEl.height - side) / 2;
        ctx.drawImage(imgEl, sx, sy, side, side, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        setForm((f) => ({ ...f, image: dataUrl }));
        setPreview(dataUrl);
      };
      imgEl.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const createSale = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : "",
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : "",
      };
      const res = await fetch(`${API}/admin/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.detail === "string" ? d.detail : "Could not create the sale");
      }
      toast.success("Sale is live on the store");
      setForm({ name: "", price: "", was_price: "", description: "", image: "" });
      setPreview("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeSale = async (id) => {
    try {
      const res = await fetch(`${API}/admin/sales/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Sale removed");
      setSales((s) => s.filter((x) => x.id !== id));
    } catch {
      toast.error("Could not remove the sale");
    }
  };

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-paper px-5 py-3 text-sm outline-none transition-colors focus:border-brand";

  return (
    <div data-testid="sales-panel">
      <form onSubmit={createSale} className="rounded-3xl border border-black/5 bg-white p-7" data-testid="sale-form">
        <p className="eyebrow flex items-center gap-2"><Tag size={13} className="text-brand" /> Create a sale</p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input data-testid="sale-name-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name, e.g. iPhone 15 Pro 256GB" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input data-testid="sale-price-input" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Now: R 17 999" className={inputCls} />
            <input data-testid="sale-was-input" value={form.was_price} onChange={(e) => setForm({ ...form, was_price: e.target.value })} placeholder="Was: R 21 999" className={inputCls} />
          </div>
          <input data-testid="sale-desc-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description (optional)" className={`${inputCls} sm:col-span-2`} />
          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Starts (optional)</span>
              <input data-testid="sale-starts-input" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Ends (optional)</span>
              <input data-testid="sale-ends-input" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className={inputCls} />
            </label>
          </div>
          <label data-testid="sale-image-label" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-paper px-5 py-3 text-sm text-ink/60 transition-colors hover:border-brand sm:col-span-2">
            <ImagePlus size={17} className="text-brand" />
            {preview ? "Photo attached (auto-cropped to 500×500) — click to change" : "Add a photo of the item — auto-cropped to 500×500"}
            <input data-testid="sale-image-input" type="file" accept="image/*" onChange={pickImage} className="hidden" />
            {preview && <img src={preview} alt="Sale preview" className="ml-auto h-10 w-10 rounded-lg object-cover" />}
          </label>
        </div>
        <button type="submit" data-testid="sale-submit-btn" disabled={busy} className="mt-5 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:opacity-50">
          {busy ? "Publishing…" : "Publish sale"}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-4" data-testid="sales-list">
        {(sales || []).map((s) => (
          <div key={s.id} data-testid={`sale-row-${s.id}`} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4">
            {s.image ? (
              <img src={s.image} alt={s.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-paper"><Tag size={18} className="text-mute" /></span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-bold text-ink">{s.name}</p>
              <p className="mt-0.5 text-sm">
                <span className="font-bold text-brand">{s.price}</span>
                {s.was_price && <span className="ml-2 text-mute line-through">{s.was_price}</span>}
              </p>
              {(s.starts_at || s.ends_at) && (
                <p className="mt-1 text-xs text-mute">
                  {s.starts_at ? `From ${fmtDate(s.starts_at)}` : "Starts immediately"}
                  {s.ends_at ? ` · until ${fmtDate(s.ends_at)}` : ""}
                </p>
              )}
            </div>
            <span data-testid={`sale-phase-${s.id}`} className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${salePhase(s).cls}`}>
              {salePhase(s).t}
            </span>
            <button data-testid={`sale-delete-${s.id}`} onClick={() => removeSale(s.id)} className="rounded-full border border-red-200 p-2.5 text-red-500 transition-colors hover:border-red-400 hover:bg-red-50" aria-label="Remove sale">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {sales && sales.length === 0 && (
          <p data-testid="sales-empty" className="py-8 text-center text-sm text-mute">No sales live right now — create the first one above.</p>
        )}
      </div>
    </div>
  );
}
