"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Buildings, Users, Eye, CurrencyCircleDollar, TrendUp, House, Receipt, ArrowRight, Star } from "@phosphor-icons/react";
import { Nav } from "@/components/Nav";
import { useDomus } from "@/hooks/useDomus";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LEAD_STATUS_META, PROPERTY_TYPE_LABEL } from "@/lib/types";

function fmtBRL(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }
function fmtCompact(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
  return `R$ ${v}`;
}

export default function DashboardPage() {
  const { properties, leads, agents, loaded } = useDomus();
  const isMobile = useIsMobile();

  const stats = useMemo(() => {
    const ativos = properties.filter((p) => p.status === "ativo").length;
    const reservados = properties.filter((p) => p.status === "reservado").length;
    const vendidos = properties.filter((p) => p.status === "vendido").length;
    const alugados = properties.filter((p) => p.status === "alugado").length;
    const totalVistas = properties.reduce((s, p) => s + p.views, 0);
    const valorAtivo = properties.filter((p) => p.status === "ativo" || p.status === "reservado").reduce((s, p) => s + p.price, 0);
    const novosLeads = leads.filter((l) => l.status === "novo").length;
    const negociando = leads.filter((l) => l.status === "negociando").length;
    const fechados = leads.filter((l) => l.status === "fechado").length;
    const conv = leads.length > 0 ? (fechados / leads.length) * 100 : 0;
    return { ativos, reservados, vendidos, alugados, totalVistas, valorAtivo, novosLeads, negociando, fechados, conv };
  }, [properties, leads]);

  const topProperties = useMemo(() => {
    return [...properties].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [properties]);

  const recentLeads = useMemo(() => {
    return [...leads].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [leads]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    properties.forEach((p) => map.set(p.type, (map.get(p.type) ?? 0) + 1));
    const total = properties.length;
    return Array.from(map.entries()).map(([type, count]) => ({
      type, count, pct: total > 0 ? (count / total) * 100 : 0,
    })).sort((a, b) => b.count - a.count);
  }, [properties]);

  const TYPE_COLORS: Record<string, string> = {
    casa: "#047857", apartamento: "#d97706", cobertura: "#7c3aed",
    terreno: "#0ea5e9", comercial: "#f43f5e",
  };

  if (!loaded) {
    return (
      <div className="bg-domus" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 26, height: 26, border: "2px solid #e2e8f0", borderTopColor: "#047857", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div className="bg-domus" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Nav />

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 14px 28px" : "22px 24px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
              Visão geral do portfólio · {agents.length} corretor{agents.length !== 1 ? "es" : ""}
            </p>
          </div>

          {/* KPIs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 12,
          }}>
            <KpiCard label="Imóveis ativos" value={stats.ativos} hint={`${stats.reservados} reservados`} icon={House} color="#047857" />
            <KpiCard label="Valor em carteira" value={fmtCompact(stats.valorAtivo)} hint="Ativos + reservados" icon={CurrencyCircleDollar} color="#d97706" />
            <KpiCard label="Visualizações" value={stats.totalVistas.toLocaleString("pt-BR")} hint="Total acumulado" icon={Eye} color="#7c3aed" />
            <KpiCard label="Leads novos" value={stats.novosLeads} hint={`${stats.negociando} em negociação`} icon={Users} color="#f59e0b" accent />
          </div>

          {/* Conversion bar */}
          <div style={{
            background: "linear-gradient(135deg, #ffffff, #ecfdf5)",
            border: "1px solid #a7f3d0", borderRadius: 16, padding: 16,
            display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #047857, #065f46)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 16px rgba(4,120,87,0.25)" }}>
              <TrendUp size={22} weight="duotone" color="#ffffff" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Taxa de conversão</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{stats.conv.toFixed(1)}%</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>· {stats.fechados} de {leads.length} leads fechados</span>
              </div>
            </div>
            <Link href="/leads" style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 14px", borderRadius: 10,
              background: "#ffffff", color: "#047857",
              fontSize: 12, fontWeight: 600,
              border: "1px solid #a7f3d0",
              textDecoration: "none",
            }}>
              Ver funil <ArrowRight size={11} weight="bold" />
            </Link>
          </div>

          {/* Two columns: Top properties + Recent leads */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 14,
          }}>
            {/* Top properties by views */}
            <div style={{
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16,
              padding: isMobile ? 14 : 18,
              boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Imóveis mais vistos</div>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>Top 5 da carteira</div>
                </div>
                <Link href="/gestao" style={{ fontSize: 11, color: "#047857", fontWeight: 600, textDecoration: "none" }}>
                  Ver todos →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topProperties.map((p) => (
                  <Link key={p.id} href={`/imovel/${p.id}`} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 11,
                    background: "#f8fafc", border: "1px solid #f1f5f9",
                    textDecoration: "none", color: "inherit",
                  }}>
                    <div style={{
                      width: 56, height: 44, borderRadius: 8, flexShrink: 0,
                      background: "#0f172a", overflow: "hidden",
                    }}>
                      {p.images[0] && <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        {p.address.neighborhood} · {fmtBRL(p.price)}{p.listingType === "aluguel" && "/mês"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#047857", flexShrink: 0 }}>
                      <Eye size={11} weight="duotone" /> {p.views}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent leads */}
            <div style={{
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16,
              padding: isMobile ? 14 : 18,
              boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Leads recentes</div>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>Últimos contatos</div>
                </div>
                <Link href="/leads" style={{ fontSize: 11, color: "#047857", fontWeight: 600, textDecoration: "none" }}>
                  Ver todos →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentLeads.map((l) => {
                  const meta = LEAD_STATUS_META[l.status];
                  const property = properties.find((p) => p.id === l.propertyId);
                  return (
                    <div key={l.id} style={{
                      padding: "10px 12px", borderRadius: 11,
                      background: "#f8fafc", border: "1px solid #f1f5f9",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{l.name}</div>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "1px 7px", borderRadius: 8,
                          background: meta.bg, border: `1px solid ${meta.border}`,
                          color: meta.text, fontSize: 9.5, fontWeight: 600, whiteSpace: "nowrap",
                        }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: meta.color }} /> {meta.label}
                        </span>
                      </div>
                      {property && (
                        <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          → {property.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Distribution by type + agents */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 14,
          }}>
            {/* Distribution */}
            <div style={{
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16,
              padding: isMobile ? 14 : 18,
              boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
                Carteira por tipo
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {byType.map((t) => (
                  <div key={t.type}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 3, background: TYPE_COLORS[t.type] }} />
                        <span style={{ color: "#0f172a", fontWeight: 500 }}>{PROPERTY_TYPE_LABEL[t.type as keyof typeof PROPERTY_TYPE_LABEL]}</span>
                      </span>
                      <span style={{ color: "#0f172a", fontWeight: 600 }}>
                        {t.count} <span style={{ color: "#94a3b8", fontWeight: 500 }}>· {t.pct.toFixed(0)}%</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${t.pct}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{ height: "100%", background: TYPE_COLORS[t.type], borderRadius: 4 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agents */}
            <div style={{
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16,
              padding: isMobile ? 14 : 18,
              boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
                Equipe de corretores
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {agents.map((a) => {
                  const count = properties.filter((p) => p.agentId === a.id).length;
                  const leadCount = leads.filter((l) => l.agentId === a.id).length;
                  return (
                    <div key={a.id} style={{
                      display: "flex", alignItems: "center", gap: 11,
                      padding: "10px 12px", borderRadius: 11,
                      background: "#f8fafc", border: "1px solid #f1f5f9",
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: `${a.color}15`, border: `2px solid ${a.color}55`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: a.color, flexShrink: 0,
                      }}>
                        {a.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>CRECI {a.creci}</div>
                      </div>
                      <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#64748b" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Buildings size={11} /> {count}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Users size={11} /> {leadCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint, icon: Icon, color, accent }: {
  label: string; value: number | string; hint?: string; icon: typeof House; color: string; accent?: boolean;
}) {
  return (
    <div style={{
      background: accent ? `linear-gradient(135deg, ${color}10, ${color}05)` : "#ffffff",
      border: `1px solid ${accent ? `${color}30` : "#e2e8f0"}`,
      borderRadius: 14, padding: 16,
      boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} weight="duotone" color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>{value}</div>
        {hint && <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 4, fontWeight: 500 }}>{hint}</div>}
      </div>
    </div>
  );
}
