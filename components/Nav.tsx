"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ChartLineUp, Buildings, Users, ArrowsClockwise } from "@phosphor-icons/react";
import { useDomus } from "@/hooks/useDomus";
import { useIsMobile } from "@/hooks/useIsMobile";

const nav = [
  { href: "/",          label: "Galeria",   icon: House,       match: (p: string) => p === "/" || p.startsWith("/imovel") },
  { href: "/dashboard", label: "Dashboard", icon: ChartLineUp, match: (p: string) => p.startsWith("/dashboard") },
  { href: "/gestao",    label: "Gestão",    icon: Buildings,   match: (p: string) => p.startsWith("/gestao") },
  { href: "/leads",     label: "Leads",     icon: Users,       match: (p: string) => p.startsWith("/leads") },
];

export function Nav() {
  const pathname = usePathname();
  const { resetData, leads } = useDomus();
  const isMobile = useIsMobile();

  const novoCount = leads.filter((l) => l.status === "novo").length;

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, padding: isMobile ? "10px 14px" : "14px 22px", flexShrink: 0,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      borderBottom: "1px solid #e2e8f0",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
        <div style={{
          width: isMobile ? 32 : 34, height: isMobile ? 32 : 34, borderRadius: 11,
          background: "linear-gradient(135deg, #059669 0%, #047857 60%, #d97706 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 16px rgba(4,120,87,0.28)",
        }}>
          <House size={17} weight="fill" color="#ffffff" />
        </div>
        {!isMobile ? (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Domus</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 1, whiteSpace: "nowrap" }}>Imóveis & Gestão</div>
          </div>
        ) : (
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Domus</div>
        )}
      </Link>

      <nav style={{ display: "flex", gap: 3, alignItems: "center", overflowX: "auto" }}>
        {nav.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          const showBadge = href === "/leads" && novoCount > 0;
          return (
            <Link
              key={href} href={href} title={label}
              style={{
                position: "relative",
                display: "flex", alignItems: "center", gap: isMobile ? 0 : 7,
                padding: isMobile ? "8px 11px" : "8px 14px", borderRadius: 11,
                background: active ? "#ecfdf5" : "transparent",
                border: active ? "1px solid #a7f3d0" : "1px solid transparent",
                color: active ? "#047857" : "#64748b",
                fontSize: 12.5, fontWeight: active ? 600 : 500,
                textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              <Icon size={14} weight={active ? "duotone" : "regular"} color={active ? "#047857" : "#64748b"} />
              {!isMobile && label}
              {isMobile && active && <span style={{ marginLeft: 6 }}>{label}</span>}
              {showBadge && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: "#e11d48", color: "#ffffff",
                  fontSize: 9, fontWeight: 700,
                  padding: "1px 5px", borderRadius: 10,
                  minWidth: 16, textAlign: "center",
                  border: "2px solid #ffffff",
                }}>
                  {novoCount}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={() => { if (confirm("Resetar todos os dados (imóveis, agentes, leads)?")) resetData(); }}
          title="Resetar dados"
          style={{
            marginLeft: 6, width: 32, height: 32, borderRadius: 10,
            background: "#ffffff", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#64748b", cursor: "pointer", flexShrink: 0,
          }}
        >
          <ArrowsClockwise size={12} />
        </button>
      </nav>
    </header>
  );
}
