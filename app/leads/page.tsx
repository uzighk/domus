"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragOverlay, MouseSensor, TouchSensor,
  useSensor, useSensors, useDraggable, useDroppable, closestCenter,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { Phone, WhatsappLogo, Envelope, Clock, User, ChatText, Trash, CaretDown, MagnifyingGlass, X } from "@phosphor-icons/react";
import { Nav } from "@/components/Nav";
import { useDomus } from "@/hooks/useDomus";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Lead, LeadStatus, LEAD_STATUS_META } from "@/lib/types";

const STAGES: LeadStatus[] = ["novo", "contatado", "visitando", "negociando", "fechado", "perdido"];

function fmtAgo(ts: number) {
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 4) return `${w}sem`;
  return `${Math.floor(d / 30)}mês`;
}

export default function LeadsPage() {
  const { leads, properties, agents, updateLead, deleteLead, loaded } = useDomus();
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<LeadStatus>("novo");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (agentFilter && l.agentId !== agentFilter) return false;
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [leads, agentFilter, search]);

  const byStatus = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    STAGES.forEach((s) => map.set(s, []));
    filtered.forEach((l) => map.get(l.status)?.push(l));
    map.forEach((arr) => arr.sort((a, b) => b.createdAt - a.createdAt));
    return map;
  }, [filtered]);

  function handleDragStart(e: DragStartEvent) { setActiveId(String(e.active.id)); }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (!e.over) return;
    const overId = String(e.over.id);
    const stage = overId.startsWith("col-") ? overId.slice(4) as LeadStatus : null;
    if (!stage) return;
    const lead = leads.find((l) => l.id === e.active.id);
    if (lead && lead.status !== stage) updateLead(lead.id, { status: stage });
  }

  if (!loaded) return <div className="bg-domus" style={{ height: "100vh" }} />;

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <div className="bg-domus" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Nav />

      <div style={{
        padding: isMobile ? "14px 14px 0" : "20px 24px 0",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? 10 : 16,
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Funil de leads
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {filtered.length} lead{filtered.length !== 1 ? "s" : ""} · {!isMobile && "arraste pra mover entre etapas"}
            {isMobile && `${byStatus.get("novo")?.length ?? 0} novos`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: isMobile ? 1 : "0 0 220px" }}>
            <MagnifyingGlass size={12} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar lead..." style={{
              width: "100%", padding: "8px 11px 8px 32px",
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10,
              color: "#0f172a", fontSize: 12,
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
      </div>

      {/* Mobile tabs */}
      {isMobile && (
        <div style={{ padding: "10px 14px 0", display: "flex", gap: 6, overflowX: "auto", flexShrink: 0 }}>
          {STAGES.map((s) => {
            const meta = LEAD_STATUS_META[s];
            const count = byStatus.get(s)?.length ?? 0;
            const active = activeTab === s;
            return (
              <button key={s} onClick={() => setActiveTab(s)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 12px", borderRadius: 11,
                background: active ? meta.bg : "#ffffff",
                border: `1px solid ${active ? meta.border : "#e2e8f0"}`,
                color: active ? meta.text : "#64748b",
                fontSize: 12, fontWeight: active ? 600 : 500,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
                {meta.label}
                <span style={{ padding: "1px 6px", borderRadius: 8, background: active ? meta.color : "#f1f5f9", color: active ? "#ffffff" : "#64748b", fontSize: 10, fontWeight: 700 }}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
        <div style={{
          flex: 1, overflow: "auto",
          padding: isMobile ? "12px 14px 24px" : "18px 24px 24px",
          display: isMobile ? "flex" : "grid",
          gridTemplateColumns: isMobile ? undefined : "repeat(6, minmax(220px, 1fr))",
          flexDirection: isMobile ? "column" : undefined,
          gap: 10,
        }}>
          {STAGES.filter((s) => !isMobile || s === activeTab).map((stage) => {
            const items = byStatus.get(stage) ?? [];
            return (
              <ColumnDroppable key={stage} stage={stage} items={items} properties={properties} agents={agents} activeId={activeId}
                onSelect={setSelectedLead} onDelete={(id) => deleteLead(id)} />
            );
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeLead && (
            <LeadCardView lead={activeLead} property={properties.find((p) => p.id === activeLead.propertyId)} dragging />
          )}
        </DragOverlay>
      </DndContext>

      {/* Lead detail */}
      <AnimatePresence>
        {selectedLead && (() => {
          const lead = leads.find((l) => l.id === selectedLead.id)!;
          const property = properties.find((p) => p.id === lead.propertyId);
          const agent = agents.find((a) => a.id === lead.agentId);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(15,23,42,0.5)",
                backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.16 }} onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 18,
                  width: "min(460px, calc(100vw - 24px))",
                  maxHeight: "calc(100vh - 32px)", overflowY: "auto",
                  boxShadow: "0 30px 70px rgba(15,23,42,0.18)",
                }}
              >
                <div style={{ padding: "18px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ecfdf5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700 }}>
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{lead.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        <Clock size={10} /> Criado há {fmtAgo(lead.createdAt)}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLead(null)} style={iconBtn}><X size={13} /></button>
                </div>

                <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Stage selector */}
                  <div>
                    <label style={lbl}>Etapa do funil</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {STAGES.map((s) => {
                        const meta = LEAD_STATUS_META[s];
                        const active = lead.status === s;
                        return (
                          <button key={s} onClick={() => { updateLead(lead.id, { status: s }); setSelectedLead({ ...lead, status: s }); }} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "5px 11px", borderRadius: 18,
                            background: active ? meta.bg : "#ffffff",
                            border: `1px solid ${active ? meta.color : "#e2e8f0"}`,
                            color: active ? meta.text : "#64748b",
                            fontSize: 11, fontWeight: active ? 600 : 500,
                            cursor: "pointer",
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color }} />
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#0f172a" }}>
                      <Phone size={12} color="#64748b" /> {lead.phone}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#0f172a" }}>
                      <Envelope size={12} color="#64748b" /> {lead.email}
                    </div>
                  </div>

                  {/* Message */}
                  <div style={{ padding: "12px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#92400e", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      <ChatText size={11} /> Mensagem
                    </div>
                    <div style={{ fontSize: 12.5, color: "#0f172a", lineHeight: 1.5 }}>“{lead.message}”</div>
                  </div>

                  {/* Property */}
                  {property && (
                    <Link href={`/imovel/${property.id}`} style={{
                      display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10,
                      background: "#ecfdf5", border: "1px solid #a7f3d0",
                      textDecoration: "none", color: "inherit",
                    }}>
                      <div style={{ width: 56, height: 44, borderRadius: 8, overflow: "hidden", background: "#0f172a", flexShrink: 0 }}>
                        {property.images[0] && <img src={property.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: "#047857", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Imóvel de interesse</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{property.title}</div>
                      </div>
                    </Link>
                  )}

                  {/* Agent */}
                  {agent && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${agent.color}15`, color: agent.color, border: `1.5px solid ${agent.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                        {agent.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Corretor responsável</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{agent.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: "12px 22px 18px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <button onClick={() => { if (confirm("Excluir esse lead?")) { deleteLead(lead.id); setSelectedLead(null); } }} style={btnDanger}>
                    <Trash size={12} /> Excluir
                  </button>
                  <a href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${lead.name.split(" ")[0]}!`)}`} target="_blank" rel="noreferrer" style={btnWhats}>
                    <WhatsappLogo size={13} weight="duotone" /> WhatsApp
                  </a>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function ColumnDroppable({ stage, items, properties, agents, activeId, onSelect, onDelete }: {
  stage: LeadStatus;
  items: Lead[];
  properties: { id: string; title: string; images: string[] }[];
  agents: { id: string; color: string; name: string }[];
  activeId: string | null;
  onSelect: (l: Lead) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${stage}` });
  const meta = LEAD_STATUS_META[stage];
  const total = items.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 200, minWidth: 0 }}>
      <div style={{
        padding: "10px 12px", marginBottom: 8,
        background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 12,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: meta.text }}>{meta.label}</span>
        <span style={{
          marginLeft: "auto", padding: "1px 8px", borderRadius: 10,
          background: meta.color, color: "#ffffff",
          fontSize: 10.5, fontWeight: 700,
        }}>{total}</span>
      </div>
      <div ref={setNodeRef} style={{
        flex: 1, padding: 6, borderRadius: 12,
        background: isOver ? `${meta.color}15` : "transparent",
        border: isOver ? `1.5px dashed ${meta.color}` : "1.5px dashed transparent",
        transition: "all 0.15s",
        display: "flex", flexDirection: "column", gap: 6,
        minHeight: 100,
      }}>
        <AnimatePresence>
          {items.map((l) => (
            <DraggableLead key={l.id} lead={l}
              property={properties.find((p) => p.id === l.propertyId)}
              agent={agents.find((a) => a.id === l.agentId)}
              activeId={activeId}
              onSelect={onSelect} />
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", fontSize: 10.5, color: "#cbd5e1", border: "1px dashed #e2e8f0", borderRadius: 10 }}>
            Nenhum lead aqui
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableLead({ lead, property, agent, activeId, onSelect }: {
  lead: Lead;
  property?: { id: string; title: string; images: string[] };
  agent?: { color: string; name: string };
  activeId: string | null;
  onSelect: (l: Lead) => void;
}) {
  const { setNodeRef, attributes, listeners } = useDraggable({ id: lead.id });
  const isDragging = activeId === lead.id;

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: isDragging ? 0.35 : 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ touchAction: "manipulation" }}
      {...attributes}
      {...listeners}
      onClick={(e) => { if (!isDragging) onSelect(lead); }}
    >
      <LeadCardView lead={lead} property={property} agent={agent} />
    </motion.div>
  );
}

function LeadCardView({ lead, property, agent, dragging = false }: {
  lead: Lead;
  property?: { id: string; title: string; images: string[] };
  agent?: { color: string; name: string };
  dragging?: boolean;
}) {
  return (
    <div style={{
      background: "#ffffff", border: "1px solid #e2e8f0",
      borderRadius: 11, padding: 11, cursor: "grab",
      boxShadow: dragging ? "0 18px 44px rgba(15,23,42,0.18)" : "0 1px 2px rgba(15,23,42,0.03)",
      transform: dragging ? "rotate(1.5deg)" : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "#ecfdf5", color: "#047857",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {lead.name.charAt(0)}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lead.name}
          </div>
        </div>
        <span style={{ fontSize: 9.5, color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtAgo(lead.createdAt)}</span>
      </div>

      {property && (
        <div style={{ fontSize: 10.5, color: "#64748b", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          → {property.title}
        </div>
      )}

      <div style={{ fontSize: 10.5, color: "#475569", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {lead.message}
      </div>

      {agent && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: agent.color }} />
          {agent.name.split(" ")[0]}
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6,
};
const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 9,
  background: "#f8fafc", border: "1px solid #e2e8f0",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#64748b", cursor: "pointer",
};
const btnWhats: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 16px", borderRadius: 10,
  background: "#16a34a", color: "#ffffff",
  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  border: "1px solid #15803d", textDecoration: "none",
  boxShadow: "0 6px 16px rgba(22,163,74,0.18)",
};
const btnDanger: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5,
  padding: "8px 12px", borderRadius: 9,
  background: "#ecfdf5", color: "#047857",
  fontSize: 11.5, fontWeight: 500, cursor: "pointer",
  border: "1px solid #a7f3d0",
};
