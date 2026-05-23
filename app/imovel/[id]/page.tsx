"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bed, Bathtub, Car, Ruler, MapPin, Eye, Heart, ShareNetwork, CheckCircle,
  WhatsappLogo, Phone, Envelope, Buildings, Receipt, House,
} from "@phosphor-icons/react";
import { Nav } from "@/components/Nav";
import { LeadFormModal } from "@/components/LeadFormModal";
import { useDomus } from "@/hooks/useDomus";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LISTING_TYPE_LABEL, PROPERTY_STATUS_META, PROPERTY_TYPE_LABEL } from "@/lib/types";

function fmtBRL(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }

export default function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { properties, agents, incrementViews, loaded } = useDomus();
  const isMobile = useIsMobile();
  const [activeImg, setActiveImg] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const property = properties.find((p) => p.id === id);
  const agent = property ? agents.find((a) => a.id === property.agentId) : undefined;

  useEffect(() => {
    if (property) incrementViews(property.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!loaded) return <div className="bg-domus" style={{ height: "100vh" }} />;
  if (!property) {
    return (
      <div className="bg-domus" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Nav />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          Imóvel não encontrado
        </div>
      </div>
    );
  }

  const status = PROPERTY_STATUS_META[property.status];
  const isAluguel = property.listingType === "aluguel";

  function waLink(text: string) {
    const phone = agent?.phone.replace(/\D/g, "") ?? "";
    return `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
  }

  return (
    <div className="bg-domus" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Nav />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "12px 14px 24px" : "20px 24px 32px" }}>
          {/* Back */}
          <button onClick={() => router.push("/")} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 0", marginBottom: 14,
            background: "transparent", border: "none",
            color: "#64748b", fontSize: 12.5, cursor: "pointer",
          }}>
            <ArrowLeft size={13} /> Voltar para galeria
          </button>

          {/* Image gallery */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 2fr) minmax(0, 1fr)",
            gridTemplateRows: isMobile ? "auto" : "auto auto",
            gap: 8, marginBottom: 18,
            borderRadius: 18, overflow: "hidden",
            boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
          }}>
            {/* Main */}
            <div style={{
              gridRow: isMobile ? "auto" : "1 / 3",
              position: "relative", paddingBottom: isMobile ? "62%" : 0,
              height: isMobile ? "auto" : 520,
              background: "#0f172a", overflow: "hidden",
            }}>
              <motion.img
                key={activeImg}
                src={property.images[activeImg]}
                alt={property.title}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ position: isMobile ? "absolute" : "static", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Top badges over image */}
              <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
                <span style={{
                  padding: "5px 12px", borderRadius: 20,
                  background: isAluguel ? "#d97706" : "#047857",
                  color: "#ffffff", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  {LISTING_TYPE_LABEL[property.listingType]}
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 10px", borderRadius: 20,
                  background: status.bg, border: `1px solid ${status.border}`,
                  color: status.text, fontSize: 11, fontWeight: 600,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.color }} /> {status.label}
                </span>
              </div>
              {/* Actions */}
              <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 6 }}>
                <button onClick={() => setFavorited(!favorited)} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: favorited ? "#047857" : "rgba(255,255,255,0.95)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                }}>
                  <Heart size={15} weight={favorited ? "fill" : "regular"} color={favorited ? "#ffffff" : "#047857"} />
                </button>
                <button title="Compartilhar" style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                }}>
                  <ShareNetwork size={15} color="#475569" />
                </button>
              </div>
              {/* Image counter */}
              <div style={{
                position: "absolute", bottom: 14, right: 14,
                padding: "4px 10px", borderRadius: 8,
                background: "rgba(15,23,42,0.7)",
                color: "#ffffff", fontSize: 10.5, fontWeight: 600,
                backdropFilter: "blur(6px)",
              }}>
                {activeImg + 1} / {property.images.length}
              </div>
            </div>

            {/* Side thumbnails on desktop, scroll-snap row on mobile */}
            {isMobile ? (
              <div className="snap-x-imgs" style={{
                display: "flex", gap: 6, padding: "0 0 2px",
                overflowX: "auto",
              }}>
                {property.images.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    flex: "0 0 auto", width: 90, height: 64, borderRadius: 8,
                    overflow: "hidden", border: i === activeImg ? "2px solid #047857" : "2px solid transparent",
                    cursor: "pointer", padding: 0, background: "#f1f5f9",
                  }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            ) : (
              property.images.slice(1, 5).map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i + 1)} style={{
                  position: "relative", height: 256, padding: 0,
                  background: "#0f172a", overflow: "hidden", border: "none", cursor: "pointer",
                }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: activeImg === i + 1 ? 1 : 0.78, transition: "opacity 0.15s" }} />
                  {i + 1 === 4 && property.images.length > 5 && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(15,23,42,0.6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#ffffff", fontSize: 16, fontWeight: 700,
                      backdropFilter: "blur(2px)",
                    }}>
                      +{property.images.length - 5}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Content grid: main + agent sidebar */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 2fr) minmax(0, 1fr)",
            gap: 18,
          }}>
            {/* Main column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Title + price */}
              <div style={{
                background: "#ffffff", border: "1px solid #e2e8f0",
                borderRadius: 16, padding: isMobile ? 16 : 22,
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", fontWeight: 600 }}>
                    {PROPERTY_TYPE_LABEL[property.type]}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                    <Eye size={11} /> {property.views} visualizações
                  </span>
                </div>
                <h1 style={{ fontSize: isMobile ? 19 : 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 6 }}>
                  {property.title}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#475569", marginBottom: 14 }}>
                  <MapPin size={13} weight="fill" color="#047857" />
                  <span>{property.address.street} · {property.address.neighborhood}, {property.address.city} · {property.address.state}</span>
                </div>

                <div style={{
                  padding: 14, borderRadius: 12,
                  background: "linear-gradient(135deg, #ecfdf5, #ffffff)",
                  border: "1px solid #a7f3d0",
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                      {fmtBRL(property.price)}
                    </div>
                    {isAluguel && <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>/mês</span>}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11.5, color: "#64748b", flexWrap: "wrap" }}>
                    {property.condoFee > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Buildings size={12} /> Condomínio {fmtBRL(property.condoFee)}
                      </span>
                    )}
                    {property.iptu > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Receipt size={12} /> IPTU {fmtBRL(property.iptu)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs */}
                <div style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                  gap: 8,
                }}>
                  {property.bedrooms > 0 && <SpecBox icon={Bed} label="Quartos" value={property.bedrooms} />}
                  {property.bathrooms > 0 && <SpecBox icon={Bathtub} label="Banheiros" value={property.bathrooms} />}
                  {property.parkingSpots > 0 && <SpecBox icon={Car} label="Vagas" value={property.parkingSpots} />}
                  <SpecBox icon={Ruler} label="Área útil" value={`${property.area} m²`} />
                </div>
              </div>

              {/* Description */}
              <div style={{
                background: "#ffffff", border: "1px solid #e2e8f0",
                borderRadius: 16, padding: isMobile ? 16 : 22,
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              }}>
                <h2 style={sectionH}>Sobre este imóvel</h2>
                <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.7 }}>
                  {property.description}
                </p>
              </div>

              {/* Features */}
              {property.features.length > 0 && (
                <div style={{
                  background: "#ffffff", border: "1px solid #e2e8f0",
                  borderRadius: 16, padding: isMobile ? 16 : 22,
                  boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
                }}>
                  <h2 style={sectionH}>Características e diferenciais</h2>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
                    gap: 8,
                  }}>
                    {property.features.map((f) => (
                      <div key={f} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: 9,
                        background: "#f8fafc",
                        fontSize: 12.5, color: "#0f172a",
                      }}>
                        <CheckCircle size={14} weight="duotone" color="#10b981" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address detail */}
              <div style={{
                background: "#ffffff", border: "1px solid #e2e8f0",
                borderRadius: 16, padding: isMobile ? 16 : 22,
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              }}>
                <h2 style={sectionH}>Localização</h2>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "#ecfdf5", border: "1px solid #a7f3d0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <MapPin size={16} weight="fill" color="#047857" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>
                      {property.address.street}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {property.address.neighborhood} · {property.address.city} · {property.address.state} · CEP {property.address.zip}
                    </div>
                  </div>
                </div>
                <div style={{
                  height: 180, borderRadius: 12,
                  background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #fde68a 100%)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }} />
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "#047857",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 8px 20px rgba(4,120,87,0.45)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}>
                      <MapPin size={22} weight="fill" color="#ffffff" />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", background: "rgba(255,255,255,0.9)", padding: "3px 10px", borderRadius: 12 }}>
                      Mapa interativo · demo
                    </span>
                  </div>
                  <style>{`@keyframes pulse { 0%, 100% { transform: translate(-50%,-50%) scale(1) } 50% { transform: translate(-50%,-50%) scale(1.08) } }`}</style>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, position: isMobile ? "relative" : "sticky", top: 0, alignSelf: "start" }}>
              {/* Agent card */}
              {agent && (
                <div style={{
                  background: "#ffffff", border: "1px solid #e2e8f0",
                  borderRadius: 16, padding: 18,
                  boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: `${agent.color}15`,
                      border: `2px solid ${agent.color}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 700, color: agent.color,
                    }}>
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>CRECI {agent.creci}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button onClick={() => setShowLead(true)} style={btnPrimary}>
                      <Envelope size={13} weight="bold" /> Tenho interesse
                    </button>
                    <a href={waLink(`Olá ${agent.name.split(" ")[0]}! Tenho interesse no imóvel "${property.title}" (Domus). Pode me passar mais informações?`)} target="_blank" rel="noreferrer" style={btnWhats}>
                      <WhatsappLogo size={14} weight="duotone" /> WhatsApp
                    </a>
                    <a href={`tel:${agent.phone.replace(/\D/g, "")}`} style={btnGhost}>
                      <Phone size={13} /> {agent.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Quick info */}
              <div style={{
                background: "linear-gradient(135deg, #d97706, #b45309)",
                border: "1px solid #d97706",
                borderRadius: 16, padding: 18,
                color: "#ffffff",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                  Resumo financeiro
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6, color: "rgba(255,255,255,0.85)" }}>
                  <span>{isAluguel ? "Aluguel" : "Valor"}</span>
                  <span style={{ fontWeight: 600, color: "#ffffff" }}>{fmtBRL(property.price)}</span>
                </div>
                {property.condoFee > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6, color: "rgba(255,255,255,0.85)" }}>
                    <span>Condomínio</span>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{fmtBRL(property.condoFee)}</span>
                  </div>
                )}
                {property.iptu > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 10, color: "rgba(255,255,255,0.85)" }}>
                    <span>IPTU mensal</span>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{fmtBRL(property.iptu)}</span>
                  </div>
                )}
                <div style={{ height: 1, background: "rgba(255,255,255,0.2)", marginBottom: 10 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                  <span>Total mensal</span>
                  <span>{fmtBRL((isAluguel ? property.price : 0) + property.condoFee + property.iptu)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LeadFormModal open={showLead} property={property} onClose={() => setShowLead(false)} />
    </div>
  );
}

function SpecBox({ icon: Icon, label, value }: { icon: typeof Bed; label: string; value: string | number }) {
  return (
    <div style={{
      padding: "11px 12px", borderRadius: 11,
      background: "#f8fafc", border: "1px solid #f1f5f9",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
        <Icon size={11} weight="duotone" color="#047857" /> {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

const sectionH: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: "#0f172a",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12,
};

const btnPrimary: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  padding: "11px 16px", borderRadius: 10,
  background: "linear-gradient(135deg, #059669, #047857)",
  color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer",
  border: "1px solid #047857",
  boxShadow: "0 6px 16px rgba(4,120,87,0.25)",
  width: "100%",
};

const btnWhats: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  padding: "11px 16px", borderRadius: 10,
  background: "#16a34a",
  color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer",
  border: "1px solid #15803d",
  boxShadow: "0 6px 16px rgba(22,163,74,0.2)",
  textDecoration: "none", width: "100%",
};

const btnGhost: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  padding: "10px 14px", borderRadius: 10,
  background: "#ffffff", color: "#475569",
  fontSize: 12, fontWeight: 500, cursor: "pointer",
  border: "1px solid #e2e8f0",
  textDecoration: "none", width: "100%",
};
