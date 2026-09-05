import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cloud, HardDrive, ShieldCheck, Bot, BrainCircuit, Sparkles, Wand2, GitBranch, PenTool,
  Building2, ScanText, Database, BarChart3, MessagesSquare, Users, Zap, Briefcase, Share2,
  LayoutGrid, MonitorSmartphone, Link2, Lightbulb, ArrowRight, Phone, Mail,
} from "lucide-react";
import { MaskedLine, Reveal } from "../components/motion";
import Marquee from "../components/Marquee";
import { BRAND } from "../lib/data";

const MS_CONTACT = {
  phone: BRAND.phone,
  phoneHref: BRAND.phone.replace(/\s/g, ""),
  email: BRAND.email,
};

// Microsoft brand palette
const MS_COLORS = ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"];
const MS_BLUE = "#0078D4";
const MS_BLUE_HOVER = "#106EBE";
const MS_NAVY_GRADIENT = "linear-gradient(135deg, #002050 0%, #00122B 100%)";

const MicrosoftMark = ({ size = 6 }) => (
  <span className="grid shrink-0 grid-cols-2 gap-[2px]" aria-hidden="true">
    {MS_COLORS.map((c) => (
      <span key={c} className="rounded-[1.5px]" style={{ backgroundColor: c, height: size, width: size }} />
    ))}
  </span>
);

const SERVICE_GROUPS = [
  {
    id: "cloud-infrastructure",
    label: "Cloud & Infrastructure",
    accent: "#0078D4",
    tint: "rgba(0, 120, 212, 0.10)",
    services: [
      { icon: Cloud, name: "Azure AI & Cloud", desc: "Move your workloads to Azure with a partner who plans, migrates and manages the whole journey." },
      { icon: HardDrive, name: "OneDrive", desc: "Give every team member secure, anywhere access to their files — with proper governance in place." },
      { icon: ShieldCheck, name: "Microsoft Security", desc: "Protect identities, devices and data with Defender, Entra and Purview configured the right way." },
    ],
  },
  {
    id: "ai-innovation",
    label: "AI & Innovation",
    accent: "#5C2D91",
    tint: "rgba(92, 45, 145, 0.10)",
    services: [
      { icon: Bot, name: "Microsoft AI Agents", desc: "Automate routine work with custom agents that act on your business data, safely." },
      { icon: BrainCircuit, name: "Azure AI Foundry", desc: "Build and ship production AI applications on a managed, enterprise-grade platform." },
      { icon: Sparkles, name: "Microsoft 365 Copilot", desc: "Put an AI assistant inside Word, Excel, Outlook and Teams — with adoption training included." },
      { icon: Wand2, name: "Microsoft Copilot Studio", desc: "Design your own copilots and automated workflows without needing a large dev team." },
      { icon: GitBranch, name: "GitHub & DevOps", desc: "Ship software faster with pipelines, code review and repositories your team will actually use." },
      { icon: PenTool, name: "Microsoft Loop & Whiteboard", desc: "Keep ideas, notes and plans moving together in one shared, always-current workspace." },
      { icon: Building2, name: "Microsoft Places", desc: "Make hybrid work visible — coordinate office days, desks and shared spaces with ease." },
      { icon: ScanText, name: "Intelligent Document Processing", desc: "Turn invoices, forms and paperwork into structured, usable data automatically." },
    ],
  },
  {
    id: "data-analytics",
    label: "Data & Analytics",
    accent: "#107C10",
    tint: "rgba(16, 124, 16, 0.10)",
    services: [
      { icon: Database, name: "Microsoft Fabric", desc: "One platform for your entire data estate — from ingestion through to live dashboards." },
      { icon: BarChart3, name: "Business Intelligence", desc: "Decisions on facts, not gut feel — Power BI reporting your leadership will open daily." },
    ],
  },
  {
    id: "business-apps",
    label: "Business Applications & Collaboration",
    accent: "#D83B01",
    tint: "rgba(216, 59, 1, 0.10)",
    services: [
      { icon: MessagesSquare, name: "Microsoft Teams", desc: "Calls, chat and meetings that just work — deployed, secured and adopted by your staff." },
      { icon: Users, name: "Microsoft Viva", desc: "Engage, inform and grow your people inside the flow of their everyday work." },
      { icon: Zap, name: "Power Platform", desc: "Automate approvals and build internal apps in days, without heavy development." },
      { icon: Briefcase, name: "Dynamics 365", desc: "CRM and ERP that connect sales, service and operations on a single platform." },
      { icon: Share2, name: "SharePoint", desc: "Intranets and document management your staff can actually find things in." },
      { icon: LayoutGrid, name: "Microsoft 365", desc: "The productivity suite — licensed correctly, deployed cleanly and supported properly." },
      { icon: MonitorSmartphone, name: "Microsoft Intune & Endpoint Management", desc: "Every laptop and phone enrolled, compliant and secure — wherever your people work." },
    ],
  },
  {
    id: "integration-development",
    label: "Integration & Development",
    accent: "#8A6D00",
    tint: "rgba(255, 185, 0, 0.14)",
    services: [
      { icon: Link2, name: "B2B Integration", desc: "Connect your systems to suppliers and customers with reliable, automated data flows." },
      { icon: Lightbulb, name: "SaaS Product Consulting", desc: "From idea to revenue — architecture, build and go-to-market guidance for software products." },
    ],
  },
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const msImg = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;

export default function MicrosoftServices() {
  return (
    <div data-testid="ms-services-page" className="bg-paper">
      <section className="relative overflow-hidden py-16 text-white lg:py-24" style={{ background: MS_NAVY_GRADIENT }}>
        {MS_COLORS.map((c, i) => (
          <div
            key={c}
            className="pointer-events-none absolute h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{
              backgroundColor: c,
              top: i % 2 === 0 ? "-6rem" : "auto",
              bottom: i % 2 === 1 ? "-6rem" : "auto",
              left: i < 2 ? `${i * 30}%` : "auto",
              right: i >= 2 ? `${(i - 2) * 25}%` : "auto",
            }}
          />
        ))}
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <MaskedLine delay={0.1}>
              <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
                <MicrosoftMark size={7} /> Microsoft Solutions
              </span>
            </MaskedLine>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <MaskedLine delay={0.2}>Microsoft Services.</MaskedLine>
            </h1>
            <MaskedLine delay={0.35} className="mt-5 max-w-xl">
              <span className="text-sm leading-relaxed text-white/60 sm:text-base">
                iMagine delivers Microsoft-powered solutions across cloud, AI, data, collaboration and integration — implemented, secured and supported by people who know the stack.
              </span>
            </MaskedLine>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/contact"
                data-testid="ms-hero-cta"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300"
                style={{ backgroundColor: MS_BLUE }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = MS_BLUE_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = MS_BLUE)}
              >
                Book a consultation <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href={`tel:${MS_CONTACT.phoneHref}`}
                data-testid="ms-hero-phone"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white/80 transition-colors duration-200 hover:border-[#00A4EF] hover:text-[#00A4EF]"
              >
                <Phone size={14} /> {MS_CONTACT.phone}
              </a>
            </motion.div>
            <Reveal delay={0.65}>
              <p className="mt-6 text-xs text-white/40" data-testid="ms-hero-contact">
                Microsoft services enquiries: <span className="font-semibold text-white/70">{BRAND.name}</span> · {MS_CONTACT.phone} · {MS_CONTACT.email}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.25}>
            <div className="rounded-[2rem] p-[3px] shadow-2xl shadow-black/40" style={{ background: `linear-gradient(135deg, ${MS_COLORS.join(", ")})` }}>
              <div className="overflow-hidden rounded-[calc(2rem-3px)]">
                <img
                  src={msImg("photo-1593642632823-8f785ba67e45")}
                  alt="Microsoft Surface laptop on a desk"
                  data-testid="ms-hero-image"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1.5" data-testid="ms-color-strip" style={{ background: `linear-gradient(90deg, ${MS_COLORS.join(", ")})` }} />
      </section>

      <Marquee items={["Azure", "Microsoft 365", "Copilot", "Power Platform", "Dynamics 365", "Security", "Fabric"]} />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        {SERVICE_GROUPS.map((group) => (
          <section key={group.id} data-testid={`ms-group-${group.id}`} className="mb-14 last:mb-0">
            <Reveal>
              <p className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: group.accent }}>
                <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: group.accent }} />
                {group.label}
              </p>
            </Reveal>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.services.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: (i % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    data-testid={`ms-service-card-${slug(s.name)}`}
                    className="group flex h-full flex-col rounded-3xl border border-black/5 bg-white p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/10"
                  >
                    <span className="mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: group.accent }} />
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: group.tint, color: group.accent }}>
                      <s.icon size={19} />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-ink">{s.name}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink/60">{s.desc}</p>
                    <Link
                      to={`/contact?service=${encodeURIComponent(s.name)}`}
                      data-testid={`ms-enquire-${slug(s.name)}`}
                      className="mt-4 inline-flex w-fit items-center gap-1 text-xs font-semibold transition-colors duration-200 hover:underline"
                      style={{ color: group.accent }}
                    >
                      Enquire about this <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-8 lg:px-12 lg:pb-20" data-testid="ms-band">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-ink/10">
            <img
              src={msImg("photo-1519389950473-47ba0277781c")}
              alt="Team working on laptops"
              data-testid="ms-band-image"
              loading="lazy"
              className="aspect-[21/9] w-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,32,80,0.85) 0%, rgba(0,18,43,0.35) 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-center p-7 sm:p-12">
              <p className="eyebrow !text-[#7FBA00]">Why iMagine</p>
              <p className="mt-3 max-w-md font-display text-xl font-extrabold leading-snug text-white sm:text-3xl">
                One Westville team for your Apple and Microsoft worlds.
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                Devices, repairs, cloud and AI — a single local partner that keeps your whole stack running.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative overflow-hidden py-16 text-white lg:py-20" data-testid="ms-closing-cta" style={{ background: MS_NAVY_GRADIENT }}>
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: "#00A4EF" }} />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: "#FFB900" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <Reveal>
            <p className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
              <MicrosoftMark size={6} /> Next step
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to get started with{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${MS_COLORS.join(", ")})` }}>
                Microsoft solutions?
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
              Talk to the iMagine team about what your business needs — no obligation, plain language.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                data-testid="ms-cta-contact-btn"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300"
                style={{ backgroundColor: MS_BLUE }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = MS_BLUE_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = MS_BLUE)}
              >
                Get in touch <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href={`mailto:${MS_CONTACT.email}`}
                data-testid="ms-cta-email"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white/80 transition-colors duration-200 hover:border-[#00A4EF] hover:text-[#00A4EF]"
              >
                <Mail size={14} /> {MS_CONTACT.email}
              </a>
              <a
                href={`tel:${MS_CONTACT.phoneHref}`}
                data-testid="ms-cta-phone"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white/80 transition-colors duration-200 hover:border-[#00A4EF] hover:text-[#00A4EF]"
              >
                <Phone size={14} /> {MS_CONTACT.phone}
              </a>
            </div>
          </Reveal>
        </div>
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${MS_COLORS.join(", ")})` }} />
      </section>
    </div>
  );
}
