"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MagnifyingGlass, PencilSimple, Eye, Pause, Play, Star, Bed, Bathtub, Car, Ruler, CaretDown, Trash } from "@phosphor-icons/react";
import { Nav } from "@/components/Nav";
import { PropertyModal } from "@/components/PropertyModal";
import { useDomus } from "@/hooks/useDomus";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Property, PropertyStatus, PROPERTY_STATUS_META, PROPERTY_TYPE_LABEL, LISTING_TYPE_LABEL } from "@/lib/types";

function fmtBRL(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }
function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function GestaoPage() {
  const { properties, agents, updateProperty, loaded } = useDomus();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "">("");
  const [agentFilter, setAgentFilter] = useState("");
  const [editing, setEditing] = useState<Property | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (agentFilter && p.agentId !== agentFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${p.title} ${p.address.neighborhood} ${p.address.city}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [properties, statusFilter, agentFilter, search]);

  const stats = useMemo(() => {
    const counts: Record<PropertyStatus, number> = { ativo: 0, reservado: 0, vendido: 0, alugado: 0, pausado: 0 };
    properties.forEach((p) => { counts[p.status]++; });
    return counts;
  }, [properties]);

  function togglePause(p: Property) {
    updateProperty(p.id, { status: p.status === "pausado" ? "ativo" : "pausado" });
  }
  function toggleFeatured(p: Property) {
    updateProperty(p.id, { featured: !p.featured });
  }

  if (!loaded) return <div className="bg-domus" style={{ height: "100vh" }} />;

  return (
    <div className="bg-domus" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Nav />

      <div style={{
        padding: isMobile ? "14px 14px 0" : "20px 24px 0",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? 12 : 16,
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Gestão de imóveis
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {properties.length} imóve{properties.length !== 1 ? "is" : "l"} no portfólio
          </p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ ...btnPrimary, flex: isMobile ? 1 : "0 0 auto", justifyContent: "center" }}>
          <Plus size={13} weight="bold" /> Cadastrar imóvel
        </button>
      </div>

      {/* Stats row */}
      <div style={{
        padding: isMobile ? "12px 14px 0" : "16px 24px 0",
        display: "flex", gap: 6, overflowX: "auto", flexShrink: 0,
      }}>
        <StatusFilterChip label="Todos" count={properties.length} color="#64748b" active={!statusFilter} onClick={() => setStatusFilter("")} />
        {(Object.keys(stats) as PropertyStatus[]).map((st) => {
          const meta = PROPERTY_STATUS_META[st];
          return (
            <StatusFilterChip key={st} label={meta.label} count={stats[st]} color={meta.color} active={statusFilter === st} onClick={() => setStatusFilter(statusFilter === st ? "" : st)} />
          );
        })}
      </div>

      {/* Filters */}
      <div style={{
        padding: isMobile ? "12px 14px 0" : "14px 24px 0",
        display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexShrink: 0,
      }}>
        <div style={{ position: "relative", flex: isMobile ? 1 : "0 0 320px", minWidth: 0 }}>
          <MagnifyingGlass size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, bairro, cidade..."
            style={{
              width: "100%", padding: "9px 12px 9px 36px",
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10,
              color: "#0f172a", fontSize: 13,
            }} />
        </div>

        <div style={{ position: "relative" }}>
          <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} style={{
            padding: "8px 28px 8px 12px", borderRadius: 10,
            background: agentFilter ? "#ecfdf5" : "#ffffff",
            border: `1px solid ${agentFilter ? "#a7f3d0" : "#e2e8f0"}`,
            color: agentFilter ? "#047857" : "#475569",
            fontSize: 11.5, fontWeight: agentFilter ? 600 : 500,
            cursor: "pointer", appearance: "none", outline: "none",
          }}>
            <option value="">Todos corretores</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <CaretDown size={10} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: agentFilter ? "#047857" : "#94a3b8" }} />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px 14px 24px" : "18px 24px 28px" }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: "#ffffff", border: "1px dashed #e2e8f0", borderRadius: 14,
            color: "#94a3b8", fontSize: 13,
          }}>
            Nenhum imóvel encontrado
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {filtered.map((p) => {
                const status = PROPERTY_STATUS_META[p.status];
                const agent = agents.find((a) => a.id === p.agentId);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                      background: "#ffffff", border: "1px solid #e2e8f0",
                      borderRadius: 14, padding: isMobile ? 12 : 14,
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "100px minmax(0, 1fr) auto",
                      gap: isMobile ? 12 : 14, alignItems: "center",
                      boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
                    }}
                  >
                    {/* Thumb */}
                    <div style={{
                      position: "relative", width: isMobile ? "100%" : 100, height: isMobile ? 140 : 75,
                      borderRadius: 10, overflow: "hidden", background: "#0f172a", flexShrink: 0,
                    }}>
                      {p.images[0] && <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />}
                      {p.featured && (
                        <div style={{
                          position: "absolute", top: 6, left: 6,
                          width: 22, height: 22, borderRadius: "50%",
                          background: "#047857",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                        }}>
                          <Star size={11} weight="fill" color="#ffffff" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 8px", borderRadius: 8,
                          background: status.bg, border: `1px solid ${status.border}`,
                          color: status.text, fontSize: 10, fontWeight: 600,
                        }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: status.color }} /> {status.label}
                        </span>
                        <span style={{ fontSize: 10, color: "#64748b", padding: "2px 7px", background: "#f1f5f9", borderRadius: 6, fontWeight: 600 }}>
                          {PROPERTY_TYPE_LABEL[p.type]} · {LISTING_TYPE_LABEL[p.listingType]}
                        </span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.title}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, color: "#64748b" }}>
                        <span>{p.address.neighborhood} · {p.address.city}</span>
                        {p.bedrooms > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Bed size={10} /> {p.bedrooms}</span>}
                        {p.bathrooms > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Bathtub size={10} /> {p.bathrooms}</span>}
                        {p.parkingSpots > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Car size={10} /> {p.parkingSpots}</span>}
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Ruler size={10} /> {p.area}m²</span>
                        {agent && <span>· {agent.name.split(" ")[0]}</span>}
                      </div>
                    </div>

                    {/* Right side: price + actions */}
                    <div style={{
                      display: "flex",
                      flexDirection: isMobile ? "row" : "column",
                      alignItems: isMobile ? "center" : "flex-end",
                      justifyContent: "space-between",
                      gap: 10, flexShrink: 0,
                      paddingTop: isMobile ? 10 : 0,
                      borderTop: isMobile ? "1px solid #f1f5f9" : "none",
                    }}>
                      <div style={{ textAlign: isMobile ? "left" : "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                          {fmtBRL(p.price)}
                          {p.listingType === "aluguel" && <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>/mês</span>}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, display: "flex", gap: 8, alignItems: "center", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Eye size={9} /> {p.views}</span>
                          <span>· {fmtDate(p.createdAt)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => toggleFeatured(p)} title={p.featured ? "Remover destaque" : "Destacar"}
                          style={{ ...btnIcon, ...(p.featured ? btnIconActive("#047857") : {}) }}>
                          <Star size={12} weight={p.featured ? "fill" : "regular"} />
                        </button>
                        <button onClick={() => togglePause(p)} title={p.status === "pausado" ? "Reativar" : "Pausar"} style={btnIcon}>
                          {p.status === "pausado" ? <Play size={12} weight="fill" /> : <Pause size={12} weight="fill" />}
                        </button>
                        <Link href={`/imovel/${p.id}`} title="Visualizar" style={{ ...btnIcon, textDecoration: "none" }}>
                          <Eye size={12} />
                        </Link>
                        <button onClick={() => setEditing(p)} title="Editar" style={btnIcon}>
                          <PencilSimple size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <PropertyModal open={!!editing || showNew} property={editing} onClose={() => { setEditing(null); setShowNew(false); }} />
    </div>
  );
}

function StatusFilterChip({ label, count, color, active, onClick }: { label: string; count: number; color: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "8px 13px", borderRadius: 11,
      background: active ? "#ffffff" : "#f8fafc",
      border: `1px solid ${active ? color : "#e2e8f0"}`,
      cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
      boxShadow: active ? `0 1px 3px ${color}33` : "none",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? "#0f172a" : "#475569" }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: active ? color : "#94a3b8", background: active ? `${color}15` : "#f1f5f9", padding: "1px 6px", borderRadius: 8 }}>
        {count}
      </span>
    </button>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 16px", borderRadius: 10,
  background: "linear-gradient(135deg, #059669, #047857)",
  color: "#ffffff", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  border: "1px solid #047857",
  boxShadow: "0 6px 16px rgba(4,120,87,0.22)",
  whiteSpace: "nowrap", flexShrink: 0,
};
const btnIcon: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8,
  background: "#ffffff", border: "1px solid #e2e8f0",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#64748b", cursor: "pointer",
};
function btnIconActive(color: string): React.CSSProperties {
  return { background: `${color}15`, border: `1px solid ${color}55`, color };
}
