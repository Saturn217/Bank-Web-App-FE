import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { getTokenData } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";

/* ─── Styles ──────────────────────────────────────────────────── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #1b3a6b; --navy-dark: #122850; --blue: #2563eb;
    --green: #16a34a; --red: #ef4444; --amber: #d97706;
    --text: #1e293b; --muted: #64748b; --border: #e2e8f0;
    --bg: #f1f5f9; --white: #ffffff; --sidebar-w: 240px;
  }
  body { font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--bg); overflow-x: hidden; }

  .dash-layout { display: flex; min-height: 100vh; overflow-x: hidden; }
  .dash-main   { flex: 1; margin-left: var(--sidebar-w); display: flex; flex-direction: column; min-width: 0; transition: margin-left .3s; }
  .dash-content { padding: 28px 32px 56px; flex: 1; }

  /* ── shared sidebar/topbar ── */
  .bos-sidebar { width: var(--sidebar-w); background: var(--navy); position: fixed; top:0; left:0; bottom:0; display:flex; flex-direction:column; z-index:300; transition:transform .3s cubic-bezier(.4,0,.2,1); overflow-y:auto; }
  .bos-sidebar.mobile-open { transform:translateX(0)!important; box-shadow:4px 0 24px rgba(0,0,0,.3); }
  .sidebar-logo { display:flex; align-items:center; gap:10px; padding:22px 20px 18px; border-bottom:1px solid rgba(255,255,255,.1); flex-shrink:0; }
  .sidebar-logo-text { font-family:'Playfair Display',serif; font-size:.92rem; color:white; line-height:1.2; font-weight:700; }
  .sidebar-nav { flex:1; padding:14px 12px; display:flex; flex-direction:column; gap:3px; overflow-y:auto; }
  .sidebar-item { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:9px; border:none; background:transparent; color:rgba(255,255,255,.6); font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:500; cursor:pointer; transition:all .18s; text-align:left; width:100%; text-decoration:none; }
  .sidebar-item:hover { background:rgba(255,255,255,.08); color:rgba(255,255,255,.9); }
  .sidebar-item.active { background:rgba(255,255,255,.14); color:white; font-weight:600; }
  .sidebar-item-icon { display:flex; align-items:center; flex-shrink:0; }
  .sidebar-user-footer { position:relative; border-top:1px solid rgba(255,255,255,.1); padding:10px 12px; flex-shrink:0; }
  .sidebar-user-pill { display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px; border-radius:10px; border:none; background:rgba(255,255,255,.06); cursor:pointer; transition:background .18s; text-align:left; }
  .sidebar-user-pill:hover { background:rgba(255,255,255,.12); }
  .sidebar-user-avatar { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.18); border:1.5px solid rgba(255,255,255,.25); color:white; font-size:.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sidebar-user-info { display:flex; flex-direction:column; min-width:0; flex:1; }
  .sidebar-user-name { color:white; font-size:.85rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sidebar-user-role { color:rgba(255,255,255,.4); font-size:.68rem; margin-top:1px; }
  .sidebar-dropdown { position:absolute; bottom:calc(100% - 10px); left:12px; right:12px; background:#1e2d50; border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:8px; box-shadow:0 -8px 28px rgba(0,0,0,.35); z-index:400; animation:dropUp .15s ease; }
  @keyframes dropUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .sidebar-drop-header { display:flex; align-items:center; gap:10px; padding:8px 10px 10px; }
  .sidebar-drop-avatar { width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.15); color:white; font-size:.8rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sidebar-drop-name { font-size:.85rem; font-weight:700; color:white; }
  .sidebar-drop-role { font-size:.7rem; color:rgba(255,255,255,.45); margin-top:1px; }
  .sidebar-drop-divider { height:1px; background:rgba(255,255,255,.1); margin:4px 0; }
  .sidebar-drop-item { display:flex; align-items:center; gap:10px; width:100%; padding:9px 12px; border-radius:8px; border:none; background:none; font-family:'DM Sans',sans-serif; font-size:.84rem; font-weight:500; color:rgba(255,255,255,.75); cursor:pointer; transition:background .15s; text-align:left; }
  .sidebar-drop-item:hover { background:rgba(255,255,255,.08); color:white; }
  .sidebar-drop-logout { color:#f87171; }
  .sidebar-drop-logout:hover { background:rgba(239,68,68,.12)!important; color:#fca5a5; }
  .sidebar-overlay-bg { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:250; }
  .bos-topbar { height:68px; background:var(--white); border-bottom:1px solid var(--border); padding:0 32px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow:0 1px 8px rgba(0,0,0,.05); flex-shrink:0; }
  .topbar-left { display:flex; align-items:center; gap:14px; min-width:0; }
  .topbar-hamburger { display:none; background:none; border:none; color:var(--navy); cursor:pointer; padding:4px; border-radius:6px; flex-shrink:0; }
  .topbar-hamburger:hover { background:var(--bg); }
  .topbar-greeting { min-width:0; }
  .topbar-welcome { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--navy); font-weight:700; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .topbar-date { font-size:.78rem; color:var(--muted); margin-top:1px; white-space:nowrap; }
  .topbar-right { display:flex; align-items:center; gap:12px; flex-shrink:0; }
  .topbar-bell { position:relative; background:var(--bg); border:1px solid var(--border); border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:all .18s; flex-shrink:0; }
  .topbar-bell:hover { border-color:var(--navy); color:var(--navy); }
  .bell-badge { position:absolute; top:-3px; right:-3px; background:var(--red); color:white; font-size:.58rem; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; }
  .topbar-user { display:flex; align-items:center; gap:8px; cursor:pointer; padding:5px 10px 5px 5px; border-radius:30px; border:1px solid var(--border); background:var(--bg); transition:all .18s; flex-shrink:0; }
  .topbar-user:hover { border-color:var(--navy); }
  .topbar-avatar { width:30px; height:30px; border-radius:50%; background:var(--navy); color:white; font-size:.72rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .topbar-name { font-size:.85rem; font-weight:600; color:var(--text); }
  .topbar-dropdown { position:absolute; top:calc(100% + 8px); right:32px; background:white; border:1px solid var(--border); border-radius:12px; padding:8px; box-shadow:0 8px 24px rgba(0,0,0,.1); z-index:200; min-width:180px; animation:dropDownIn .15s ease; }
  @keyframes dropDownIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .topbar-drop-item { display:flex; align-items:center; gap:10px; width:100%; padding:9px 12px; border-radius:8px; border:none; background:none; font-family:'DM Sans',sans-serif; font-size:.84rem; font-weight:500; color:var(--text); cursor:pointer; transition:background .15s; text-align:left; }
  .topbar-drop-item:hover { background:var(--bg); }
  .topbar-drop-logout { color:var(--red); }
  .topbar-drop-logout:hover { background:#fef2f2; }
  .topbar-drop-divider { height:1px; background:var(--border); margin:4px 0; }
  .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ══════════════════════════
     BILLS PAGE
  ══════════════════════════ */
  .bills-page { max-width: 680px; margin: 0 auto; }
  .bills-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 700; color: var(--navy); margin-bottom: 6px;
  }
  .bills-page-sub { font-size: .85rem; color: var(--muted); margin-bottom: 24px; }

  /* Balance pill */
  .bills-balance-pill {
    display: inline-flex; align-items: center; gap: 16px;
    background: var(--navy);
    color: white; padding: 12px 20px; border-radius: 16px;
    font-size: .82rem; font-weight: 500;
    margin-bottom: 28px;
    box-shadow: 0 4px 16px rgba(27,58,107,.3);
    width: 100%;
  }
  .bbp-icon { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.12); flex-shrink:0; }
  .bbp-info { display:flex; flex-direction:column; gap:2px; flex:1; min-width:0; }
  .bbp-name { font-size:.82rem; font-weight:600; opacity:.85; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bbp-acct { font-size:.72rem; opacity:.6; letter-spacing:.04em; }
  .bbp-divider { width:1px; height:32px; background:rgba(255,255,255,.18); flex-shrink:0; }
  .bbp-bal { display:flex; flex-direction:column; gap:2px; flex-shrink:0; }
  .bbp-bal-label { font-size:.68rem; opacity:.6; text-transform:uppercase; letter-spacing:.06em; }
  .bbp-bal-value { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; }

  /* ── Step indicator ── */
  .bills-steps {
    display: flex; align-items: center; gap: 0;
    margin-bottom: 28px;
  }
  .bills-step {
    display: flex; align-items: center; gap: 8px;
    flex: 1;
  }
  .bills-step-num {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: .75rem; font-weight: 700; flex-shrink: 0;
    border: 2px solid var(--border);
    background: var(--white); color: var(--muted);
    transition: all .2s;
  }
  .bills-step-num.done  { background: var(--green); border-color: var(--green); color: white; }
  .bills-step-num.active { background: var(--navy); border-color: var(--navy); color: white; }
  .bills-step-label { font-size: .78rem; font-weight: 600; color: var(--muted); white-space: nowrap; }
  .bills-step-label.active { color: var(--navy); }
  .bills-step-label.done   { color: var(--green); }
  .bills-step-line {
    flex: 1; height: 2px; background: var(--border); margin: 0 8px;
    transition: background .2s;
  }
  .bills-step-line.done { background: var(--green); }

  /* ── Category grid ── */
  .bills-section-label {
    font-size: .75rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--navy); margin-bottom: 14px;
  }
  .bills-category-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 28px;
  }
  .bill-cat-card {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 20px 12px 16px;
    border: 2px solid var(--border); border-radius: 14px;
    background: var(--white); cursor: pointer;
    transition: all .22s cubic-bezier(.34,1.56,.64,1);
    position: relative; overflow: hidden;
  }
  .bill-cat-card:hover { border-color: var(--cat-color); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  .bill-cat-card.selected { border-color: var(--cat-color); background: var(--cat-bg); box-shadow: 0 6px 20px rgba(0,0,0,.1); transform: translateY(-2px); }
  .bill-cat-check {
    position: absolute; top: 8px; right: 8px;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--cat-color); color: white;
    font-size: .65rem; display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .15s; font-weight: 700;
  }
  .bill-cat-card.selected .bill-cat-check { opacity: 1; }
  .bill-cat-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: var(--cat-bg); transition: background .2s;
    font-size: 1.5rem;
  }
  .bill-cat-card.selected .bill-cat-icon { background: rgba(255,255,255,.7); }
  .bill-cat-name { font-size: .8rem; font-weight: 700; color: var(--navy); text-align: center; line-height: 1.2; }

  /* ── Provider grid ── */
  .bills-provider-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 10px; margin-bottom: 24px;
  }
  .bill-provider-card {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 14px;
    border: 2px solid var(--border); border-radius: 12px;
    background: var(--white); cursor: pointer;
    transition: all .18s;
  }
  .bill-provider-card:hover  { border-color: var(--navy); background: #f8fafc; }
  .bill-provider-card.selected { border-color: var(--navy); background: #eff6ff; }
  .bill-provider-logo {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
    background: var(--bg);
  }
  .bill-provider-name { font-size: .82rem; font-weight: 700; color: var(--navy); line-height: 1.2; }
  .bill-provider-sub  { font-size: .7rem; color: var(--muted); margin-top: 1px; }
  .bill-provider-radio {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid var(--border); margin-left: auto;
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all .15s;
  }
  .bill-provider-card.selected .bill-provider-radio {
    border-color: var(--navy); background: var(--navy);
    box-shadow: inset 0 0 0 3px white;
  }

  /* ── Form card ── */
  .bill-form-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 18px; padding: 28px;
    box-shadow: 0 4px 20px rgba(0,0,0,.05);
    margin-bottom: 0;
  }

  .bpf-group { margin-bottom: 20px; }
  .bpf-label {
    display: block; font-size: .8rem; font-weight: 700;
    color: var(--navy); text-transform: uppercase;
    letter-spacing: .06em; margin-bottom: 7px;
  }
  .bpf-input-wrap { position: relative; }
  .bpf-input {
    width: 100%; padding: 13px 16px; border: 1.5px solid var(--border);
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: .95rem; color: var(--text); background: #f8fafc;
    transition: border-color .2s, box-shadow .2s; outline: none;
  }
  .bpf-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.1); background: white; }
  .bpf-input.error   { border-color: var(--red)   !important; box-shadow: 0 0 0 3px rgba(239,68,68,.1)  !important; }
  .bpf-input.success { border-color: var(--green)  !important; box-shadow: 0 0 0 3px rgba(22,163,74,.1)  !important; }
  .bpf-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 1rem; font-weight: 700; color: var(--muted); pointer-events: none; }
  .bpf-input.has-prefix { padding-left: 32px; }
  .bpf-hint      { font-size: .78rem; color: var(--muted); margin-top: 5px; }
  .bpf-error-msg { font-size: .8rem;  color: var(--red);   margin-top: 5px; font-weight: 500; }

  /* Quick amounts */
  .bpf-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .bpf-chip {
    padding: 6px 14px; border: 1.5px solid var(--border);
    border-radius: 20px; background: #f8fafc;
    font-family: 'DM Sans', sans-serif; font-size: .8rem;
    font-weight: 600; color: var(--muted); cursor: pointer;
    transition: all .15s;
  }
  .bpf-chip:hover    { border-color: var(--navy); color: var(--navy); background: #eff6ff; }
  .bpf-chip.selected { border-color: var(--navy); color: white; background: var(--navy); }

  /* Summary box (inside form) */
  .bpf-summary {
    background: #f8fafc; border: 1px solid var(--border);
    border-radius: 12px; padding: 16px;
    margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;
  }
  .bpf-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: .84rem; }
  .bpf-summary-lbl { color: var(--muted); }
  .bpf-summary-val { font-weight: 700; color: var(--text); }
  .bpf-summary-val.navy  { color: var(--navy); }
  .bpf-summary-val.amber { color: var(--amber); font-family: 'Playfair Display', serif; font-size: .95rem; }

  /* Submit */
  .bill-submit-btn {
    width: 100%; padding: 15px;
    background: var(--navy);
    color: white; border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: opacity .2s, transform .18s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 16px rgba(27,58,107,.3);
  }
  .bill-submit-btn:hover:not(:disabled)  { opacity: .9; transform: translateY(-2px); }
  .bill-submit-btn:active:not(:disabled) { transform: scale(.98); }
  .bill-submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  /* ── Confirmation modal ── */
  .bpf-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.5);
    backdrop-filter: blur(4px); z-index: 9999;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: bpfFadeIn .2s ease;
  }
  @keyframes bpfFadeIn { from{opacity:0} to{opacity:1} }
  .bpf-modal {
    background: white; border-radius: 20px; width: 100%; max-width: 420px;
    box-shadow: 0 24px 72px rgba(0,0,0,.22); overflow: hidden;
    animation: bpfSlideUp .25s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes bpfSlideUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .bpf-modal-header {
    background: var(--navy);
    padding: 28px; text-align: center; color: white;
  }
  .bpf-modal-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(255,255,255,.15); display: flex;
    align-items: center; justify-content: center;
    margin: 0 auto 12px; font-size: 1.8rem;
  }
  .bpf-modal-title    { font-family:'Playfair Display',serif; font-size: 1.3rem; font-weight: 700; }
  .bpf-modal-subtitle { font-size: .85rem; opacity: .7; margin-top: 4px; }
  .bpf-modal-body { padding: 24px 28px 8px; }
  .bpf-modal-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 11px 0; border-bottom: 1px solid #f1f5f9; gap: 12px;
  }
  .bpf-modal-row:last-of-type { border-bottom: none; }
  .bpf-modal-lbl { font-size: .82rem; color: var(--muted); }
  .bpf-modal-val { font-size: .9rem; font-weight: 700; color: var(--text); text-align: right; max-width: 220px; word-break: break-word; }
  .bpf-modal-val.red { color: var(--red); font-family:'Playfair Display',serif; font-size: 1.1rem; }
  .bpf-modal-footer { padding: 16px 28px 24px; display: flex; gap: 10px; }
  .bpf-modal-cancel {
    flex: 1; padding: 13px; border: 1.5px solid var(--border);
    border-radius: 10px; background: white; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 600;
    color: var(--text); transition: all .18s;
  }
  .bpf-modal-cancel:hover { border-color: var(--navy); }
  .bpf-modal-confirm {
    flex: 1.6; padding: 13px;
    background: var(--navy);
    color: white; border: none; border-radius: 10px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 700;
    transition: opacity .18s, transform .18s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .bpf-modal-confirm:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .bpf-modal-confirm:disabled { opacity: .6; cursor: not-allowed; }
  .bpf-modal-error {
    margin: 0 28px 16px; background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; border-radius: 9px; padding: 10px 14px;
    font-size: .82rem; font-weight: 600; text-align: center;
  }

  /* ── PIN digits ── */
  .pin-input-wrap { display: flex; gap: 10px; justify-content: center; }
  .pin-digit {
    width: 52px; height: 52px; flex-shrink: 0;
    text-align: center; font-size: 1.4rem; font-weight: 700;
    letter-spacing: .05em; border: 1.5px solid var(--border);
    border-radius: 10px; background: #f8fafc;
    font-family: 'DM Sans', sans-serif; color: var(--navy);
    transition: border-color .2s, box-shadow .2s; outline: none;
  }
  .pin-digit:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.1); background: white; }
  .pin-digit.error  { border-color: var(--red);  box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
  .bpf-modal-pin-section { padding: 16px 28px 0; }
  .bpf-modal-pin-label {
    font-size: .78rem; font-weight: 700; color: var(--navy);
    text-transform: uppercase; letter-spacing: .06em;
    margin-bottom: 12px; text-align: center;
  }


  /* ── Success card ── */
  .bpf-success-card {
    background: white; border: 1px solid var(--border); border-radius: 18px;
    padding: 40px 28px; text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,.05);
  }
  .bpf-success-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: #f0fdf4; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 2rem; color: var(--green);
  }
  .bpf-success-title  { font-family:'Playfair Display',serif; font-size: 1.5rem; color: var(--navy); font-weight: 700; margin-bottom: 6px; }
  .bpf-success-sub    { font-size: .88rem; color: var(--muted); margin-bottom: 20px; }
  .bpf-success-amount { font-family:'Playfair Display',serif; font-size: 2rem; font-weight: 700; color: var(--red); margin-bottom: 4px; }
  .bpf-success-desc   { font-size: .85rem; color: var(--muted); margin-bottom: 28px; }
  .bpf-success-details {
    background: #f8fafc; border: 1px solid var(--border);
    border-radius: 12px; padding: 16px; margin-bottom: 28px;
    text-align: left; display: flex; flex-direction: column; gap: 8px;
  }
  .bpf-success-detail-row { display: flex; justify-content: space-between; font-size: .83rem; }
  .bpf-success-detail-lbl { color: var(--muted); }
  .bpf-success-detail-val { font-weight: 700; color: var(--text); }
  .bpf-success-btn {
    padding: 13px 28px; background: var(--navy); color: white;
    border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: .9rem; font-weight: 700; cursor: pointer; transition: background .18s;
  }
  .bpf-success-btn:hover { background: var(--navy-dark); }

  /* ── Error banner ── */
  .bpf-error-banner {
    background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
    padding: 11px 14px; border-radius: 10px; margin-bottom: 16px;
    font-size: .85rem; font-weight: 600;
  }

  /* ── Back button ── */
  .bpf-back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 600;
    cursor: pointer; padding: 0; margin-bottom: 20px;
    transition: color .15s;
  }
  .bpf-back-btn:hover { color: var(--navy); }

  /* Responsive */
  @media (max-width: 768px) {
    .bos-sidebar   { transform: translateX(-100%); width: 280px; }
    .dash-main     { margin-left: 0; }
    .sidebar-overlay-bg { display: block; }
    .topbar-hamburger { display: flex; }
    .bos-topbar    { padding: 0 16px; height: 60px; }
    .topbar-name   { display: none; }
    .dash-content  { padding: 14px 14px 40px; }
    .bills-category-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .bills-provider-grid { grid-template-columns: repeat(2, 1fr); }
    .bills-balance-pill  { flex-wrap: wrap; gap: 10px; }
    .bbp-divider { display: none; }
  }
  @media (max-width: 480px) {
    .bills-category-grid { grid-template-columns: repeat(2, 1fr); }
    .bills-steps { gap: 0; }
    .bills-step-label { display: none; }
    .bill-form-card { padding: 18px; }
  }
`;

/* ─── Data ──────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    key: "airtime",
    name: "Airtime",
    emoji: "📱",
    color: "#7c3aed",
    bg: "#f5f3ff",
    refLabel: "Phone Number",
    refPlaceholder: "e.g. 08031234567",
    refHint: "Must be exactly 11 digits",
    refPattern: /^\d{11}$/,
    refError: "Phone number must be exactly 11 digits (e.g. 08031234567)",
    refInputMode: "numeric",
    providers: [
      { name: "MTN Nigeria",    sub: "Airtime top-up",   emoji: "🟡" },
      { name: "Airtel Nigeria", sub: "Airtime top-up",   emoji: "🔴" },
      { name: "Glo Nigeria",    sub: "Airtime top-up",   emoji: "🟢" },
      { name: "9mobile",        sub: "Airtime top-up",   emoji: "🟤" },
    ],
    quickAmounts: [100, 200, 500, 1000, 2000],
  },
  {
    key: "internet",
    name: "Internet",
    emoji: "📶",
    color: "#2563eb",
    bg: "#eff6ff",
    refLabel: "Phone Number / Account",
    refPlaceholder: "e.g. 08031234567",
    refHint: "Must be exactly 11 digits",
    refPattern: /^\d{11}$/,
    refError: "Internet reference must be exactly 11 digits",
    refInputMode: "numeric",
    providers: [
      { name: "MTN Data",       sub: "Data bundle",      emoji: "🟡" },
      { name: "Airtel Data",    sub: "Data bundle",      emoji: "🔴" },
      { name: "Glo Data",       sub: "Data bundle",      emoji: "🟢" },
      { name: "Smile Telecom",  sub: "Broadband",        emoji: "😊" },
      { name: "Spectranet",     sub: "Broadband",        emoji: "🌐" },
      { name: "IPNX Nigeria",   sub: "Fibre / broadband",emoji: "⚡" },
    ],
    quickAmounts: [1000, 2000, 5000, 10000],
  },
  {
    key: "electricity",
    name: "Electricity",
    emoji: "⚡",
    color: "#d97706",
    bg: "#fffbeb",
    refLabel: "Meter Number",
    refPlaceholder: "e.g. 1234567",
    refHint: "Must be exactly 7 digits",
    refPattern: /^\d{7}$/,
    refError: "Electricity meter number must be exactly 7 digits",
    refInputMode: "numeric",
    providers: [
      { name: "EKEDC",          sub: "Eko Electricity",  emoji: "🏙️" },
      { name: "IKEDC",          sub: "Ikeja Electric",   emoji: "🔌" },
      { name: "AEDC",           sub: "Abuja Electricity",emoji: "🏛️" },
      { name: "PHEDC",          sub: "Port Harcourt",    emoji: "⛽" },
      { name: "IBEDC",          sub: "Ibadan Electricity",emoji: "🌆" },
      { name: "EEDC",           sub: "Enugu Electricity",emoji: "🦅" },
    ],
    quickAmounts: [1000, 2000, 5000, 10000, 20000],
  },
  {
    key: "water",
    name: "Water Bill",
    emoji: "💧",
    color: "#0891b2",
    bg: "#ecfeff",
    refLabel: "Customer / Meter Number",
    refPlaceholder: "e.g. 12345678",
    refHint: "Must be 8 to 12 digits",
    refPattern: /^\d{8,12}$/,
    refError: "Water customer/meter number must be 8 to 12 digits",
    refInputMode: "numeric",
    providers: [
      { name: "Lagos Water Corp",   sub: "LWC",          emoji: "🌊" },
      { name: "Abuja Water Board",  sub: "FCT Water",    emoji: "🏞️" },
      { name: "Rivers Water Board", sub: "Rivers State", emoji: "🌧️" },
      { name: "Oyo Water Corp",     sub: "Oyo State",    emoji: "💦" },
    ],
    quickAmounts: [500, 1000, 2000, 5000],
  },
];

const API = "http://localhost:9000/api/v1";
const fmt = (n) => "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Spin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

/* ─── Step indicator ─────────────────────────────────────────── */
function StepBar({ step }) {
  const steps = ["Select Category", "Choose Provider", "Enter Details"];
  return (
    <div className="bills-steps">
      {steps.map((s, i) => {
        const state = i + 1 < step ? "done" : i + 1 === step ? "active" : "";
        return (
          <div key={s} className="bills-step" style={{ flex: i < steps.length - 1 ? "1" : "0 0 auto" }}>
            <div className={`bills-step-num ${state}`}>
              {i + 1 < step ? "✓" : i + 1}
            </div>
            <span className={`bills-step-label ${state}`}>{s}</span>
            {i < steps.length - 1 && <div className={`bills-step-line ${i + 1 < step ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function BillPayment() {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get("token");
  const { roles: userRole } = getTokenData();

  const [userData, setUserData] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── wizard state: 1=category, 2=provider, 3=form ── */
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState(null);   // CATEGORIES item
  const [selectedProv, setSelectedProv] = useState(null); // provider string

  /* ── form ── */
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [refError, setRefError] = useState("");
  const [formError, setFormError] = useState("");

  /* ── modal / submission ── */
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [success, setSuccess] = useState(null);

  /* ── PIN state ── */
  const [modalPin, setModalPin] = useState(["", "", "", ""]);
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleLogout = () => { new Cookies().remove("token", { path: "/" }); window.location.replace("/login"); };

  useEffect(() => {
    axios.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUserData(r.data.data))
      .catch(e => { if (e?.response?.status === 401) handleLogout(); });
  }, []);

  /* ── Reference live validation ── */
  const handleRefChange = (val) => {
    setReference(val);
    setRefError("");
    if (val && selectedCat && !selectedCat.refPattern.test(val)) {
      // Show error only when field loses focus or on submit — no live nagging
    }
  };

  /* ── Validate & show modal ── */
  const handleReview = () => {
    setFormError("");
    setRefError("");
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) return setFormError("Please enter a valid amount.");
    if (amt < 100) return setFormError("Minimum payment amount is ₦100.");
    if (userData && amt > userData.totalBalance) return setFormError("Insufficient balance.");
    if (!reference.trim()) { setRefError("This field is required."); return; }
    if (!selectedCat.refPattern.test(reference.trim())) { setRefError(selectedCat.refError); return; }
    setModalError("");
    setModalPin(["", "", "", ""]);
    setShowModal(true);
  };

  /* ── Submit ── */
  const modalPinValue = modalPin.join("");

  const handleModalPinKey = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...modalPin];
    next[idx] = val;
    setModalPin(next);
    setModalError("");
    if (val && idx < 3) pinRefs[idx + 1].current?.focus();
  };

  const handleModalPinKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !modalPin[idx] && idx > 0)
      pinRefs[idx - 1].current?.focus();
  };

  const handleConfirm = async () => {
    if (modalPinValue.length !== 4) {
      setModalError("Please enter your 4-digit transaction PIN.");
      return;
    }
    setSubmitting(true);
    setModalError("");
    try {
      const r = await axios.post(
        `${API}/bills/pay`,
        {
          billType: selectedCat.key,
          provider: selectedProv,
          reference: reference.trim(),
          amount: parseFloat(amount),
          note,
          transactionPin: modalPinValue,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(r.data);
      setShowModal(false);
      // Silently re-fetch dashboard so balance updates instantly without a page refresh
      try {
        const fresh = await axios.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        setUserData(fresh.data.data);
      } catch (_) { /* non-critical — balance will be stale until next load */ }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Payment failed. Please try again.";
      setModalError(msg);
      // Clear PIN so user can re-enter
      setModalPin(["", "", "", ""]);
      setTimeout(() => pinRefs[0].current?.focus(), 50);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = async () => {
    setStep(1); setSelectedCat(null); setSelectedProv(null);
    setAmount(""); setReference(""); setNote("");
    setRefError(""); setFormError(""); setModalError(""); setModalPin(["", "", "", ""]); setSuccess(null);
    // Keep balance fresh when user starts a new payment
    try {
      const fresh = await axios.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(fresh.data.data);
    } catch (_) {}
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <>
        <style>{style}</style>
        <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
        <div className="dash-layout">
          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
            onNavigate={(key) => navigate("/" + key)} active="bills" />
          <main className="dash-main">
            <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
            <div className="dash-content">
              <div className="bills-page">
                <div className="bpf-success-card">
                  <div className="bpf-success-icon">✓</div>
                  <div className="bpf-success-title">Payment Successful!</div>
                  <div className="bpf-success-sub">Your bill has been paid successfully.</div>
                  <div className="bpf-success-amount">-{fmt(amount)}</div>
                  <div className="bpf-success-details">
                    <div className="bpf-success-detail-row">
                      <span className="bpf-success-detail-lbl">Bill Type</span>
                      <span className="bpf-success-detail-val">{selectedCat?.name}</span>
                    </div>
                    <div className="bpf-success-detail-row">
                      <span className="bpf-success-detail-lbl">Provider</span>
                      <span className="bpf-success-detail-val">{selectedProv}</span>
                    </div>
                    <div className="bpf-success-detail-row">
                      <span className="bpf-success-detail-lbl">Reference</span>
                      <span className="bpf-success-detail-val">{reference}</span>
                    </div>
                    <div className="bpf-success-detail-row">
                      <span className="bpf-success-detail-lbl">New Balance</span>
                      <span className="bpf-success-detail-val" style={{ color: "var(--navy)" }}>{fmt(success?.data?.newBalance)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button className="bpf-success-btn" onClick={resetAll}>Pay Another Bill</button>
                    <button className="bpf-success-btn" style={{ background: "#e2e8f0", color: "#1e293b" }}
                      onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  const cat = selectedCat;

  return (
    <>
      <style>{style}</style>

      {/* ── Confirmation Modal ── */}
      {showModal && (
        <div className="bpf-modal-backdrop" onClick={(e) => e.target === e.currentTarget && !submitting && setShowModal(false)}>
          <div className="bpf-modal">
            <div className="bpf-modal-header">
              <div className="bpf-modal-icon">{cat?.emoji}</div>
              <div className="bpf-modal-title">Confirm Payment</div>
              <div className="bpf-modal-subtitle">Review your bill payment details</div>
            </div>
            <div className="bpf-modal-body">
              <div className="bpf-modal-row">
                <span className="bpf-modal-lbl">Amount</span>
                <span className="bpf-modal-val red">-{fmt(amount)}</span>
              </div>
              <div className="bpf-modal-row">
                <span className="bpf-modal-lbl">Bill Type</span>
                <span className="bpf-modal-val">{cat?.name}</span>
              </div>
              <div className="bpf-modal-row">
                <span className="bpf-modal-lbl">Provider</span>
                <span className="bpf-modal-val">{selectedProv}</span>
              </div>
              <div className="bpf-modal-row">
                <span className="bpf-modal-lbl">{cat?.refLabel}</span>
                <span className="bpf-modal-val">{reference}</span>
              </div>
              {note.trim() && (
                <div className="bpf-modal-row">
                  <span className="bpf-modal-lbl">Note</span>
                  <span className="bpf-modal-val" style={{ fontStyle: "italic", fontWeight: 500 }}>{note}</span>
                </div>
              )}
              <div className="bpf-modal-row">
                <span className="bpf-modal-lbl">Balance After</span>
                <span className="bpf-modal-val">{fmt((userData?.totalBalance || 0) - parseFloat(amount || 0))}</span>
              </div>
            </div>
            {/* PIN entry */}
            <div className="bpf-modal-pin-section">
              <div className="bpf-modal-pin-label">Enter Transaction PIN</div>
              <div className="pin-input-wrap">
                {modalPin.map((d, i) => (
                  <input
                    key={i}
                    ref={pinRefs[i]}
                    className={`pin-digit${modalError ? " error" : ""}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleModalPinKey(e, i)}
                    onKeyDown={(e) => handleModalPinKeyDown(e, i)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            {modalError && <div className="bpf-modal-error" style={{ marginTop: 14 }}>{modalError}</div>}

            <div className="bpf-modal-footer" style={{ marginTop: modalError ? 0 : 16 }}>
              <button className="bpf-modal-cancel" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
              <button
                className="bpf-modal-confirm"
                onClick={handleConfirm}
                disabled={submitting || modalPinValue.length !== 4}
              >
                {submitting ? <><Spin /> Processing…</> : "✓ Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />

      <div className="dash-layout">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
          onNavigate={(key) => navigate("/" + key)} active="bills" />

        <main className="dash-main">
          <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />

          <div className="dash-content">
            <div className="bills-page">
              <h1 className="bills-page-title">Pay Bills</h1>
              <p className="bills-page-sub">Pay your bills instantly — airtime, internet, electricity, and water.</p>

              {/* Balance pill */}
              <div className="bills-balance-pill">
                <div className="bbp-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="bbp-info">
                  <span className="bbp-name">{userData?.fullName || "—"}</span>
                  <span className="bbp-acct">{userData?.accountNumber || "—"}</span>
                </div>
                <div className="bbp-divider" />
                <div className="bbp-bal">
                  <span className="bbp-bal-label">Available Balance</span>
                  <span className="bbp-bal-value">{userData ? fmt(userData.totalBalance) : "—"}</span>
                </div>
              </div>

              {/* Step bar */}
              <StepBar step={step} />

              {/* ════ STEP 1: Category ════ */}
              {step === 1 && (
                <>
                  <p className="bills-section-label">Select Bill Category</p>
                  <div className="bills-category-grid">
                    {CATEGORIES.map(c => (
                      <div
                        key={c.key}
                        className={`bill-cat-card${selectedCat?.key === c.key ? " selected" : ""}`}
                        style={{ "--cat-color": c.color, "--cat-bg": c.bg }}
                        onClick={() => {
                          setSelectedCat(c);
                          setSelectedProv(null);
                          setAmount(""); setReference(""); setNote("");
                          setRefError(""); setFormError("");
                          setStep(2);
                        }}
                      >
                        <div className="bill-cat-check">✓</div>
                        <div className="bill-cat-icon">{c.emoji}</div>
                        <div className="bill-cat-name">{c.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ════ STEP 2: Provider ════ */}
              {step === 2 && cat && (
                <>
                  <button className="bpf-back-btn" onClick={() => { setStep(1); setSelectedProv(null); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to categories
                  </button>

                  {/* Mini selected cat badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "10px 14px", background: cat.bg, borderRadius: 10, border: `1.5px solid ${cat.color}20` }}>
                    <span style={{ fontSize: "1.3rem" }}>{cat.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: cat.color, fontSize: ".85rem" }}>{cat.name}</div>
                      <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>Choose a provider below</div>
                    </div>
                  </div>

                  <p className="bills-section-label">Select Provider</p>
                  <div className="bills-provider-grid">
                    {cat.providers.map(p => (
                      <div
                        key={p.name}
                        className={`bill-provider-card${selectedProv === p.name ? " selected" : ""}`}
                        onClick={() => { setSelectedProv(p.name); setStep(3); }}
                      >
                        <div className="bill-provider-logo">{p.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="bill-provider-name">{p.name}</div>
                          <div className="bill-provider-sub">{p.sub}</div>
                        </div>
                        <div className="bill-provider-radio" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ════ STEP 3: Form ════ */}
              {step === 3 && cat && selectedProv && (
                <>
                  <button className="bpf-back-btn" onClick={() => { setStep(2); setSelectedProv(null); setAmount(""); setReference(""); setRefError(""); setFormError(""); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to providers
                  </button>

                  {/* Summary header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, padding: "14px 16px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: 12 }}>
                    <span style={{ fontSize: "1.6rem" }}>{cat.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: ".92rem" }}>{selectedProv}</div>
                      <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{cat.name} Payment</div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      style={{ fontSize: ".72rem", color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Change
                    </button>
                  </div>

                  <div className="bill-form-card">

                    {/* Amount */}
                    <div className="bpf-group">
                      <label className="bpf-label">Amount</label>
                      <div className="bpf-input-wrap">
                        <span className="bpf-prefix">₦</span>
                        <input
                          className="bpf-input has-prefix"
                          type="number" min="100" placeholder="0.00"
                          value={amount}
                          onChange={(e) => { setAmount(e.target.value); setFormError(""); }}
                        />
                      </div>
                      <p className="bpf-hint">Minimum: ₦100</p>
                      <div className="bpf-chips">
                        {cat.quickAmounts.map(v => (
                          <button
                            key={v}
                            type="button"
                            className={`bpf-chip${parseFloat(amount) === v ? " selected" : ""}`}
                            onClick={() => { setAmount(String(v)); setFormError(""); }}
                          >
                            {fmt(v).replace(".00", "")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reference */}
                    <div className="bpf-group">
                      <label className="bpf-label">{cat.refLabel}</label>
                      <input
                        className={`bpf-input${refError ? " error" : (reference && cat.refPattern.test(reference) ? " success" : "")}`}
                        type="text"
                        inputMode={cat.refInputMode}
                        placeholder={cat.refPlaceholder}
                        maxLength={cat.key === "water" ? 12 : cat.key === "electricity" ? 7 : 11}
                        value={reference}
                        onChange={(e) => handleRefChange(e.target.value.replace(/\D/g, ""))}
                        onBlur={() => {
                          if (reference && !cat.refPattern.test(reference)) setRefError(cat.refError);
                        }}
                      />
                      <p className="bpf-hint">{cat.refHint}</p>
                      {refError && <p className="bpf-error-msg">{refError}</p>}
                    </div>

                    {/* Note */}
                    <div className="bpf-group">
                      <label className="bpf-label">
                        Note&nbsp;<span style={{ fontWeight: 400, textTransform: "none", fontSize: ".75rem", color: "var(--muted)" }}>(optional)</span>
                      </label>
                      <input
                        className="bpf-input"
                        type="text" maxLength={100}
                        placeholder="e.g. March electricity bill"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>

                    {/* Summary box */}
                    {amount && parseFloat(amount) > 0 && (
                      <div className="bpf-summary">
                        <div className="bpf-summary-row">
                          <span className="bpf-summary-lbl">You are paying</span>
                          <span className="bpf-summary-val amber">{fmt(amount)}</span>
                        </div>
                        <div className="bpf-summary-row">
                          <span className="bpf-summary-lbl">To</span>
                          <span className="bpf-summary-val">{selectedProv}</span>
                        </div>
                        {userData && (
                          <div className="bpf-summary-row">
                            <span className="bpf-summary-lbl">Balance after</span>
                            <span className="bpf-summary-val navy">{fmt((userData.totalBalance || 0) - parseFloat(amount || 0))}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error */}
                    {formError && <div className="bpf-error-banner">{formError}</div>}

                    {/* Submit */}
                    <button className="bill-submit-btn" onClick={handleReview}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Review Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}