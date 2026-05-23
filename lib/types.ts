export type PropertyType = "casa" | "apartamento" | "cobertura" | "terreno" | "comercial";

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  cobertura: "Cobertura",
  terreno: "Terreno",
  comercial: "Comercial",
};

export type ListingType = "venda" | "aluguel";

export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  venda: "Venda",
  aluguel: "Aluguel",
};

export type PropertyStatus = "ativo" | "reservado" | "vendido" | "alugado" | "pausado";

export const PROPERTY_STATUS_META: Record<PropertyStatus, { label: string; color: string; bg: string; border: string; text: string }> = {
  ativo:     { label: "Ativo",     color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", text: "#047857" },
  reservado: { label: "Reservado", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  vendido:   { label: "Vendido",   color: "#003DA5", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  alugado:   { label: "Alugado",   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6" },
  pausado:   { label: "Pausado",   color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1", text: "#475569" },
};

export interface Address {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  condoFee: number;
  iptu: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  address: Address;
  description: string;
  features: string[];
  images: string[];
  agentId: string;
  views: number;
  featured: boolean;
  createdAt: number;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  creci: string;
  color: string;
  avatar?: string;
}

export type LeadStatus = "novo" | "contatado" | "visitando" | "negociando" | "fechado" | "perdido";

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; color: string; bg: string; border: string; text: string }> = {
  novo:       { label: "Novo",       color: "#e11d48", bg: "#fff1f2", border: "#fecdd3", text: "#be123c" },
  contatado:  { label: "Contatado",  color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  visitando:  { label: "Visitando",  color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6" },
  negociando: { label: "Negociando", color: "#003DA5", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  fechado:    { label: "Fechado",    color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", text: "#047857" },
  perdido:    { label: "Perdido",    color: "#64748b", bg: "#f1f5f9", border: "#cbd5e1", text: "#475569" },
};

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId?: string;
  message: string;
  status: LeadStatus;
  agentId?: string;
  createdAt: number;
}
