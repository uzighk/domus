"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Trash, House, MapPin, CurrencyCircleDollar, Bed, Bathtub, Car, Ruler, ImageSquare, Plus } from "@phosphor-icons/react";
import { useDomus } from "@/hooks/useDomus";
import { Property, PropertyType, ListingType, PropertyStatus, PROPERTY_TYPE_LABEL, LISTING_TYPE_LABEL, PROPERTY_STATUS_META } from "@/lib/types";

interface Props {
  open: boolean;
  property: Property | null;
  onClose: () => void;
}

const TYPES: PropertyType[] = ["casa", "apartamento", "cobertura", "terreno", "comercial"];
const LISTINGS: ListingType[] = ["venda", "aluguel"];
const STATUSES: PropertyStatus[] = ["ativo", "reservado", "vendido", "alugado", "pausado"];

const EMPTY = {
  title: "", type: "apartamento" as PropertyType, listingType: "venda" as ListingType, status: "ativo" as PropertyStatus,
  price: 0, condoFee: 0, iptu: 0, area: 0, bedrooms: 0, bathrooms: 0, parkingSpots: 0,
  street: "", neighborhood: "", city: "São Paulo", state: "SP", zip: "",
  description: "", features: "", images: "", agentId: "", featured: false,
};

export function PropertyModal({ open, property, onClose }: Props) {
  const { agents, addProperty, updateProperty, deleteProperty } = useDomus();
  const editing = !!property;
  const [form, setForm] = useState(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (property) {
      setForm({
        title: property.title, type: property.type, listingType: property.listingType, status: property.status,
        price: property.price, condoFee: property.condoFee, iptu: property.iptu,
        area: property.area, bedrooms: property.bedrooms, bathrooms: property.bathrooms, parkingSpots: property.parkingSpots,
        street: property.address.street, neighborhood: property.address.neighborhood,
        city: property.address.city, state: property.address.state, zip: property.address.zip,
        description: property.description, features: property.features.join(", "),
        images: property.images.join("\n"), agentId: property.agentId, featured: property.featured,
      });
    } else {
      setForm({ ...EMPTY, agentId: agents[0]?.id ?? "" });
    }
    setConfirmDelete(false);
  }, [open, property, agents]);

  function handleSave() {
    if (!form.title.trim() || form.price <= 0) return;
    const data = {
      title: form.title.trim(), type: form.type, listingType: form.listingType, status: form.status,
      price: Number(form.price), condoFee: Number(form.condoFee) || 0, iptu: Number(form.iptu) || 0,
      area: Number(form.area) || 0, bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0, parkingSpots: Number(form.parkingSpots) || 0,
      address: { street: form.street, neighborhood: form.neighborhood, city: form.city, state: form.state, zip: form.zip },
      description: form.description, agentId: form.agentId, featured: form.featured,
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    if (editing && property) updateProperty(property.id, data);
    else addProperty(data);
    onClose();
  }

  function handleDelete() {
    if (!property) return;
    deleteProperty(property.id);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
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
              width: "min(680px, calc(100vw - 24px))",
              maxHeight: "calc(100vh - 32px)", overflowY: "auto",
              boxShadow: "0 30px 70px rgba(15,23,42,0.18)",
            }}
          >
            <div style={{ padding: "18px 22px 12px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(4,120,87,0.25)" }}>
                  <House size={15} weight="fill" color="#ffffff" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  {editing ? "Editar imóvel" : "Novo imóvel"}
                </div>
              </div>
              <button onClick={onClose} style={iconBtn}><X size={14} /></button>
            </div>

            <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>Título</label>
                <input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Apartamento moderno próximo ao metrô" style={inp} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={lbl}>Tipo</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })} style={inp}>
                    {TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Modalidade</label>
                  <select value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value as ListingType })} style={inp}>
                    {LISTINGS.map((l) => <option key={l} value={l}>{LISTING_TYPE_LABEL[l]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PropertyStatus })} style={inp}>
                    {STATUSES.map((s) => <option key={s} value={s}>{PROPERTY_STATUS_META[s].label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={lbl}><CurrencyCircleDollar size={11} /> Valores</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Preço" style={inp} />
                  <input type="number" value={form.condoFee || ""} onChange={(e) => setForm({ ...form, condoFee: Number(e.target.value) })} placeholder="Condomínio" style={inp} />
                  <input type="number" value={form.iptu || ""} onChange={(e) => setForm({ ...form, iptu: Number(e.target.value) })} placeholder="IPTU" style={inp} />
                </div>
              </div>

              <div>
                <label style={lbl}>Características</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                  <NumberInput icon={Ruler} value={form.area} onChange={(v) => setForm({ ...form, area: v })} placeholder="Área (m²)" />
                  <NumberInput icon={Bed} value={form.bedrooms} onChange={(v) => setForm({ ...form, bedrooms: v })} placeholder="Quartos" />
                  <NumberInput icon={Bathtub} value={form.bathrooms} onChange={(v) => setForm({ ...form, bathrooms: v })} placeholder="Banheiros" />
                  <NumberInput icon={Car} value={form.parkingSpots} onChange={(v) => setForm({ ...form, parkingSpots: v })} placeholder="Vagas" />
                </div>
              </div>

              <div>
                <label style={lbl}><MapPin size={11} /> Endereço</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Rua, número" style={inp} />
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 60px 100px", gap: 10 }}>
                    <input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} placeholder="Bairro" style={inp} />
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade" style={inp} />
                    <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="UF" style={inp} maxLength={2} />
                    <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="CEP" style={inp} />
                  </div>
                </div>
              </div>

              <div>
                <label style={lbl}>Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  placeholder="Descreva o imóvel: estilo, vista, diferenciais..." style={{ ...inp, resize: "none", lineHeight: 1.5 }} />
              </div>

              <div>
                <label style={lbl}>Diferenciais (separados por vírgula)</label>
                <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="Piscina, varanda gourmet, churrasqueira" style={inp} />
              </div>

              <div>
                <label style={lbl}><ImageSquare size={11} /> Fotos (uma URL por linha)</label>
                <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3}
                  placeholder="https://images.unsplash.com/..."
                  style={{ ...inp, resize: "none", lineHeight: 1.5, fontFamily: "monospace", fontSize: 11.5 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                <div>
                  <label style={lbl}>Corretor responsável</label>
                  <select value={form.agentId} onChange={(e) => setForm({ ...form, agentId: e.target.value })} style={inp}>
                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <label style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 14px", borderRadius: 9,
                  background: form.featured ? "#ecfdf5" : "#f8fafc",
                  border: `1px solid ${form.featured ? "#a7f3d0" : "#e2e8f0"}`,
                  cursor: "pointer", fontSize: 12,
                  color: form.featured ? "#047857" : "#64748b", fontWeight: form.featured ? 600 : 500,
                }}>
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} style={{ accentColor: "#047857" }} />
                  Destaque
                </label>
              </div>
            </div>

            <div style={{
              padding: "12px 22px 18px", borderTop: "1px solid #f1f5f9",
              display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center",
            }}>
              {editing ? (
                confirmDelete ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "#b91c1c" }}>
                    Excluir?
                    <button onClick={handleDelete} style={btnDangerSmall}><Check size={12} weight="bold" /></button>
                    <button onClick={() => setConfirmDelete(false)} style={iconBtnSmall}><X size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)} style={btnDanger}>
                    <Trash size={12} /> Excluir
                  </button>
                )
              ) : <div />}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onClose} style={btnSecondary}>Cancelar</button>
                <button onClick={handleSave} style={btnPrimary}>
                  <Check size={13} weight="bold" /> {editing ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NumberInput({ icon: Icon, value, onChange, placeholder }: { icon: typeof Bed; value: number; onChange: (v: number) => void; placeholder: string }) {
  return (
    <div style={{ position: "relative" }}>
      <Icon size={12} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} weight="duotone" />
      <input type="number" min={0} value={value || ""} onChange={(e) => onChange(Number(e.target.value))} placeholder={placeholder}
        style={{ ...inp, paddingLeft: 30 }} />
    </div>
  );
}

const lbl: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, color: "#0f172a", fontSize: 13 };
const btnPrimary: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 18px", borderRadius: 10,
  background: "linear-gradient(135deg, #059669, #047857)",
  color: "#ffffff", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  border: "1px solid #047857",
  boxShadow: "0 6px 16px rgba(4,120,87,0.22)",
};
const btnSecondary: React.CSSProperties = {
  background: "#ffffff", color: "#64748b", border: "1px solid #e2e8f0",
  borderRadius: 9, padding: "9px 14px", fontSize: 12.5, cursor: "pointer",
};
const btnDanger: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5,
  padding: "8px 12px", borderRadius: 9,
  background: "#fef2f2", color: "#b91c1c",
  fontSize: 11.5, fontWeight: 500, cursor: "pointer",
  border: "1px solid #fecaca",
};
const btnDangerSmall: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 7,
  background: "#dc2626", color: "#ffffff", cursor: "pointer", border: "none",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 9,
  background: "#f8fafc", border: "1px solid #e2e8f0",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#64748b", cursor: "pointer",
};
const iconBtnSmall: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 7,
  background: "#ffffff", border: "1px solid #e2e8f0",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#64748b", cursor: "pointer",
};
