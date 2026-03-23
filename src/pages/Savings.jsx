import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { getTokenData } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #1b3a6b; --navy-dark: #122850; --blue: #2563eb;
    --green: #16a34a; --green-light: #f0fdf4; --green-mid: #dcfce7;
    --red: #ef4444; --amber: #d97706;
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
  @keyframes spin { to { transform: rotate(360deg); } }
  .sv-spin { width:16px; height:16px; border:2.5px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; flex-shrink:0; }

  /* ══════════════════════════
     SAVINGS PAGE
  ══════════════════════════ */
  .sv-page { max-width: 860px; margin: 0 auto; }

  /* ── Hero balance card ── */
  .sv-hero {
    background: var(--navy);
    border-radius: 22px;
    padding: 36px 36px 30px;
    margin-bottom: 20px;
    position: relative; overflow: hidden;
  }
  .sv-hero::before {
    content: ''; position: absolute;
    width: 340px; height: 340px; border-radius: 50%;
    background: rgba(255,255,255,.04);
    top: -120px; right: -80px; pointer-events: none;
  }
  .sv-hero::after {
    content: ''; position: absolute;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(255,255,255,.03);
    bottom: -60px; left: 40px; pointer-events: none;
  }
  .sv-hero-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 16px;
    margin-bottom: 28px; position: relative; z-index: 1;
    flex-wrap: wrap;
  }
  .sv-hero-label {
    font-size: .72rem; font-weight: 700; color: rgba(255,255,255,.5);
    text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .sv-hero-balance {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 2.8rem);
    font-weight: 700; color: white; line-height: 1;
    margin-bottom: 6px;
  }
  .sv-hero-sub { font-size: .82rem; color: rgba(255,255,255,.45); }

  .sv-hero-actions { display: flex; gap: 10px; flex-shrink: 0; }
  .sv-action-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 18px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: .84rem; font-weight: 700;
    cursor: pointer; transition: all .18s; border: none; white-space: nowrap;
  }
  .sv-action-deposit {
    background: white; color: var(--navy);
  }
  .sv-action-deposit:hover { background: #f0fdf4; }
  .sv-action-withdraw {
    background: rgba(255,255,255,.12);
    border: 1.5px solid rgba(255,255,255,.2) !important;
    color: white;
  }
  .sv-action-withdraw:hover { background: rgba(255,255,255,.2); }

  /* Stats strip in hero */
  .sv-hero-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: rgba(255,255,255,.08);
    border-radius: 14px; overflow: hidden;
    position: relative; z-index: 1;
  }
  .sv-hero-stat {
    padding: 16px 20px; background: rgba(255,255,255,.05);
    transition: background .15s;
  }
  .sv-hero-stat:hover { background: rgba(255,255,255,.09); }
  .sv-stat-label { font-size: .68rem; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 5px; }
  .sv-stat-value { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: white; }
  .sv-stat-value.green { color: #86efac; }
  .sv-stat-value.amber { color: #fcd34d; }

  /* ── Interest countdown card ── */
  .sv-interest-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; padding: 20px 24px;
    display: flex; align-items: center; gap: 18px;
    margin-bottom: 20px;
    transition: box-shadow .2s;
  }
  .sv-interest-card:hover { box-shadow: 0 4px 20px rgba(27,58,107,.07); }
  .sv-interest-icon-wrap {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #eff6ff, #f5f3ff);
    border: 1px solid #dbeafe;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sv-interest-info { flex: 1; min-width: 0; }
  .sv-interest-title { font-size: .88rem; font-weight: 700; color: var(--navy); margin-bottom: 3px; }
  .sv-interest-sub   { font-size: .78rem; color: var(--muted); }
  .sv-interest-right { text-align: right; flex-shrink: 0; }
  .sv-interest-date  { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: var(--navy); }
  .sv-days-badge {
    display: inline-block; margin-top: 4px;
    padding: 3px 10px; border-radius: 20px;
    background: #ede9fe; color: #6d28d9;
    font-size: .72rem; font-weight: 700;
  }

  /* ── History section ── */
  .sv-section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .sv-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 700; color: var(--navy);
  }
  .sv-view-all {
    font-size: .8rem; font-weight: 700; color: var(--blue);
    background: none; border: none; cursor: pointer;
    text-decoration: none; transition: color .15s; padding: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .sv-view-all:hover { color: var(--navy); }

  .sv-history-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }

  .sv-tx-row {
    display: flex; align-items: center; gap: 14px;
    padding: 15px 22px; border-bottom: 1px solid var(--border);
    transition: background .15s; cursor: default;
  }
  .sv-tx-row:last-child { border-bottom: none; }
  .sv-tx-row:hover { background: #f8fafc; }
  .sv-tx-icon {
    width: 40px; height: 40px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sv-tx-info { flex: 1; min-width: 0; }
  .sv-tx-desc { font-size: .86rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sv-tx-date { font-size: .72rem; color: var(--muted); margin-top: 2px; }
  .sv-tx-amount { font-family: 'Playfair Display', serif; font-size: .95rem; font-weight: 700; text-align: right; white-space: nowrap; }
  .sv-tx-amount.credit { color: var(--green); }
  .sv-tx-amount.debit  { color: var(--red); }

  .sv-type-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: .65rem; font-weight: 700; white-space: nowrap;
  }

  .sv-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; padding: 52px 24px; text-align: center; color: var(--muted);
  }
  .sv-empty-icon {
    width: 56px; height: 56px; border-radius: 50%; background: var(--bg);
    display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
  }
  .sv-empty-title { font-weight: 700; font-size: .9rem; color: var(--navy); }
  .sv-empty-sub   { font-size: .8rem; max-width: 240px; line-height: 1.6; }

  /* ── Modal shared ── */
  .sv-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.52);
    backdrop-filter: blur(4px); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px; animation: svFadeIn .2s ease;
  }
  @keyframes svFadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes svSlideUp { from{opacity:0;transform:translateY(22px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

  .sv-modal {
    background: white; border-radius: 22px;
    width: 100%; max-width: 420px;
    box-shadow: 0 24px 72px rgba(0,0,0,.2);
    overflow: hidden;
    animation: svSlideUp .25s cubic-bezier(.34,1.56,.64,1);
  }

  .sv-modal-header {
    padding: 28px 28px 20px; text-align: center;
  }
  .sv-modal-icon-wrap {
    width: 64px; height: 64px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
  }
  .sv-modal-title { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
  .sv-modal-sub   { font-size: .82rem; color: var(--muted); }

  .sv-modal-divider { height: 1px; background: var(--border); margin: 0 28px; }
  .sv-modal-body { padding: 22px 28px 4px; }

  /* Amount input */
  .sv-amount-label {
    font-size: .72rem; font-weight: 700; color: var(--navy);
    text-transform: uppercase; letter-spacing: .07em; margin-bottom: 8px;
  }
  .sv-amount-wrap { position: relative; margin-bottom: 14px; }
  .sv-amount-prefix {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700;
    color: var(--muted); pointer-events: none;
  }
  .sv-amount-input {
    width: 100%; padding: 13px 14px 13px 32px;
    border: 1.5px solid var(--border); border-radius: 11px;
    font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700;
    color: var(--navy); background: #f8fafc; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .sv-amount-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.09); background: white; }
  .sv-amount-input.error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(239,68,68,.09); }

  /* Quick chips */
  .sv-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 16px; }
  .sv-chip {
    padding: 5px 12px; border-radius: 20px;
    border: 1.5px solid var(--border); background: var(--bg);
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 700;
    color: var(--muted); cursor: pointer; transition: all .15s;
  }
  .sv-chip:hover   { border-color: var(--navy); color: var(--navy); }
  .sv-chip.active  { background: var(--navy); border-color: var(--navy); color: white; }

  /* Note input */
  .sv-note-input {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid var(--border); border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: .86rem; color: var(--text);
    background: #f8fafc; outline: none; resize: none;
    transition: border-color .2s, box-shadow .2s; margin-bottom: 14px;
  }
  .sv-note-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.09); background: white; }

  /* Balance preview */
  .sv-balance-preview {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 10px; padding: 11px 14px;
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 4px;
  }
  .sv-bal-preview-label { font-size: .78rem; color: var(--muted); }
  .sv-bal-preview-val   { font-family: 'Playfair Display', serif; font-size: .95rem; font-weight: 700; color: var(--navy); }

  .sv-modal-error {
    background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; border-radius: 9px; padding: 10px 14px;
    font-size: .82rem; font-weight: 600; text-align: center; margin-top: 14px;
  }

  .sv-modal-footer { padding: 16px 28px 24px; display: flex; gap: 10px; }
  .sv-modal-cancel {
    flex: 1; padding: 13px; border: 1.5px solid var(--border);
    border-radius: 11px; background: white; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 600;
    color: var(--text); transition: all .18s;
  }
  .sv-modal-cancel:hover { border-color: var(--navy); }
  .sv-modal-confirm {
    flex: 1.6; padding: 13px; border: none;
    border-radius: 11px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 700;
    color: white; transition: opacity .18s, transform .18s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .sv-modal-confirm:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
  .sv-modal-confirm:disabled { opacity: .55; cursor: not-allowed; }

  /* ── Success modal ── */
  .sv-success-body {
    padding: 36px 28px 8px; text-align: center;
  }
  .sv-success-icon {
    width: 72px; height: 72px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  .sv-success-amount {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem; font-weight: 700; margin-bottom: 6px;
  }
  .sv-success-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--navy); margin-bottom: 6px; }
  .sv-success-sub   { font-size: .84rem; color: var(--muted); margin-bottom: 20px; }
  .sv-success-detail {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px; margin-bottom: 24px; text-align: left;
  }
  .sv-success-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid var(--border); font-size: .83rem; }
  .sv-success-row:last-child { border-bottom: none; }
  .sv-success-lbl { color: var(--muted); }
  .sv-success-val { font-weight: 700; color: var(--text); }
  .sv-success-footer { padding: 0 28px 28px; }
  .sv-success-btn {
    width: 100%; padding: 13px; background: var(--navy); color: white;
    border: none; border-radius: 11px; font-family: 'DM Sans', sans-serif;
    font-size: .9rem; font-weight: 700; cursor: pointer; transition: background .18s;
  }
  .sv-success-btn:hover { background: var(--navy-dark); }

  /* Responsive */
  @media (max-width: 768px) {
    .bos-sidebar { transform: translateX(-100%); width: 280px; }
    .dash-main { margin-left: 0; }
    .sidebar-overlay-bg { display: block; }
    .topbar-hamburger { display: flex; }
    .bos-topbar { padding: 0 16px; height: 60px; }
    .topbar-name { display: none; }
    .dash-content { padding: 14px 14px 40px; }
    .sv-hero { padding: 24px 20px 20px; }
    .sv-hero-stats { grid-template-columns: 1fr 1fr; }
    .sv-hero-stats > :last-child { grid-column: 1 / -1; }
    .sv-hero-top { flex-direction: column; }
    .sv-hero-actions { width: 100%; }
    .sv-action-btn { flex: 1; justify-content: center; }
  }
  @media (max-width: 480px) {
    .sv-hero-stats { grid-template-columns: 1fr; }
    .sv-hero-stats > :last-child { grid-column: auto; }
    .sv-chips { gap: 5px; }
    .sv-chip { font-size: .7rem; padding: 4px 10px; }
  }
`;

/* ── Helpers ─────────────────────────────────────────────────── */
const API = "https://bank-web-app-eight.vercel.app/api/v1";
const fmt = (n) => "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });

const DEPOSIT_CHIPS  = [1000, 5000, 10000, 20000, 50000];
const WITHDRAW_CHIPS = [1000, 5000, 10000, 20000, 50000];

const TYPE_META = {
  "Savings Deposit":    { bg: "#f0fdf4", color: "#16a34a", badgeBg: "#dcfce7", badgeColor: "#15803d" },
  "Savings Withdrawal": { bg: "#fef2f2", color: "#ef4444", badgeBg: "#fee2e2", badgeColor: "#dc2626" },
  "Savings Interest":   { bg: "#f5f3ff", color: "#7c3aed", badgeBg: "#ede9fe", badgeColor: "#6d28d9" },
};
const getMeta = (type) => TYPE_META[type] || { bg: "#f1f5f9", color: "#64748b", badgeBg: "#e2e8f0", badgeColor: "#475569" };

/* ── SVG icons ── */
const IconDeposit = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
);
const IconWithdraw = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
);
const IconStar = ({ size = 22, color = "#7c3aed" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconClock = ({ size = 22, color = "#7c3aed" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCheck = ({ size = 32, color = "#16a34a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconBank = ({ size = 22, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
  </svg>
);

/* ── Transaction type icon ── */
function TxIcon({ type }) {
  const m = getMeta(type);
  if (type === "Savings Interest") return (
    <div className="sv-tx-icon" style={{ background: m.bg }}>
      <IconStar size={18} color={m.color} />
    </div>
  );
  if (type === "Savings Withdrawal") return (
    <div className="sv-tx-icon" style={{ background: m.bg }}>
      <IconWithdraw size={18} color={m.color} />
    </div>
  );
  return (
    <div className="sv-tx-icon" style={{ background: m.bg }}>
      <IconDeposit size={18} color={m.color} />
    </div>
  );
}

/* ── Success Modal ───────────────────────────────────────────── */
function SuccessModal({ result, mode, onClose }) {
  const isDeposit = mode === "deposit";
  return (
    <div className="sv-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sv-modal">
        <div className="sv-success-body">
          <div className="sv-success-icon" style={{ background: isDeposit ? "#f0fdf4" : "#fef2f2" }}>
            <IconCheck size={32} color={isDeposit ? "#16a34a" : "#ef4444"} />
          </div>
          <div className="sv-success-amount" style={{ color: isDeposit ? "#16a34a" : "#ef4444" }}>
            {isDeposit ? "+" : "-"}{fmt(result?.amount)}
          </div>
          <div className="sv-success-title">{isDeposit ? "Deposit Successful!" : "Withdrawal Successful!"}</div>
          <div className="sv-success-sub">
            {isDeposit
              ? "Your savings balance has been updated."
              : "Funds have been returned to your main account."}
          </div>
          <div className="sv-success-detail">
            <div className="sv-success-row">
              <span className="sv-success-lbl">Type</span>
              <span className="sv-success-val">{isDeposit ? "Savings Deposit" : "Savings Withdrawal"}</span>
            </div>
            <div className="sv-success-row">
              <span className="sv-success-lbl">Amount</span>
              <span className="sv-success-val" style={{ color: isDeposit ? "#16a34a" : "#ef4444" }}>
                {isDeposit ? "+" : "-"}{fmt(result?.amount)}
              </span>
            </div>
            <div className="sv-success-row">
              <span className="sv-success-lbl">New Savings Balance</span>
              <span className="sv-success-val" style={{ color: "var(--navy)", fontFamily: "'Playfair Display',serif" }}>
                {fmt(result?.newSavingsBalance ?? result?.savingsBalance)}
              </span>
            </div>
            {result?.note && (
              <div className="sv-success-row">
                <span className="sv-success-lbl">Note</span>
                <span className="sv-success-val">{result.note}</span>
              </div>
            )}
          </div>
        </div>
        <div className="sv-success-footer">
          <button className="sv-success-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

/* ── Deposit / Withdraw Modal ────────────────────────────────── */
function ActionModal({ mode, savingsBalance, mainBalance, token, onClose, onSuccess }) {
  const isDeposit = mode === "deposit";
  const [amount,  setAmount]  = useState("");
  const [note,    setNote]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const chips = isDeposit ? DEPOSIT_CHIPS : WITHDRAW_CHIPS;
  const maxBalance = isDeposit ? mainBalance : savingsBalance;
  const parsed = parseFloat(amount) || 0;
  const afterBalance = isDeposit
    ? (savingsBalance || 0) + parsed
    : (savingsBalance || 0) - parsed;

  const handleChip = (val) => {
    setAmount(String(val)); setError("");
  };

  const validate = () => {
    if (!parsed || parsed <= 0) return "Enter a valid amount.";
    if (parsed < 100) return "Minimum amount is ₦100.";
    if (parsed > maxBalance) return isDeposit
      ? "Insufficient account balance."
      : "Insufficient savings balance.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      const endpoint = isDeposit
        ? `${API}/savings/deposit`
        : `${API}/savings/withdraw`;
      const r = await axios.post(
        endpoint,
        { amount: parsed, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess({ ...r.data.data, amount: parsed, note });
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || "Transaction failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="sv-backdrop" onClick={e => e.target === e.currentTarget && !loading && onClose()}>
      <div className="sv-modal">
        <div className="sv-modal-header">
          <div className="sv-modal-icon-wrap" style={{ background: isDeposit ? "#f0fdf4" : "#fef2f2" }}>
            {isDeposit
              ? <IconDeposit size={26} color="#16a34a" />
              : <IconWithdraw size={26} color="#ef4444" />}
          </div>
          <div className="sv-modal-title">{isDeposit ? "Deposit to Savings" : "Withdraw from Savings"}</div>
          <div className="sv-modal-sub">
            {isDeposit
              ? `Available: ${fmt(mainBalance)}`
              : `Savings balance: ${fmt(savingsBalance)}`}
          </div>
        </div>

        <div className="sv-modal-divider" />

        <div className="sv-modal-body">
          {/* Amount */}
          <div className="sv-amount-label">Amount</div>
          <div className="sv-amount-wrap">
            <span className="sv-amount-prefix">₦</span>
            <input
              className={`sv-amount-input${error ? " error" : ""}`}
              type="number" min="0" placeholder="0.00"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(""); }}
              autoFocus
            />
          </div>

          {/* Quick chips */}
          <div className="sv-chips">
            {chips.map(c => (
              <button
                key={c}
                className={`sv-chip${parseFloat(amount) === c ? " active" : ""}`}
                onClick={() => handleChip(c)}
              >
                {fmt(c).replace(".00", "")}
              </button>
            ))}
          </div>

          {/* Note */}
          <div className="sv-amount-label">Note (optional)</div>
          <textarea
            className="sv-note-input"
            rows={2}
            placeholder="Add a note…"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          {/* Balance preview */}
          {parsed > 0 && (
            <div className="sv-balance-preview">
              <span className="sv-bal-preview-label">Savings balance after</span>
              <span className="sv-bal-preview-val" style={{ color: afterBalance < 0 ? "var(--red)" : "var(--navy)" }}>
                {fmt(Math.max(0, afterBalance))}
              </span>
            </div>
          )}

          {error && <div className="sv-modal-error">{error}</div>}
        </div>

        <div className="sv-modal-footer">
          <button className="sv-modal-cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="sv-modal-confirm"
            style={{ background: isDeposit ? "var(--green)" : "var(--red)" }}
            onClick={handleSubmit}
            disabled={loading || !parsed || parsed <= 0}
          >
            {loading
              ? <><span className="sv-spin" />Processing…</>
              : (isDeposit ? "Deposit" : "Withdraw")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function Savings() {
  const navigate  = useNavigate();
  const cookies   = new Cookies();
  const token     = cookies.get("token");
  const { roles: userRole } = getTokenData();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [data,       setData]       = useState(null);
  const [mainBal,    setMainBal]    = useState(0);
  const [loading,    setLoading]    = useState(true);

  /* modal state */
  const [modal,      setModal]      = useState(null); // "deposit" | "withdraw" | null
  const [success,    setSuccess]    = useState(null); // { mode, result }

  const handleLogout = () => { new Cookies().remove("token", { path: "/" }); window.location.replace("/login"); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [savRes, dashRes] = await Promise.all([
        axios.get(`${API}/savings/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/dashboard`,        { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setData(savRes.data.data);
      setMainBal(dashRes.data.data?.totalBalance ?? 0);
    } catch (e) {
      if (e?.response?.status === 401) handleLogout();
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSuccess = (mode, result) => {
    setModal(null);
    setSuccess({ mode, result });
    fetchData(); // refresh balances and history
  };

  const fullName = data ? "" : ""; // topbar gets from dashboard

  /* skeleton */
  if (loading) return (
    <>
      <style>{style}</style>
      <div className="dash-layout">
        <div className="bos-sidebar" />
        <main className="dash-main">
          <div className="bos-topbar" />
          <div className="dash-content">
            <div className="sv-page">
              <div className="skeleton" style={{ height: 200, borderRadius: 22, marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 80, borderRadius: 16, marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
            </div>
          </div>
        </main>
      </div>
    </>
  );

  const history = data?.savingsHistory || [];
  const nextPayment = data?.nextInterestPayment;

  return (
    <>
      <style>{style}</style>

      {/* Action modal */}
      {modal && (
        <ActionModal
          mode={modal}
          savingsBalance={data?.savingsBalance}
          mainBalance={mainBal}
          token={token}
          onClose={() => setModal(null)}
          onSuccess={(result) => handleSuccess(modal, result)}
        />
      )}

      {/* Success modal */}
      {success && (
        <SuccessModal
          mode={success.mode}
          result={success.result}
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />

      <div className="dash-layout">
        <Sidebar
          mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)}
          onLogout={handleLogout} onNavigate={key => navigate("/" + key)}
          active="savings"
        />

        <main className="dash-main">
          <Topbar
            onMenuToggle={() => setMobileOpen(o => !o)}
          />

          <div className="dash-content">
            <div className="sv-page">

              {/* ── Hero ── */}
              <div className="sv-hero">
                <div className="sv-hero-top">
                  <div>
                    <div className="sv-hero-label">
                      <IconBank size={13} color="rgba(255,255,255,.5)" />
                      Savings Account
                    </div>
                    <div className="sv-hero-balance">{fmt(data?.savingsBalance)}</div>
                    <div className="sv-hero-sub">Total savings balance</div>
                  </div>
                  <div className="sv-hero-actions">
                    <button className="sv-action-btn sv-action-deposit" onClick={() => setModal("deposit")}>
                      <IconDeposit size={16} color="var(--navy)" /> Deposit
                    </button>
                    <button className="sv-action-btn sv-action-withdraw" onClick={() => setModal("withdraw")}>
                      <IconWithdraw size={16} color="white" /> Withdraw
                    </button>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="sv-hero-stats">
                  <div className="sv-hero-stat">
                    <div className="sv-stat-label">Total Interest Earned</div>
                    <div className="sv-stat-value green">{fmt(data?.totalInterestEarned)}</div>
                  </div>
                  <div className="sv-hero-stat">
                    <div className="sv-stat-label">Next Interest In</div>
                    <div className="sv-stat-value amber">
                      {nextPayment?.daysUntil === 1 ? "Tomorrow" : `${nextPayment?.daysUntil} days`}
                    </div>
                  </div>
                  <div className="sv-hero-stat">
                    <div className="sv-stat-label">Main Account Balance</div>
                    <div className="sv-stat-value">{fmt(mainBal)}</div>
                  </div>
                </div>
              </div>

              {/* ── Interest countdown ── */}
              {nextPayment && (
                <div className="sv-interest-card">
                  <div className="sv-interest-icon-wrap">
                    <IconClock size={22} color="#7c3aed" />
                  </div>
                  <div className="sv-interest-info">
                    <div className="sv-interest-title">Next Interest Payment</div>
                    <div className="sv-interest-sub">
                      Monthly interest will be credited to your savings balance
                    </div>
                  </div>
                  <div className="sv-interest-right">
                    <div className="sv-interest-date">
                      {new Date(nextPayment.estimatedDate).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    <span className="sv-days-badge">
                      {nextPayment.daysUntil === 1 ? "Tomorrow!" : `In ${nextPayment.daysUntil} days`}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Savings history ── */}
              <div className="sv-section-head">
                <div className="sv-section-title">Recent Savings Activity</div>
                <button className="sv-view-all" onClick={() => navigate("/transactions")}>
                  View all →
                </button>
              </div>

              <div className="sv-history-card">
                {history.length === 0 ? (
                  <div className="sv-empty">
                    <div className="sv-empty-icon">
                      <IconBank size={24} color="var(--muted)" />
                    </div>
                    <div className="sv-empty-title">No savings activity yet</div>
                    <div className="sv-empty-sub">Make your first deposit to start growing your savings.</div>
                  </div>
                ) : history.map((tx, i) => {
                  const m = getMeta(tx.type);
                  const credit = tx.isPositive;
                  return (
                    <div className="sv-tx-row" key={i}>
                      <TxIcon type={tx.type} />
                      <div className="sv-tx-info">
                        <div className="sv-tx-desc">{tx.description || tx.type}</div>
                        <div className="sv-tx-date">{tx.date}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span className={`sv-tx-amount ${credit ? "credit" : "debit"}`}>
                          {tx.formattedAmount}
                        </span>
                        <span className="sv-type-badge" style={{ background: m.badgeBg, color: m.badgeColor }}>
                          {tx.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}