"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, User, Phone, Envelope, ChatText, CheckCircle } from "@phosphor-icons/react";
import { useDomus } from "@/hooks/useDomus";
import { Property } from "@/lib/types";

interface Props {
  open: boolean;
  property: Property | null;
  onClose: () => void;
}

export function LeadFormModal({ open, property, onClose }: Props) {
  const { addLead } = useDomus();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!name.trim() || !phone.trim()) return;
    addLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      propertyId: property?.id,
      message: message.trim() || "Tenho interesse neste imóvel.",
      status: "novo",
      agentId: property?.agentId,
    });
    setSent(true);
    setTimeout(() => {
      setName(""); setPhone(""); setEmail(""); setMessage(""); setSent(false);
      onClose();
    }, 1800);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 18,
              width: "min(440px, calc(100vw - 24px))",
              maxHeight: "calc(100vh - 32px)", overflowY: "auto",
              boxShadow: "0 30px 70px rgba(15,23,42,0.18)",
            }}
          >
            {sent ? (
              <div style={{ padding: "40px 28px", textAlign: "center" }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 14 }}
                  style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    margin: "0 auto 16px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
                  }}>
                  <CheckCircle size={32} weight="fill" color="#ffffff" />
                </motion.div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                  Mensagem enviada!
                </div>
                <div style={{ fontSize: 12.5, color: "#64748b" }}>
                  O corretor responsável entrará em contato em breve.
                </div>
              </div>
            ) : (
              <>
                <div style={{ padding: "18px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Tenho interesse</div>
                    {property && (
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {property.title}
                      </div>
                    )}
                  </div>
                  <button onClick={onClose} style={iconBtn}><X size={14} /></button>
                </div>

                <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={lbl}><User size={11} /> Nome completo</label>
                    <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome" style={inp} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={lbl}><Phone size={11} /> Telefone</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-9999" style={inp} />
                    </div>
                    <div>
                      <label style={lbl}><Envelope size={11} /> E-mail</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com" style={inp} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}><ChatText size={11} /> Mensagem</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                      placeholder="Tenho interesse e gostaria de agendar uma visita..."
                      style={{ ...inp, resize: "none", lineHeight: 1.5 }} />
                  </div>
                </div>

                <div style={{ padding: "0 22px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button onClick={onClose} style={btnSecondary}>Cancelar</button>
                  <button onClick={handleSubmit} style={btnPrimary}>
                    <Check size={13} weight="bold" /> Enviar
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const lbl: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5,
  fontSize: 10, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6,
};
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  background: "#f8fafc", border: "1px solid #e2e8f0",
  borderRadius: 9, color: "#0f172a", fontSize: 13,
};
const btnPrimary: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "9px 18px", borderRadius: 10,
  background: "linear-gradient(135deg, #059669, #047857)",
  color: "#ffffff", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  border: "1px solid #047857",
  boxShadow: "0 6px 16px rgba(4,120,87,0.25)",
};
const btnSecondary: React.CSSProperties = {
  background: "#ffffff", color: "#64748b", border: "1px solid #e2e8f0",
  borderRadius: 9, padding: "9px 14px", fontSize: 12.5, cursor: "pointer",
};
const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 9,
  background: "#f8fafc", border: "1px solid #e2e8f0",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#64748b", cursor: "pointer",
};
