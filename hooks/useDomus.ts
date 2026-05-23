"use client";

import { useState, useEffect, useCallback } from "react";
import { Agent, Lead, LeadStatus, Property } from "@/lib/types";
import { SEED_AGENTS, SEED_LEADS, SEED_PROPERTIES } from "@/lib/seed";

const K_PROPS = "domus_properties";
const K_AGENTS = "domus_agents";
const K_LEADS = "domus_leads";

function load<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
}

function save(k: string, v: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("domus:change", { detail: k }));
}

function uid() { return Math.random().toString(36).slice(2, 10); }

export function useDomus() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setProperties(load(K_PROPS, []));
    setAgents(load(K_AGENTS, []));
    setLeads(load(K_LEADS, []));
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(K_PROPS)) save(K_PROPS, SEED_PROPERTIES);
    if (!localStorage.getItem(K_AGENTS)) save(K_AGENTS, SEED_AGENTS);
    if (!localStorage.getItem(K_LEADS)) save(K_LEADS, SEED_LEADS);
    refresh();
    setLoaded(true);

    const onChange = () => refresh();
    window.addEventListener("domus:change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("domus:change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  function commitProps(next: Property[]) { save(K_PROPS, next); setProperties(next); }
  function commitLeads(next: Lead[]) { save(K_LEADS, next); setLeads(next); }
  function commitAgents(next: Agent[]) { save(K_AGENTS, next); setAgents(next); }

  function addProperty(data: Omit<Property, "id" | "createdAt" | "views">) {
    const p: Property = { ...data, id: uid(), views: 0, createdAt: Date.now() };
    commitProps([p, ...properties]);
    return p;
  }
  function updateProperty(id: string, data: Partial<Property>) {
    commitProps(properties.map((p) => p.id === id ? { ...p, ...data } : p));
  }
  function deleteProperty(id: string) {
    commitProps(properties.filter((p) => p.id !== id));
  }
  function incrementViews(id: string) {
    commitProps(properties.map((p) => p.id === id ? { ...p, views: p.views + 1 } : p));
  }

  function addLead(data: Omit<Lead, "id" | "createdAt">) {
    const l: Lead = { ...data, id: uid(), createdAt: Date.now() };
    commitLeads([l, ...leads]);
    return l;
  }
  function updateLead(id: string, data: Partial<Lead>) {
    commitLeads(leads.map((l) => l.id === id ? { ...l, ...data } : l));
  }
  function deleteLead(id: string) {
    commitLeads(leads.filter((l) => l.id !== id));
  }
  function moveLead(id: string, status: LeadStatus) {
    updateLead(id, { status });
  }

  function addAgent(data: Omit<Agent, "id">) {
    const a: Agent = { ...data, id: uid() };
    commitAgents([...agents, a]);
    return a;
  }

  function resetData() {
    commitProps(SEED_PROPERTIES);
    commitAgents(SEED_AGENTS);
    commitLeads(SEED_LEADS);
  }

  return {
    properties, agents, leads, loaded,
    addProperty, updateProperty, deleteProperty, incrementViews,
    addLead, updateLead, deleteLead, moveLead,
    addAgent,
    resetData,
  };
}
