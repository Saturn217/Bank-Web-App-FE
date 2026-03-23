import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";
import PageLoader from "../components/PageLoader";

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

  /* shared sidebar/topbar */
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
     PROFILE PAGE
  ══════════════════════════ */

  .prf-page { max-width: 820px; margin: 0 auto; }

  /* ── Hero card ── */
  .prf-hero {
    background: var(--navy);
    border-radius: 20px;
    padding: 32px 32px 0;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }
  .prf-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 260px; height: 260px;
    border-radius: 50%;
    background: rgba(255,255,255,.04);
    pointer-events: none;
  }
  .prf-hero::after {
    content: '';
    position: absolute;
    bottom: 30px; left: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,.03);
    pointer-events: none;
  }

  .prf-hero-top {
    display: flex; align-items: flex-start; gap: 20px;
    margin-bottom: 28px; position: relative; z-index: 1;
  }
  .prf-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(255,255,255,.15);
    border: 2.5px solid rgba(255,255,255,.3);
    color: white; font-family: 'Playfair Display', serif;
    font-size: 1.6rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .prf-hero-info { flex: 1; min-width: 0; }
  .prf-hero-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 700; color: white;
    margin-bottom: 4px; line-height: 1.2;
  }
  .prf-hero-email { font-size: .84rem; color: rgba(255,255,255,.55); margin-bottom: 10px; }
  .prf-role-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 20px;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.18);
    font-size: .72rem; font-weight: 700;
    color: rgba(255,255,255,.85);
    text-transform: uppercase; letter-spacing: .07em;
  }

  /* account number strip */
  .prf-acct-strip {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(255,255,255,.07);
    border-top: 1px solid rgba(255,255,255,.08);
    margin: 0 -32px; padding: 14px 32px;
    position: relative; z-index: 1;
  }
  .prf-acct-label { font-size: .72rem; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 3px; }
  .prf-acct-num {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem; font-weight: 700; color: white;
    letter-spacing: .08em;
  }
  .prf-copy-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    background: rgba(255,255,255,.1);
    border: 1px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.8);
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 600;
    cursor: pointer; transition: all .15s; flex-shrink: 0;
  }
  .prf-copy-btn:hover { background: rgba(255,255,255,.18); color: white; }
  .prf-copy-btn.copied { background: rgba(22,163,74,.25); border-color: rgba(22,163,74,.4); color: #86efac; }

  /* ── Balance cards row ── */
  .prf-balances {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 14px; margin-bottom: 20px;
  }
  .prf-bal-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; padding: 20px 22px;
    display: flex; align-items: center; gap: 14px;
    transition: box-shadow .2s;
  }
  .prf-bal-card:hover { box-shadow: 0 4px 16px rgba(27,58,107,.08); }
  .prf-bal-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; flex-shrink: 0;
  }
  .prf-bal-label { font-size: .72rem; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px; }
  .prf-bal-value { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; }

  /* ── Section cards ── */
  .prf-section {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden; margin-bottom: 16px;
  }
  .prf-section-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px; border-bottom: 1px solid var(--border);
  }
  .prf-section-title {
    font-size: .88rem; font-weight: 700; color: var(--navy);
    display: flex; align-items: center; gap: 8px;
  }
  .prf-section-icon {
    width: 28px; height: 28px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: .85rem;
  }

  /* Info rows */
  .prf-info-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 22px; border-bottom: 1px solid var(--border);
    gap: 16px;
  }
  .prf-info-row:last-child { border-bottom: none; }
  .prf-info-lbl { font-size: .82rem; color: var(--muted); flex-shrink: 0; }
  .prf-info-val { font-size: .88rem; font-weight: 600; color: var(--text); text-align: right; }
  .prf-info-val.mono { font-family: 'Playfair Display', serif; letter-spacing: .04em; }
  .prf-info-val.green { color: var(--green); }
  .prf-info-val.navy  { color: var(--navy); }

  /* Status badge */
  .prf-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: .72rem; font-weight: 700;
  }
  .prf-status-dot { width: 6px; height: 6px; border-radius: 50%; }

  /* Interest countdown */
  .prf-interest-card {
    margin: 0 22px 18px;
    background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
    border: 1px solid #dbeafe;
    border-radius: 12px; padding: 16px 18px;
    display: flex; align-items: center; gap: 14px;
  }
  .prf-interest-icon {
    width: 42px; height: 42px; border-radius: 11px;
    background: white; box-shadow: 0 2px 8px rgba(37,99,235,.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
  }
  .prf-interest-label { font-size: .72rem; color: #6d28d9; text-transform: uppercase; letter-spacing: .07em; font-weight: 700; margin-bottom: 3px; }
  .prf-interest-value { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
  .prf-interest-sub   { font-size: .72rem; color: var(--muted); }

  /* PIN section */
  .prf-pin-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px; gap: 16px;
  }
  .prf-pin-left { display: flex; align-items: center; gap: 12px; }
  .prf-pin-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: #fef3c7; display: flex; align-items: center;
    justify-content: center; font-size: 1rem; flex-shrink: 0;
  }
  .prf-pin-title { font-size: .88rem; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .prf-pin-sub   { font-size: .75rem; color: var(--muted); }
  .prf-pin-btn {
    padding: 8px 18px; border-radius: 9px;
    border: 1.5px solid var(--border);
    background: var(--white);
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 700;
    color: var(--navy); cursor: pointer; transition: all .18s; flex-shrink: 0;
  }
  .prf-pin-btn:hover { border-color: var(--navy); background: #f8fafc; }
  .prf-pin-btn.set { background: var(--navy); color: white; border-color: var(--navy); }
  .prf-pin-btn.set:hover { background: var(--navy-dark); }

/* ── PIN Modal ── */
  .prf-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.5);
    backdrop-filter: blur(4px); z-index: 9999;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: pmFadeIn .2s ease;
  }
  @keyframes pmFadeIn { from{opacity:0} to{opacity:1} }
  .prf-modal {
    background: white; border-radius: 20px; width: 100%; max-width: 400px;
    box-shadow: 0 24px 72px rgba(0,0,0,.2);
    animation: pmSlideUp .25s cubic-bezier(.34,1.56,.64,1);
    overflow: hidden;
  }
  @keyframes pmSlideUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .prf-modal-header {
    background: var(--navy); padding: 26px 28px; text-align: center; color: white;
  }
  .prf-modal-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; }
  .prf-modal-sub   { font-size: .82rem; opacity: .65; }
  .prf-modal-body  { padding: 24px 28px; }
  .prf-modal-label {
    font-size: .72rem; font-weight: 700; color: var(--navy);
    text-transform: uppercase; letter-spacing: .07em;
    margin-bottom: 10px; text-align: center;
  }
  .pin-input-wrap { display: flex; gap: 10px; justify-content: center; margin-bottom: 6px; }
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
  .prf-modal-error {
    background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; border-radius: 9px; padding: 10px 14px;
    font-size: .82rem; font-weight: 600; text-align: center; margin-top: 14px;
  }
  .prf-modal-footer { padding: 0 28px 24px; display: flex; gap: 10px; }
  .prf-modal-cancel {
    flex: 1; padding: 12px; border: 1.5px solid var(--border);
    border-radius: 10px; background: white; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 600;
    color: var(--text); transition: all .18s;
  }
  .prf-modal-cancel:hover { border-color: var(--navy); }
  .prf-modal-submit {
    flex: 1.6; padding: 12px; background: var(--navy);
    color: white; border: none; border-radius: 10px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 700;
    transition: opacity .18s; display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .prf-modal-submit:hover:not(:disabled) { opacity: .88; }
  .prf-modal-submit:disabled { opacity: .55; cursor: not-allowed; }

  /* Member since */
  .prf-member-strip {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px 22px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
  }
  .prf-member-left { display: flex; align-items: center; gap: 10px; }
  .prf-member-icon { font-size: 1.2rem; }
  .prf-member-label { font-size: .72rem; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 2px; }
  .prf-member-value { font-size: .88rem; font-weight: 700; color: var(--navy); }
  .prf-member-badge {
    padding: 4px 12px; border-radius: 20px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    font-size: .72rem; font-weight: 700; color: var(--green);
  }

  /* Admin Panel button */
  .prf-admin-btn {
    width: 100%; padding: 13px; border-radius: 10px;
    border: 1.5px solid rgba(37,99,235,.25); background: linear-gradient(135deg,#eff6ff 0%,#e0e7ff 100%);
    color: var(--blue); font-family: 'DM Sans', sans-serif;
    font-size: .88rem; font-weight: 700; cursor: pointer;
    transition: all .18s; display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }
  .prf-admin-btn:hover { background: linear-gradient(135deg,#dbeafe 0%,#c7d2fe 100%); border-color: var(--blue); box-shadow: 0 4px 14px rgba(37,99,235,.15); }

  /* Danger zone */
  .prf-danger-btn {
    width: 100%; padding: 12px; border-radius: 10px;
    border: 1.5px solid #fecaca; background: #fef2f2;
    color: var(--red); font-family: 'DM Sans', sans-serif;
    font-size: .88rem; font-weight: 700; cursor: pointer;
    transition: all .18s; display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }
  .prf-danger-btn:hover { background: #fee2e2; border-color: var(--red); }

  /* Spinner */
  @keyframes spin { to{transform:rotate(360deg)} }
  .prf-spin { width:16px;height:16px;border:2.5px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }

  /* Responsive */
  @media (max-width: 768px) {
    .bos-sidebar { transform: translateX(-100%); width: 280px; }
    .dash-main { margin-left: 0; }
    .sidebar-overlay-bg { display: block; }
    .topbar-hamburger { display: flex; }
    .bos-topbar { padding: 0 16px; height: 60px; }
    .topbar-name { display: none; }
    .dash-content { padding: 14px 14px 40px; }
    .prf-balances { grid-template-columns: 1fr; }
    .prf-hero { padding: 24px 20px 0; }
    .prf-acct-strip { margin: 0 -20px; padding: 14px 20px; flex-wrap: wrap; gap: 10px; }
    .prf-hero-name { font-size: 1.2rem; }
  }
`;

/* ── Helpers ─────────────────────────────────────────────────── */
const API = "http://localhost:9000/api/v1";
const fmt = (n) => "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" });
const initials = (name = "") => name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

function Spin() { return <span className="prf-spin" />; }

/* ── Logout Confirmation Modal ──────────────────────────────── */
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="prf-modal-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="prf-modal" style={{ maxWidth: 380 }}>
        <div className="prf-modal-header" style={{ background: "#1e293b" }}>
          <div style={{ marginBottom: 10 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div className="prf-modal-title">Sign Out?</div>
          <div className="prf-modal-sub">You'll be returned to the login screen.</div>
        </div>
        <div style={{ padding: "22px 28px 8px", textAlign: "center" }}>
          <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.6 }}>
            Are you sure you want to sign out of your Bank of Saturn account?
          </p>
        </div>
        <div className="prf-modal-footer" style={{ padding: "16px 28px 24px" }}>
          <button className="prf-modal-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="prf-modal-submit"
            onClick={onConfirm}
            style={{ background: "#ef4444", flex: 1.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PIN Modal ───────────────────────────────────────────────── */
function PinModal({ mode, hasPin, onClose, onSuccess, token }) {
  // mode: "set" | "change"
  // fields: newPin (always), currentPin (if change)
  const [currentPin, setCurrentPin] = useState(["", "", "", ""]);
  const [newPin,     setNewPin]     = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [error,      setError]      = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Stable refs — useRef on the array so they never get recreated on re-render
  const curRefs = useRef([useRef(), useRef(), useRef(), useRef()]).current;
  const newRefs = useRef([useRef(), useRef(), useRef(), useRef()]).current;
  const conRefs = useRef([useRef(), useRef(), useRef(), useRef()]).current;

  // Focus first box of newPin on mount (no autoFocus prop — avoids refocus on every re-render)
  useEffect(() => {
    setTimeout(() => newRefs[0].current?.focus(), 80);
  }, []);

  const handleInput = (setter, refs, arr, idx, val) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...arr]; next[idx] = clean; setter(next);
    setError("");
    if (clean && idx < refs.length - 1) refs[idx + 1].current?.focus();
  };
  const handleBksp = (refs, arr, idx, e) => {
    if (e.key === "Backspace" && !arr[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  const handleSubmit = async () => {
    const np = newPin.join(""); const cp = confirmPin.join("");
    if (np.length < 4 || np.length > 6) { setError("PIN must be 4–6 digits."); return; }
    if (np !== cp)       { setError("PINs do not match."); return; }

    setSubmitting(true); setError("");
    try {
      const endpoint = `${API}/set-pin`;
      const body = { pin: np, confirmPin: cp };
      await axios.post(endpoint, body, { headers: { Authorization: `Bearer ${token}` } });
      onSuccess();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Failed. Please try again.";
      setError(msg);
      setNewPin(["","","",""]); setConfirmPin(["","","",""]);
      setTimeout(() => newRefs[0].current?.focus(), 50);
    } finally { setSubmitting(false); }
  };

  // PinRow as a plain function call (not a component) so refs stay stable across renders
  const renderPinRow = (label, arr, setter, refs) => (
    <div style={{ marginBottom: 20 }}>
      <div className="prf-modal-label">{label}</div>
      <div className="pin-input-wrap">
        {arr.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            className={`pin-digit${error ? " error" : ""}`}
            type="password" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleInput(setter, refs, arr, i, e.target.value)}
            onKeyDown={e => handleBksp(refs, arr, i, e)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="prf-modal-backdrop" onClick={e => e.target === e.currentTarget && !submitting && onClose()}>
      <div className="prf-modal">
        <div className="prf-modal-header">
          <div style={{ fontSize: "1.8rem", marginBottom: 8 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div className="prf-modal-title">{mode === "reset" ? "Reset Transaction PIN" : "Set Transaction PIN"}</div>
          <div className="prf-modal-sub">{mode === "reset" ? "Choose a new 4–6 digit transaction PIN." : "Create a secure 4–6 digit PIN for transactions."}</div>
        </div>
        <div className="prf-modal-body">
          {renderPinRow("New PIN", newPin, setNewPin, newRefs)}
          {renderPinRow("Confirm New PIN", confirmPin, setConfirmPin, conRefs)}
          {error && <div className="prf-modal-error">{error}</div>}
        </div>
        <div className="prf-modal-footer">
          <button className="prf-modal-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            className="prf-modal-submit"
            onClick={handleSubmit}
            disabled={submitting || newPin.join("").length < 4 || confirmPin.join("").length < 4}
          >
            {submitting ? <><Spin /> Saving…</> : (hasPin ? "Update PIN" : "Set PIN")}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ── Change Password Modal ─────────────────────────────────── */
function ChangePasswordModal({ token, onClose, onSuccess }) {
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showCon,    setShowCon]    = useState(false);
  const [error,      setError]      = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let s = 0;
    if (pw.length >= 8)           s++;
    if (pw.length >= 12)          s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return { score: s, label: "Weak",   color: "#ef4444" };
    if (s <= 2) return { score: s, label: "Fair",   color: "#d97706" };
    if (s <= 3) return { score: s, label: "Good",   color: "#2563eb" };
    return         { score: s, label: "Strong", color: "#16a34a" };
  };

  const strength = getStrength(newPw);

  const validate = () => {
    if (!currentPw)          return "Current password is required.";
    if (!newPw)              return "New password is required.";
    if (newPw.length < 8)    return "New password must be at least 8 characters.";
    if (newPw !== confirmPw) return "Passwords do not match.";
    if (newPw === currentPw) return "New password must be different from current.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true); setError("");
    try {
      await axios.post(
        `${API}/change-password`,
        { currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (e) {
      setError(e?.response?.data?.message || "Password change failed. Try again.");
    } finally { setSubmitting(false); }
  };

  const eyeIconShow = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const eyeIconHide = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle} style={{
      position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
      background:"none", border:"none", cursor:"pointer", color:"var(--muted)",
      display:"flex", padding:2,
    }}>
      {show ? eyeIconHide : eyeIconShow}
    </button>
  );

  const inputStyle = (hasErr) => ({
    width:"100%", padding:"11px 42px 11px 14px",
    border:`1.5px solid ${hasErr ? "#ef4444" : "var(--border)"}`,
    borderRadius:8, fontSize:".9rem", fontFamily:"'DM Sans',sans-serif",
    color:"var(--text)", background:"#f8fafc", outline:"none",
    boxSizing:"border-box", transition:"border-color .2s",
  });

  return (
    <div className="prf-modal-backdrop" onClick={e => e.target === e.currentTarget && !submitting && onClose()}>
      <div className="prf-modal" style={{ maxWidth:420 }}>

        <div className="prf-modal-header">
          <div style={{ marginBottom:8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="prf-modal-title">Change Password</div>
          <div className="prf-modal-sub">Enter your current password, then set a new one.</div>
        </div>

        <div className="prf-modal-body" style={{ paddingBottom:8 }}>

          {/* Current Password */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:".78rem", fontWeight:700, color:"var(--navy)", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Current Password</div>
            <div style={{ position:"relative" }}>
              <input type={showCur ? "text" : "password"} placeholder="••••••••"
                style={inputStyle(false)} value={currentPw} autoFocus
                onChange={e => { setCurrentPw(e.target.value); setError(""); }} />
              <EyeBtn show={showCur} toggle={() => setShowCur(v => !v)} />
            </div>
          </div>

          {/* New Password */}
          <div style={{ marginBottom:6 }}>
            <div style={{ fontSize:".78rem", fontWeight:700, color:"var(--navy)", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>New Password</div>
            <div style={{ position:"relative" }}>
              <input type={showNew ? "text" : "password"} placeholder="••••••••"
                style={inputStyle(false)} value={newPw}
                onChange={e => { setNewPw(e.target.value); setError(""); }} />
              <EyeBtn show={showNew} toggle={() => setShowNew(v => !v)} />
            </div>
          </div>

          {/* Strength meter */}
          {newPw && (
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex:1, height:3, borderRadius:2,
                    background: i <= strength.score ? strength.color : "var(--border)",
                    transition:"background .3s",
                  }} />
                ))}
              </div>
              <div style={{ fontSize:".72rem", color:strength.color, fontWeight:700 }}>{strength.label} password</div>
            </div>
          )}

          {/* Confirm Password */}
          <div style={{ marginBottom:4 }}>
            <div style={{ fontSize:".78rem", fontWeight:700, color:"var(--navy)", marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Confirm New Password</div>
            <div style={{ position:"relative" }}>
              <input type={showCon ? "text" : "password"} placeholder="••••••••"
                style={inputStyle(confirmPw && newPw !== confirmPw)} value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setError(""); }} />
              <EyeBtn show={showCon} toggle={() => setShowCon(v => !v)} />
            </div>
            {confirmPw && newPw !== confirmPw && (
              <div style={{ fontSize:".75rem", color:"var(--red)", marginTop:5, display:"flex", alignItems:"center", gap:4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                Passwords don't match
              </div>
            )}
          </div>

          {error && <div className="prf-modal-error">{error}</div>}
        </div>

        <div className="prf-modal-footer">
          <button className="prf-modal-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="prf-modal-submit" onClick={handleSubmit}
            disabled={submitting || !currentPw || !newPw || !confirmPw}>
            {submitting ? <><Spin /> Saving…</> : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function Profile({ onLogout }) {
  const navigate  = useNavigate();
  const cookies   = new Cookies();
  const token     = cookies.get("token");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user,       setUser]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [copied,     setCopied]     = useState(false);
  const [pinModal,      setPinModal]      = useState(false);
  const [pinModalMode,  setPinModalMode]  = useState("set"); // "set" | "reset"
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pwModal, setPwModal]       = useState(false);
  const [pwSuccess, setPwSuccess]   = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);



  const fetchMe = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(r.data.data);
    } catch (e) {
      if (e?.response?.status === 401) onLogout?.();
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMe(); }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.accountNumber || "");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handlePinSuccess = () => {
    setPinModal(false);
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 3500);
    fetchMe();
  };

  const handlePwSuccess = () => {
    setPwModal(false);
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 3500);
  };



  if (loading) return (
    <>
      <style>{style}</style>
      <div className="sidebar-overlay-bg" style={{ display: "none" }} />
      <div className="dash-layout">
        <Sidebar mobileOpen={false} onClose={() => {}} onLogout={() => setLogoutModal(true)}
          onNavigate={key => navigate("/" + key)} active="profile" />
        <main className="dash-main">
          <Topbar onMenuToggle={() => {}} />
          <div className="dash-content">
            <PageLoader message="Loading your profile…" />
          </div>
        </main>
      </div>
    </>
  );

  const hasPin = user?.hasTransactionPin;
  const roles  = Array.isArray(user?.roles) ? user.roles : [user?.roles || "user"];

  return (
    <>
      <style>{style}</style>

      {/* PIN modal */}
      {pinModal && (
        <PinModal
          hasPin={hasPin}
          mode={pinModalMode}
          token={token}
          onClose={() => setPinModal(false)}
          onSuccess={handlePinSuccess}
        />
      )}

      {/* Change Password Modal */}
      {pwModal && (
        <ChangePasswordModal
          token={token}
          onClose={() => setPwModal(false)}
          onSuccess={handlePwSuccess}
        />
      )}



      {/* Logout Confirmation Modal */}
      {logoutModal && (
        <LogoutModal
          onConfirm={() => {
            setLogoutModal(false);
            new Cookies().remove("token", { path: "/" });
            window.location.replace("/login");
          }}
          onCancel={() => setLogoutModal(false)}
        />
      )}

      {/* Success toast */}
      {pinSuccess && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9998,
          background: "#16a34a", color: "white", borderRadius: 12,
          padding: "13px 20px", fontSize: ".88rem", fontWeight: 700,
          boxShadow: "0 8px 24px rgba(22,163,74,.35)",
          display: "flex", alignItems: "center", gap: 8,
          animation: "pmSlideUp .3s ease",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Transaction PIN {pinModalMode === "reset" ? "reset" : "set"} successfully
        </div>
      )}

      {pwSuccess && (
        <div style={{
          position:"fixed", bottom:28, right:28, zIndex:9998,
          background:"#2563eb", color:"white", borderRadius:12,
          padding:"13px 20px", fontSize:".88rem", fontWeight:700,
          boxShadow:"0 8px 24px rgba(37,99,235,.35)",
          display:"flex", alignItems:"center", gap:8,
          animation:"pmSlideUp .3s ease",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Password changed successfully
        </div>
      )}



      <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />

      <div className="dash-layout">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={() => setLogoutModal(true)}
          onNavigate={key => navigate("/" + key)} active="profile" />

        <main className="dash-main">
          <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />

          <div className="dash-content">
            <div className="prf-page">

              {/* ── Hero ── */}
              <div className="prf-hero">
                <div className="prf-hero-top">
                  <div className="prf-avatar">{initials(user?.fullName)}</div>
                  <div className="prf-hero-info">
                    <div className="prf-hero-name">{user?.fullName}</div>
                    <div className="prf-hero-email">{user?.email}</div>
                    <span className="prf-role-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {roles.includes("admin") ? "Administrator" : "Account Holder"}
                    </span>
                  </div>
                </div>
                <div className="prf-acct-strip">
                  <div>
                    <div className="prf-acct-label">Account Number</div>
                    <div className="prf-acct-num">{user?.accountNumber}</div>
                  </div>
                  <button className={`prf-copy-btn${copied ? " copied" : ""}`} onClick={handleCopy}>
                    {copied ? <>{svg_check} Copied</> : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Balances ── */}
              <div className="prf-balances">
                <div className="prf-bal-card">
                  <div className="prf-bal-icon" style={{ background: "#eff6ff" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
                  <div>
                    <div className="prf-bal-label">Account Balance</div>
                    <div className="prf-bal-value" style={{ color: "var(--navy)" }}>{fmt(user?.balance)}</div>
                  </div>
                </div>
                <div className="prf-bal-card">
                  <div className="prf-bal-icon" style={{ background: "#f0fdf4" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></div>
                  <div>
                    <div className="prf-bal-label">Savings Balance</div>
                    <div className="prf-bal-value" style={{ color: "var(--green)" }}>{fmt(user?.savingsBalance)}</div>
                  </div>
                </div>
              </div>

              {/* ── Savings & Interest ── */}
              <div className="prf-section">
                <div className="prf-section-header">
                  <div className="prf-section-title">
                    <div className="prf-section-icon" style={{ background: "#f0fdf4" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
                    Savings & Interest
                  </div>
                </div>

                <div className="prf-info-row">
                  <span className="prf-info-lbl">Total Interest Earned</span>
                  <span className="prf-info-val green">{fmt(user?.totalInterestEarned)}</span>
                </div>

                <div className="prf-info-row" style={{ borderBottom: user?.interestStatus === "eligible" ? "1px solid var(--border)" : "none" }}>
                  <span className="prf-info-lbl">Interest Eligibility</span>
                  <span className="prf-info-val">
                    {user?.interestStatus === "eligible" ? (
                      <span className="prf-status" style={{ background: "#dcfce7", color: "#15803d" }}>
                        <span className="prf-status-dot" style={{ background: "#15803d" }} /> Eligible
                      </span>
                    ) : (
                      <span className="prf-status" style={{ background: "#f1f5f9", color: "var(--muted)" }}>
                        <span className="prf-status-dot" style={{ background: "var(--muted)" }} /> Not Eligible
                      </span>
                    )}
                  </span>
                </div>

                {user?.interestStatus === "eligible" && user?.nextInterestPayment && (
                  <div style={{ padding: "16px 22px" }}>
                    <div className="prf-interest-card">
                      <div className="prf-interest-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                      <div>
                        <div className="prf-interest-label">Next Interest Payment</div>
                        <div className="prf-interest-value">
                          {new Date(user.nextInterestPayment.estimatedDate).toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" })}
                        </div>
                        <div className="prf-interest-sub">
                          {user.nextInterestPayment.daysUntil === 1
                            ? "Tomorrow!"
                            : `In ${user.nextInterestPayment.daysUntil} days`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Account Info ── */}
              <div className="prf-section">
                <div className="prf-section-header">
                  <div className="prf-section-title">
                    <div className="prf-section-icon" style={{ background: "#eff6ff" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                    Account Information
                  </div>
                </div>
                <div className="prf-info-row">
                  <span className="prf-info-lbl">Full Name</span>
                  <span className="prf-info-val">{user?.fullName}</span>
                </div>
                <div className="prf-info-row">
                  <span className="prf-info-lbl">Email Address</span>
                  <span className="prf-info-val">{user?.email}</span>
                </div>
                <div className="prf-info-row">
                  <span className="prf-info-lbl">Account Number</span>
                  <span className="prf-info-val mono navy">{user?.accountNumber}</span>
                </div>
                <div className="prf-info-row">
                  <span className="prf-info-lbl">Account Role</span>
                  <span className="prf-info-val" style={{ textTransform: "capitalize" }}>
                    {roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")}
                  </span>
                </div>
              </div>

              {/* ── Security ── */}
              <div className="prf-section">
                <div className="prf-section-header">
                  <div className="prf-section-title">
                    <div className="prf-section-icon" style={{ background: "#fef3c7" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                    Security
                  </div>
                </div>
                {/* Transaction PIN row */}
                <div className="prf-pin-row" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="prf-pin-left">
                    <div className="prf-pin-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></div>
                    <div>
                      <div className="prf-pin-title">Transaction PIN</div>
                      <div className="prf-pin-sub">
                        {hasPin
                          ? "PIN is active. Used for transfers & payments."
                          : "No PIN set — required for transfers and payments."}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {hasPin && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "#dcfce7", color: "#15803d", fontSize: ".72rem", fontWeight: 700 }}>
                        ✓ Set
                      </span>
                    )}
                    <button
                      className={`prf-pin-btn${hasPin ? " set" : ""}`}
                      onClick={() => { setPinModalMode(hasPin ? "reset" : "set"); setPinModal(true); }}
                    >
                      {hasPin ? "Reset PIN" : "Set PIN"}
                    </button>
                  </div>
                </div>

                {/* Reset Password row */}
                <div className="prf-pin-row">
                  <div className="prf-pin-left">
                    <div className="prf-pin-icon" style={{ background: "#eff6ff" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                    <div>
                      <div className="prf-pin-title">Password</div>
                      <div className="prf-pin-sub">Change your account login password.</div>
                    </div>
                  </div>
                  <button
                    className="prf-pin-btn"
                    onClick={() => setPwModal(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* ── Member since strip ── */}
              <div className="prf-member-strip">
                <div className="prf-member-left">
                  <span className="prf-member-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                  <div>
                    <div className="prf-member-label">Member Since</div>
                    <div className="prf-member-value">{fmtDate(user?.createdAt)}</div>
                  </div>
                </div>
                <span className="prf-member-badge">Active Account</span>
              </div>

              {/* ── Admin Panel (admin only) ── */}
              {roles.includes("admin") && (
                <div className="prf-section" style={{ marginBottom: 16 }}>
                  <div className="prf-section-header">
                    <div className="prf-section-title" style={{ color: "var(--blue)" }}>
                      <div className="prf-section-icon" style={{ background: "#eff6ff" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                        </svg>
                      </div>
                      Administration
                    </div>
                  </div>
                  <div style={{ padding: "16px 22px" }}>
                    <button
                      className="prf-admin-btn"
                      onClick={() => navigate("/admin")}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                      </svg>
                      Go to Admin Panel
                    </button>
                  </div>
                </div>
              )}

              {/* ── Danger zone ── */}
              <div className="prf-section">
                <div className="prf-section-header">
                  <div className="prf-section-title" style={{ color: "var(--red)" }}>
                    <div className="prf-section-icon" style={{ background: "#fef2f2" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                    Danger Zone
                  </div>
                </div>
                <div style={{ padding: "16px 22px" }}>
                  <button className="prf-danger-btn" onClick={() => setLogoutModal(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out of Account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}