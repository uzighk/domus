"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlass, FunnelSimple, X, House, Buildings, BuildingApartment, Tree, Storefront, ArrowDownRight, ArrowUpRight, CaretDown } from "@phosphor-icons/react";
import { Nav } from "@/components/Nav";
import { PropertyCard } from "@/components/PropertyCard";
import { useDomus } from "@/hooks/useDomus";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ListingType, PropertyType, PROPERTY_TYPE_LABEL } from "@/lib/types";

const TYPE_ICON: Record<PropertyType, typeof House> = {
  casa: House, apartamento: BuildingApartment, cobertura: Buildings, terreno: Tree, comercial: Storefront,
};

const PRICE_RANGES = {
  venda: [
    { label: "Até R$ 500k",   max: 500_000 },
    { label: "R$ 500k – 1M",  min: 500_000, max: 1_000_000 },
    { label: "R$ 1M – 2M",    min: 1_000_000, max: 2_000_000 },
    { label: "R$ 2M – 5M",    min: 2_000_000, max: 5_000_000 },
    { label: "Acima de 5M",   min: 5_000_000 },
  ],
  aluguel: [
    { label: "Até R$ 3k",     max: 3000 },
    { label: "R$ 3k – 5k",    min: 3000, max: 5000 },
    { label: "R$ 5k – 10k",   min: 5000, max: 10000 },
    { label: "Acima de R$ 10k", min: 10000 },
  ],
};

export default function GaleriaPage() {
  const { properties, loaded } = useDomus();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [listing, setListing] = useState<ListingType>("venda");
  const [typeFilter, setTypeFilter] = useState<PropertyType | "">("");
  const [priceRange, setPriceRange] = useState<number>(-1);
  const [bedroomsFilter, setBedroomsFilter] = useState<number | "">("");
  const [sort, setSort] = useState<"recent" | "price_asc" | "price_desc" | "area_desc">("recent");

  const filtered = useMemo(() => {
    const ranges = PRICE_RANGES[listing];
    const range = priceRange >= 0 ? ranges[priceRange] : null;
    let arr = properties.filter((p) => {
      if (p.status !== "ativo" && p.status !== "reservado") return false;
      if (p.listingType !== listing) return false;
      if (typeFilter && p.type !== typeFilter) return false;
      if (bedroomsFilter !== "" && p.bedrooms < Number(bedroomsFilter)) return false;
      if (range) {
        if (range.min && p.price < range.min) return false;
        if (range.max && p.price > range.max) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        const hay = `${p.title} ${p.address.neighborhood} ${p.address.city} ${p.description}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
    if (sort === "price_asc") arr = [...arr].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") arr = [...arr].sort((a, b) => b.price - a.price);
    else if (sort === "area_desc") arr = [...arr].sort((a, b) => b.area - a.area);
    else arr = [...arr].sort((a, b) => b.createdAt - a.createdAt);
    return arr;
  }, [properties, listing, typeFilter, priceRange, bedroomsFilter, sort, search]);

  const featured = useMemo(() => properties.filter((p) => p.featured && p.status === "ativo").slice(0, 3), [properties]);

  if (!loaded) {
    return (
      <div className="bg-domus" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 26, height: 26, border: "2px solid #e2e8f0", borderTopColor: "#047857", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const hasFilters = !!(typeFilter || priceRange >= 0 || bedroomsFilter !== "" || search);

  return (
    <div className="bg-domus" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Nav />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Hero */}
        <div style={{
          padding: isMobile ? "24px 14px 18px" : "36px 24px 28px",
          background: "linear-gradient(135deg, #047857 0%, #065f46 60%, #d97706 100%)",
          color: "#ffffff",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 6 }}>
              Encontre o seu próximo lar
            </h1>
            <p style={{ fontSize: isMobile ? 13 : 15, color: "rgba(255,255,255,0.85)", marginBottom: isMobile ? 16 : 22 }}>
              {properties.filter((p) => p.status === "ativo" || p.status === "reservado").length} imóveis disponíveis · Curadoria Domus
            </p>

            {/* Toggle Venda/Aluguel */}
            <div style={{
              display: "inline-flex", padding: 4, borderRadius: 12,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <button onClick={() => { setListing("venda"); setPriceRange(-1); }} style={{
                padding: "8px 18px", borderRadius: 9,
                background: listing === "venda" ? "#ffffff" : "transparent",
                color: listing === "venda" ? "#047857" : "rgba(255,255,255,0.85)",
                border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <ArrowDownRight size={13} weight="bold" /> Comprar
              </button>
              <button onClick={() => { setListing("aluguel"); setPriceRange(-1); }} style={{
                padding: "8px 18px", borderRadius: 9,
                background: listing === "aluguel" ? "#ffffff" : "transparent",
                color: listing === "aluguel" ? "#b45309" : "rgba(255,255,255,0.85)",
                border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <ArrowUpRight size={13} weight="bold" /> Alugar
              </button>
            </div>

            {/* Search bar */}
            <div style={{ marginTop: 16, position: "relative", maxWidth: 720 }}>
              <MagnifyingGlass size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por bairro, cidade, características..."
                style={{
                  width: "100%", padding: "13px 16px 13px 44px",
                  background: "#ffffff", border: "none", borderRadius: 12,
                  color: "#0f172a", fontSize: 14,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "18px 14px 28px" : "24px 24px 32px" }}>
          {/* Filtros */}
          <div style={{
            display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
            marginBottom: 18, padding: isMobile ? 12 : 14, borderRadius: 14,
            background: "#ffffff", border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
          }}>
            <FunnelSimple size={14} weight="duotone" color="#64748b" />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Filtros</span>

            {/* Tipo chips */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[]).map((t) => {
                const active = typeFilter === t;
                const Icon = TYPE_ICON[t];
                return (
                  <button key={t} onClick={() => setTypeFilter(active ? "" : t)} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 11px", borderRadius: 18,
                    background: active ? "#ecfdf5" : "#f8fafc",
                    border: `1px solid ${active ? "#a7f3d0" : "#e2e8f0"}`,
                    color: active ? "#047857" : "#475569",
                    fontSize: 11, fontWeight: active ? 600 : 500, cursor: "pointer",
                  }}>
                    <Icon size={11} weight={active ? "duotone" : "regular"} />
                    {PROPERTY_TYPE_LABEL[t]}
                  </button>
                );
              })}
            </div>

            <SimpleSelect value={String(priceRange)} onChange={(v) => setPriceRange(Number(v))} options={[
              { value: "-1", label: "Qualquer preço" },
              ...PRICE_RANGES[listing].map((r, i) => ({ value: String(i), label: r.label })),
            ]} />

            <SimpleSelect value={String(bedroomsFilter)} onChange={(v) => setBedroomsFilter(v === "" ? "" : Number(v))} options={[
              { value: "", label: "Qualquer nº de quartos" },
              { value: "1", label: "1+ quarto" },
              { value: "2", label: "2+ quartos" },
              { value: "3", label: "3+ quartos" },
              { value: "4", label: "4+ quartos" },
            ]} />

            <SimpleSelect value={sort} onChange={(v) => setSort(v as typeof sort)} options={[
              { value: "recent", label: "Mais recentes" },
              { value: "price_asc", label: "Menor preço" },
              { value: "price_desc", label: "Maior preço" },
              { value: "area_desc", label: "Maior área" },
            ]} />

            {hasFilters && (
              <button onClick={() => { setTypeFilter(""); setPriceRange(-1); setBedroomsFilter(""); setSearch(""); }} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 10px", borderRadius: 18,
                background: "#ecfdf5", border: "1px solid #a7f3d0",
                color: "#047857", fontSize: 10.5, fontWeight: 600, cursor: "pointer",
              }}>
                <X size={11} /> Limpar
              </button>
            )}

            <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
              {filtered.length} imóve{filtered.length !== 1 ? "is" : "l"}
            </span>
          </div>

          {/* Featured section (sem filtros aplicados) */}
          {!hasFilters && featured.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 18, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #047857, #d97706)" }} />
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Destaques
                </h2>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 14,
              }}>
                {featured.map((p) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <PropertyCard property={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Grid principal */}
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {hasFilters ? "Resultados" : "Todos os imóveis"}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              border: "1px dashed #e2e8f0", borderRadius: 14,
              background: "#ffffff", color: "#94a3b8", fontSize: 13,
            }}>
              <House size={32} weight="duotone" color="#cbd5e1" />
              <div style={{ marginTop: 12 }}>Nenhum imóvel encontrado com esses filtros</div>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 14,
            }}>
              {filtered.map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                  <PropertyCard property={p} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SimpleSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const isDefault = value === "" || value === "-1" || value === "recent";
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        padding: "5px 26px 5px 11px", borderRadius: 18,
        background: isDefault ? "#f8fafc" : "#ecfdf5",
        border: `1px solid ${isDefault ? "#e2e8f0" : "#a7f3d0"}`,
        color: isDefault ? "#475569" : "#047857",
        fontSize: 11, fontWeight: isDefault ? 500 : 600,
        cursor: "pointer", appearance: "none", outline: "none",
      }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <CaretDown size={9} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: isDefault ? "#94a3b8" : "#047857" }} />
    </div>
  );
}
