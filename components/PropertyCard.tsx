"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bed, Bathtub, Car, Ruler, MapPin, Heart } from "@phosphor-icons/react";
import { Property, PROPERTY_TYPE_LABEL, LISTING_TYPE_LABEL } from "@/lib/types";

function fmtBRL(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }

export function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }) {
  const router = useRouter();
  const isAluguel = property.listingType === "aluguel";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.14 }}
      onClick={() => router.push(`/imovel/${property.id}`)}
      style={{
        cursor: "pointer", overflow: "hidden",
        background: "#ffffff", border: "1px solid #e2e8f0",
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "62%", overflow: "hidden", background: "#f1f5f9" }}>
        {property.images[0] && (
          <img src={property.images[0]} alt={property.title} style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", transition: "transform 0.4s ease",
          }} loading="lazy" />
        )}
        {/* Top badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          <span style={{
            padding: "4px 10px", borderRadius: 20,
            background: isAluguel ? "#d97706" : "#047857",
            color: "#ffffff", fontSize: 10.5, fontWeight: 700,
            letterSpacing: "0.04em", textTransform: "uppercase",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
          }}>
            {LISTING_TYPE_LABEL[property.listingType]}
          </span>
          <span style={{
            padding: "4px 10px", borderRadius: 20,
            background: "rgba(255,255,255,0.95)",
            color: "#0f172a", fontSize: 10.5, fontWeight: 600,
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}>
            {PROPERTY_TYPE_LABEL[property.type]}
          </span>
        </div>
        {/* Featured */}
        {property.featured && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            padding: "4px 8px", borderRadius: 8,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 10, fontWeight: 700, color: "#047857",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}>
            <Heart size={11} weight="fill" /> Destaque
          </div>
        )}
        {/* Image count */}
        {property.images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 12, right: 12,
            padding: "3px 9px", borderRadius: 8,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(6px)",
            color: "#ffffff", fontSize: 10, fontWeight: 600,
          }}>
            {property.images.length} fotos
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: compact ? 12 : 14, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {/* Price */}
        <div>
          <div style={{ fontSize: compact ? 18 : 19, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
            {fmtBRL(property.price)}
            {isAluguel && <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>/mês</span>}
          </div>
          {(property.condoFee > 0 || property.iptu > 0) && (
            <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>
              {property.condoFee > 0 && `Cond. ${fmtBRL(property.condoFee)}`}
              {property.condoFee > 0 && property.iptu > 0 && " · "}
              {property.iptu > 0 && `IPTU ${fmtBRL(property.iptu)}`}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{
          fontSize: 13, fontWeight: 600, color: "#0f172a",
          lineHeight: 1.35,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {property.title}
        </div>

        {/* Address */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
          <MapPin size={11} weight="fill" color="#94a3b8" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {property.address.neighborhood} · {property.address.city}
          </span>
        </div>

        {/* Specs */}
        <div style={{
          display: "flex", gap: 12, marginTop: "auto",
          paddingTop: 10, borderTop: "1px solid #f1f5f9",
          fontSize: 11, color: "#475569",
        }}>
          {property.bedrooms > 0 && (
            <Spec icon={Bed} value={property.bedrooms} label="quartos" />
          )}
          {property.bathrooms > 0 && (
            <Spec icon={Bathtub} value={property.bathrooms} label="banheiros" />
          )}
          {property.parkingSpots > 0 && (
            <Spec icon={Car} value={property.parkingSpots} label="vagas" />
          )}
          <Spec icon={Ruler} value={property.area} label="m²" suffix="" />
        </div>
      </div>
    </motion.div>
  );
}

function Spec({ icon: Icon, value, label, suffix }: { icon: typeof Bed; value: number; label: string; suffix?: string }) {
  return (
    <span title={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Icon size={12} weight="duotone" color="#047857" />
      <span style={{ fontWeight: 600, color: "#0f172a" }}>{value}{suffix !== undefined ? suffix : ""}</span>
    </span>
  );
}
