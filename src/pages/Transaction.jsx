import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { getTokenData } from "../auth/auth";
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

  /* ══════════════════════════════
     TRANSACTIONS PAGE
  ══════════════════════════════ */

  .txh-page { max-width: 900px; margin: 0 auto; }

  /* Page header */
  .txh-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 14px; }
  .txh-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
  .txh-sub   { font-size: .84rem; color: var(--muted); }

  /* Summary strip */
  .txh-summary-strip {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 14px; margin-bottom: 24px;
  }
  .txh-summary-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 14px; padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
    transition: box-shadow .2s;
  }
  .txh-summary-card:hover { box-shadow: 0 4px 16px rgba(27,58,107,.08); }
  .txh-summary-icon {
    width: 42px; height: 42px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 1.1rem;
  }
  .txh-summary-label { font-size: .72rem; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 3px; }
  .txh-summary-value { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; }

  /* Controls bar */
  .txh-controls {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 14px; padding: 16px 20px;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 16px; flex-wrap: wrap;
  }
  .txh-search-wrap { position: relative; flex: 1; min-width: 180px; }
  .txh-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); display: flex; pointer-events: none; }
  .txh-search {
    width: 100%; padding: 9px 12px 9px 36px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: .88rem;
    color: var(--text); background: var(--bg); outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .txh-search:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.09); background: white; }
  .txh-search::placeholder { color: var(--muted); }

  /* Filter tabs */
  .txh-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  .txh-tab {
    padding: 7px 14px; border-radius: 20px;
    border: 1.5px solid var(--border); background: var(--bg);
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 600;
    color: var(--muted); cursor: pointer; transition: all .15s; white-space: nowrap;
  }
  .txh-tab:hover    { border-color: var(--navy); color: var(--navy); }
  .txh-tab.active   { background: var(--navy); border-color: var(--navy); color: white; }

  /* Sort select */
  .txh-sort {
    padding: 8px 12px; border: 1.5px solid var(--border);
    border-radius: 9px; font-family: 'DM Sans', sans-serif;
    font-size: .82rem; font-weight: 600; color: var(--text);
    background: var(--bg); outline: none; cursor: pointer;
    transition: border-color .2s;
  }
  .txh-sort:focus { border-color: var(--blue); }

  /* Table card */
  .txh-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
  }
  .txh-card-header {
    padding: 16px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .txh-card-title { font-size: .9rem; font-weight: 700; color: var(--navy); }
  .txh-count-badge {
    background: var(--bg); border: 1px solid var(--border);
    padding: 3px 10px; border-radius: 20px;
    font-size: .72rem; font-weight: 700; color: var(--muted);
  }

  /* Desktop table */
  .txh-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .txh-table { width: 100%; border-collapse: collapse; min-width: 560px; }
  .txh-table th {
    font-size: .68rem; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: .07em;
    padding: 11px 18px; border-bottom: 1px solid var(--border);
    text-align: left; background: #f8fafc; white-space: nowrap;
  }
  .txh-table td { padding: 0; border-bottom: 1px solid var(--border); }
  .txh-table tr:last-child td { border-bottom: none; }

  /* Clickable row */
  .txh-row {
    display: table-row;
    cursor: pointer;
    transition: background .15s;
  }
  .txh-row:hover td { background: #f8fafc; }
  .txh-row td { padding: 13px 18px; vertical-align: middle; }

  .txh-row-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: .95rem; flex-shrink: 0;
  }
  .txh-row-desc { font-size: .86rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
  .txh-row-sub  { font-size: .72rem; color: var(--muted); margin-top: 2px; }

  .txh-type-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: .68rem; font-weight: 700; white-space: nowrap;
  }
  .txh-type-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  .txh-amount { font-family: 'Playfair Display', serif; font-weight: 700; font-size: .92rem; white-space: nowrap; }
  .txh-amount.credit { color: var(--green); }
  .txh-amount.debit  { color: var(--red); }

  .txh-bal-after { font-size: .8rem; font-weight: 600; color: var(--navy); font-family: 'Playfair Display', serif; }

  .txh-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 20px;
    font-size: .68rem; font-weight: 700;
  }

  /* Chevron hint */
  .txh-date-cell { display: flex; flex-direction: column; gap: 2px; }
  .txh-date-main { font-size: .82rem; color: var(--text); font-weight: 600; white-space: nowrap; }
  .txh-date-time { font-size: .72rem; color: var(--muted); white-space: nowrap; }
  .txh-chevron { color: var(--border); transition: color .15s; }
  .txh-row:hover .txh-chevron { color: var(--muted); }

  /* Mobile list */
  .txh-mobile-list { display: none; flex-direction: column; }
  .txh-mobile-row {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background .15s;
  }
  .txh-mobile-row:last-child { border-bottom: none; }
  .txh-mobile-row:hover { background: #f8fafc; }
  .txh-mobile-info { flex: 1; min-width: 0; }
  .txh-mobile-desc { font-size: .86rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .txh-mobile-meta { display: flex; align-items: center; gap: 8px; margin-top: 3px; flex-wrap: wrap; }
  .txh-mobile-date { font-size: .7rem; color: var(--muted); }
  .txh-mobile-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }

  /* Empty state */
  .txh-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding: 64px 24px; color: var(--muted); text-align: center;
  }
  .txh-empty-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: var(--bg); display: flex; align-items: center;
    justify-content: center; font-size: 1.8rem; margin-bottom: 4px;
  }
  .txh-empty-title { font-weight: 700; font-size: .95rem; color: var(--navy); }
  .txh-empty-sub   { font-size: .82rem; max-width: 280px; line-height: 1.6; }

  /* Skeleton rows */
  .txh-skel-row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-bottom: 1px solid var(--border); }
  .txh-skel-row:last-child { border-bottom: none; }

  /* ── PAGINATION ── */
  .txh-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 22px; border-top: 1px solid var(--border);
    gap: 12px; flex-wrap: wrap;
  }
  .txh-page-info { font-size: .8rem; color: var(--muted); font-weight: 500; }
  .txh-page-info strong { color: var(--navy); }
  .txh-page-btns { display: flex; align-items: center; gap: 6px; }
  .txh-page-btn {
    min-width: 34px; height: 34px; padding: 0 10px;
    border-radius: 8px; border: 1.5px solid var(--border);
    background: var(--white); font-family: 'DM Sans', sans-serif;
    font-size: .82rem; font-weight: 700; color: var(--text);
    cursor: pointer; transition: all .15s;
    display: flex; align-items: center; justify-content: center;
  }
  .txh-page-btn:hover:not(:disabled) { border-color: var(--navy); color: var(--navy); }
  .txh-page-btn.active { background: var(--navy); border-color: var(--navy); color: white; }
  .txh-page-btn:disabled { opacity: .38; cursor: not-allowed; }
  .txh-page-dots { font-size: .82rem; color: var(--muted); padding: 0 4px; }

  /* ── TRANSACTION DETAIL MODAL ── */
  .txd-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.52);
    backdrop-filter: blur(4px); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px; animation: txdFadeIn .2s ease;
  }
  @keyframes txdFadeIn { from{opacity:0} to{opacity:1} }

  .txd-modal {
    background: white; border-radius: 22px;
    width: 100%; max-width: 440px;
    box-shadow: 0 24px 80px rgba(0,0,0,.22);
    overflow: hidden;
    animation: txdSlideUp .25s cubic-bezier(.34,1.56,.64,1);
    max-height: 90vh; overflow-y: auto;
  }
  @keyframes txdSlideUp { from{opacity:0;transform:translateY(22px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

  .txd-header {
    padding: 28px 28px 22px; text-align: center;
    position: relative;
  }
  .txd-close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); font-size: 1rem;
    transition: all .15s; font-family: 'DM Sans', sans-serif;
    font-weight: 700;
  }
  .txd-close:hover { background: var(--border); color: var(--text); }

  .txd-icon-wrap {
    width: 68px; height: 68px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px; font-size: 1.8rem;
  }
  .txd-amount {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem; font-weight: 700; line-height: 1;
    margin-bottom: 6px;
  }
  .txd-amount.credit { color: var(--green); }
  .txd-amount.debit  { color: var(--red); }
  .txd-desc { font-size: .9rem; font-weight: 600; color: var(--text); margin-bottom: 8px; }
  .txd-status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px; border-radius: 20px;
    font-size: .75rem; font-weight: 700;
  }

  .txd-divider { height: 1px; background: var(--border); margin: 0 28px; }

  .txd-body { padding: 20px 28px 28px; }
  .txd-section-label {
    font-size: .68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--muted); margin-bottom: 12px; margin-top: 20px;
  }
  .txd-section-label:first-child { margin-top: 0; }
  .txd-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 10px 0; border-bottom: 1px solid #f1f5f9; gap: 16px;
  }
  .txd-row:last-child { border-bottom: none; }
  .txd-lbl { font-size: .82rem; color: var(--muted); flex-shrink: 0; }
  .txd-val { font-size: .88rem; font-weight: 700; color: var(--text); text-align: right; word-break: break-word; max-width: 240px; }
  .txd-val.mono { font-family: 'Playfair Display', serif; }
  .txd-val.green { color: var(--green); }
  .txd-val.navy  { color: var(--navy); }

  .txd-note-box {
    background: #fffbeb; border: 1px solid #fde68a;
    border-radius: 10px; padding: 11px 14px;
    font-size: .84rem; color: #92400e; font-style: italic;
    margin-top: 16px; display: flex; gap: 8px; align-items: flex-start;
  }

  .txd-footer { padding: 0 28px 24px; }
  .txd-close-btn {
    width: 100%; padding: 13px; background: var(--navy); color: white;
    border: none; border-radius: 11px; font-family: 'DM Sans', sans-serif;
    font-size: .92rem; font-weight: 700; cursor: pointer; transition: background .18s;
  }
  .txd-close-btn:hover { background: var(--navy-dark); }

  /* Responsive */
  @media (max-width: 768px) {
    .bos-sidebar { transform: translateX(-100%); width: 280px; }
    .dash-main { margin-left: 0; }
    .sidebar-overlay-bg { display: block; }
    .topbar-hamburger { display: flex; }
    .bos-topbar { padding: 0 16px; height: 60px; }
    .topbar-name { display: none; }
    .dash-content { padding: 14px 14px 40px; }
    .txh-summary-strip { grid-template-columns: 1fr 1fr; }
    .txh-summary-strip > :last-child { grid-column: 1 / -1; }
    .txh-table-wrap { display: none; }
    .txh-mobile-list { display: flex; }
    .txh-controls { gap: 10px; }
    .txh-filter-tabs { gap: 5px; }
    .txh-tab { padding: 6px 11px; font-size: .72rem; }
    .txh-pagination { padding: 12px 16px; }
    .txh-page-info { font-size: .75rem; }
  }
  @media (max-width: 480px) {
    .txh-summary-strip { grid-template-columns: 1fr; }
    .txh-summary-strip > :last-child { grid-column: auto; }
    .txh-header { flex-direction: column; gap: 8px; }
    .txh-page-btns { gap: 4px; }
    .txh-page-btn { min-width: 30px; height: 30px; font-size: .75rem; }
  }
`;

/* ── Helpers ─────────────────────────────────────────────────── */
const API = "https://bank-web-app-eight.vercel.app/api/v1";
const fmt = (n) => "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
const fmtDateTime = (d) => new Date(d).toLocaleString("en-NG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

const TYPE_META = {
  deposit:           { label: "Deposit",          emoji: "↓", bg: "#f0fdf4", color: "#16a34a", badgeBg: "#dcfce7", badgeColor: "#15803d" },
  withdrawal:        { label: "Withdrawal",        emoji: "↑", bg: "#fef2f2", color: "#ef4444", badgeBg: "#fee2e2", badgeColor: "#dc2626" },
  transfer:          { label: "Transfer",          emoji: "⇄", bg: "#eff6ff", color: "#2563eb", badgeBg: "#dbeafe", badgeColor: "#1d4ed8" },
  bill_payment:      { label: "Bill Payment",      emoji: "📄", bg: "#fffbeb", color: "#d97706", badgeBg: "#fef3c7", badgeColor: "#b45309" },
  savings_deposit:   { label: "Savings Deposit",  emoji: "🏦", bg: "#f0fdf4", color: "#16a34a", badgeBg: "#dcfce7", badgeColor: "#15803d" },
  savings_interest:  { label: "Interest",          emoji: "✦", bg: "#f5f3ff", color: "#7c3aed", badgeBg: "#ede9fe", badgeColor: "#6d28d9" },
  savings_withdrawal:{ label: "Savings Withdrawal",emoji: "↑", bg: "#fef2f2", color: "#ef4444", badgeBg: "#fee2e2", badgeColor: "#dc2626" },
};

const getMeta = (t) => TYPE_META[t] || { label: t, emoji: "•", bg: "#f1f5f9", color: "#64748b", badgeBg: "#e2e8f0", badgeColor: "#475569" };

const isCredit = (tx, userAcct) => {
  // Transfers: debit if YOU are the sender, credit if YOU are the receiver
  if (tx.type === "transfer") return tx.receiverAccount === userAcct;
  // Money IN to main account
  if (["deposit", "savings_withdrawal"].includes(tx.type)) return true;
  // Money OUT of main account
  if (["withdrawal", "bill_payment", "savings_deposit"].includes(tx.type)) return false;
  // Savings interest: neutral — neither debit nor credit on main balance
  if (tx.type === "savings_interest") return null;
  // Fallback: trust the sign on amount
  return tx.amount >= 0;
};


/* ── Row label helpers (same as Transactionstable) ───────────── */
function extractNameFromDesc(desc, credit) {
  if (!desc) return null;
  const toMatch   = desc.match(/\bto\s+([^(\n]+?)(?:\s*\([^)]+\))?$/i);
  const fromMatch = desc.match(/\bfrom\s+([^(\n]+?)(?:\s*\([^)]+\))?$/i);
  if (!credit && toMatch)   return toMatch[1].trim();
  if (credit  && fromMatch) return fromMatch[1].trim();
  return null;
}

function rowLabel(tx, userAcct) {
  const type   = (tx.type || "").toLowerCase();
  const credit = isCredit(tx, userAcct);
  const party  =
    (credit ? (tx.senderName   || null) : (tx.receiverName  || null)) ||
    extractNameFromDesc(tx.description, credit);

  if (type === "transfer") {
    if (party) return credit ? `From ${party}` : `To ${party}`;
    return credit ? "Received transfer" : "Sent transfer";
  }
  if (type === "bill_payment")      return tx.billProvider || "Bill payment";
  if (type === "savings_interest")  return "Interest earned";
  if (type === "savings_deposit")   return "Moved to savings";
  if (type === "savings_withdrawal") return "Withdrawn from savings";
  if (type === "deposit")           return "Account deposit";
  if (type === "withdrawal")        return "Cash withdrawal";
  return tx.description || tx.type || "Transaction";
}

/* ── Direction icon ──────────────────────────────────────────── */
function TxRowIcon({ credit }) {
  const isNeutral = credit === null;
  const bg    = isNeutral ? "#f5f3ff" : credit ? "#f0fdf4" : "#fef2f2";
  const color = isNeutral ? "#7c3aed" : credit ? "#16a34a" : "#ef4444";
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {isNeutral
          ? <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>
          : credit
            ? <><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></>
            : <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>
        }
      </svg>
    </div>
  );
}
const FILTERS = [
  { label: "All",          value: "" },
  { label: "Deposits",     value: "deposit" },
  { label: "Withdrawals",  value: "withdrawal" },
  { label: "Transfers",    value: "transfer" },
  { label: "Bills",        value: "bill_payment" },
  { label: "Savings",      value: "savings_deposit,savings_interest,savings_withdrawal" },
];

/* ── Page numbers helper ─────────────────────────────────────── */
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

/* ── Transaction Detail Modal ────────────────────────────────── */
function TxDetailModal({ tx, userAcct, onClose }) {
  if (!tx) return null;
  const meta = getMeta(tx.type);
  const credit = isCredit(tx, userAcct);
  const isNeutral = credit === null;
  const absAmt = Math.abs(tx.amount);

  return (
    <div className="txd-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="txd-modal">
        {/* Header */}
        <div className="txd-header">
          <button className="txd-close" onClick={onClose}>✕</button>
          <div className="txd-icon-wrap" style={{ background: meta.bg }}>
            <span style={{ fontSize: "1.8rem" }}>{meta.emoji}</span>
          </div>
          <div className={`txd-amount${isNeutral ? "" : credit ? " credit" : " debit"}`}
            style={isNeutral ? { color: "#7c3aed" } : {}}>
            {isNeutral ? "" : credit ? "+" : "-"}{fmt(absAmt)}
          </div>
          <div className="txd-desc">{tx.description || "—"}</div>
          <div
            className="txd-status-badge"
            style={{
              background: tx.status === "success" ? "#dcfce7" : tx.status === "pending" ? "#fef3c7" : "#fee2e2",
              color:      tx.status === "success" ? "#15803d" : tx.status === "pending" ? "#92400e" : "#dc2626",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
            {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : "—"}
          </div>
        </div>

        <div className="txd-divider" />

        <div className="txd-body">
          {/* Transaction info */}
          <div className="txd-section-label">Transaction Details</div>

          <div className="txd-row">
            <span className="txd-lbl">Date & Time</span>
            <span className="txd-val">{fmtDateTime(tx.createdAt)}</span>
          </div>
          <div className="txd-row">
            <span className="txd-lbl">Type</span>
            <span className="txd-val">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: meta.badgeBg, color: meta.badgeColor, fontSize: ".75rem", fontWeight: 700 }}>
                {meta.label}
              </span>
            </span>
          </div>
          <div className="txd-row">
            <span className="txd-lbl">Amount</span>
            <span className="txd-val mono"
              style={{ color: isNeutral ? "#7c3aed" : credit ? "var(--green)" : "var(--red)" }}>
              {isNeutral ? "" : credit ? "+" : "-"}{fmt(absAmt)}
            </span>
          </div>

          {/* Parties */}
          {(tx.senderAccount || tx.receiverAccount) && (
            <>
              <div className="txd-section-label" style={{ marginTop: 18 }}>Parties</div>
              {tx.senderAccount && (
                <div className="txd-row">
                  <span className="txd-lbl">From</span>
                  <span className="txd-val">
                    {tx.senderName || "—"}
                    <span style={{ fontWeight: 500, color: "var(--muted)", marginLeft: 4 }}>({tx.senderAccount})</span>
                  </span>
                </div>
              )}
              {tx.receiverAccount && (
                <div className="txd-row">
                  <span className="txd-lbl">To</span>
                  <span className="txd-val">
                    {tx.receiverName || "—"}
                    <span style={{ fontWeight: 500, color: "var(--muted)", marginLeft: 4 }}>({tx.receiverAccount})</span>
                  </span>
                </div>
              )}
            </>
          )}

          {/* Bill details */}
          {tx.billType && (
            <>
              <div className="txd-section-label" style={{ marginTop: 18 }}>Bill Info</div>
              <div className="txd-row">
                <span className="txd-lbl">Bill Type</span>
                <span className="txd-val" style={{ textTransform: "capitalize" }}>{tx.billType}</span>
              </div>
              {tx.billProvider && (
                <div className="txd-row">
                  <span className="txd-lbl">Provider</span>
                  <span className="txd-val">{tx.billProvider}</span>
                </div>
              )}
              {tx.billReference && (
                <div className="txd-row">
                  <span className="txd-lbl">Reference</span>
                  <span className="txd-val mono">{tx.billReference}</span>
                </div>
              )}
            </>
          )}

          {/* Note */}
          {tx.note?.trim() && (
            <div className="txd-note-box">
              <span>📝</span>
              <span><strong>Note:</strong> {tx.note}</span>
            </div>
          )}

          {/* Tx ID */}
          <div style={{ marginTop: 16, padding: "10px 12px", background: "#f8fafc", borderRadius: 9, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: ".68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>Transaction ID</div>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--navy)", wordBreak: "break-all", fontFamily: "monospace" }}>{tx._id}</div>
          </div>
        </div>

        <div className="txd-footer">
          <button className="txd-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton rows ───────────────────────────────────────────── */
function SkeletonRows({ n = 8 }) {
  return Array.from({ length: n }).map((_, i) => (
    <div className="txh-skel-row" key={i}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="skeleton" style={{ height: 13, width: "55%" }} />
        <div className="skeleton" style={{ height: 11, width: "30%" }} />
      </div>
      <div className="skeleton" style={{ height: 13, width: 80 }} />
    </div>
  ));
}

/* ── Main component ──────────────────────────────────────────── */
export default function Transactions() {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get("token");
  const { roles: userRole } = getTokenData();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  /* data */
  const [txns, setTxns]         = useState([]);
  const [meta, setMeta]         = useState({ count: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading]   = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError]       = useState("");

  /* controls */
  const [filter, setFilter]     = useState("");
  const [sort, setSort]         = useState("desc");
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");

  /* detail modal */
  const [selected, setSelected] = useState(null);

  const handleLogout = () => { new Cookies().remove("token", { path: "/" }); window.location.replace("/login"); };

  /* fetch user info */
  useEffect(() => {
    axios.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUserData(r.data.data))
      .catch(e => { if (e?.response?.status === 401) handleLogout(); });
  }, []);

  /* fetch transactions */
  const fetchTxns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10, sort };
      if (filter) params.type = filter;
      const r = await axios.get(`${API}/transactions`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setTxns(r.data.data || []);
      setMeta(r.data.meta || { count: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (e) {
      if (e?.response?.status === 401) { handleLogout(); return; }
      setError(e?.response?.data?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, filter, sort, token]);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  /* reset to page 1 when filter/sort changes */
  useEffect(() => { setPage(1); }, [filter, sort]);

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* client-side search filter */
  const displayed = search
    ? txns.filter(tx =>
        (tx.description || "").toLowerCase().includes(search) ||
        (tx.type || "").toLowerCase().includes(search) ||
        (tx.billProvider || "").toLowerCase().includes(search) ||
        (tx.senderAccount || "").includes(search) ||
        (tx.receiverAccount || "").includes(search) ||
        String(Math.abs(tx.amount)).includes(search)
      )
    : txns;

  /* summary stats from current page */
  const userAcct = userData?.accountNumber;
  const totalIn  = txns.filter(tx => isCredit(tx, userAcct) === true).reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const totalOut = txns.filter(tx => isCredit(tx, userAcct) === false).reduce((s, tx) => s + Math.abs(tx.amount), 0);

  return (
    <>
      <style>{style}</style>

      {/* Detail modal */}
      {selected && (
        <TxDetailModal tx={selected} userAcct={userAcct} onClose={() => setSelected(null)} />
      )}

      <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />

      <div className="dash-layout">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
          onNavigate={(key) => navigate("/" + key)} active="transactions" />

        <main className="dash-main">
          <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />

          <div className="dash-content">
            {initialLoading ? (
              <PageLoader message="Loading transactions…" />
            ) : (
            <div className="txh-page">

              {/* Page header */}
              <div className="txh-header">
                <div>
                  <h1 className="txh-title">Transaction History</h1>
                  <p className="txh-sub">A complete record of all your account activity.</p>
                </div>
              </div>

              {/* Summary strip */}
              <div className="txh-summary-strip">
                <div className="txh-summary-card">
                  <div className="txh-summary-icon" style={{ background: "#f0fdf4" }}>💰</div>
                  <div>
                    <div className="txh-summary-label">Total In (this page)</div>
                    <div className="txh-summary-value" style={{ color: "var(--green)" }}>{fmt(totalIn)}</div>
                  </div>
                </div>
                <div className="txh-summary-card">
                  <div className="txh-summary-icon" style={{ background: "#fef2f2" }}>📤</div>
                  <div>
                    <div className="txh-summary-label">Total Out (this page)</div>
                    <div className="txh-summary-value" style={{ color: "var(--red)" }}>{fmt(totalOut)}</div>
                  </div>
                </div>
                <div className="txh-summary-card">
                  <div className="txh-summary-icon" style={{ background: "#eff6ff" }}>📋</div>
                  <div>
                    <div className="txh-summary-label">Total Transactions</div>
                    <div className="txh-summary-value" style={{ color: "var(--navy)" }}>
                      {loading ? "—" : (meta?.count !== undefined ? meta.count : txns.length).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="txh-controls">
                {/* Search */}
                <div className="txh-search-wrap">
                  <span className="txh-search-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <input
                    className="txh-search"
                    type="text"
                    placeholder="Search transactions…"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                </div>

                {/* Filter tabs */}
                <div className="txh-filter-tabs">
                  {FILTERS.map(f => (
                    <button
                      key={f.value}
                      className={`txh-tab${filter === f.value ? " active" : ""}`}
                      onClick={() => setFilter(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <select className="txh-sort" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </div>

              {/* Error banner */}
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: ".86rem", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {error}
                  <button onClick={fetchTxns} style={{ background: "#dc2626", color: "white", border: "none", padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: ".78rem", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>Retry</button>
                </div>
              )}

              {/* Table card */}
              <div className="txh-card">
                <div className="txh-card-header">
                  <span className="txh-card-title">
                    {FILTERS.find(f => f.value === filter)?.label || "All"} Transactions
                  </span>
                  {!loading && (
                    <span className="txh-count-badge">
                      {search ? `${displayed.length} result${displayed.length !== 1 ? "s" : ""}` : `${meta.count || txns.length} total`}
                    </span>
                  )}
                </div>

                {/* ── Desktop table ── */}
                <div className="txh-table-wrap">
                  {loading ? (
                    <SkeletonRows n={8} />
                  ) : displayed.length === 0 ? (
                    <div className="txh-empty">
                      <div className="txh-empty-icon">🗂️</div>
                      <div className="txh-empty-title">No transactions found</div>
                      <div className="txh-empty-sub">
                        {search ? "Try a different search term." : "No transactions match the selected filter."}
                      </div>
                    </div>
                  ) : (
                    <table className="txh-table">
                      <thead>
                        <tr>
                          <th style={{ width: 44 }}></th>
                          <th>Transaction</th>
                          <th style={{ display: 'none' }}>Date</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                          <th style={{ width: 24 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayed.map(tx => {
                          const m = getMeta(tx.type);
                          const credit = isCredit(tx, userAcct);
                          const isNeutral = credit === null;
                          return (
                            <tr key={tx._id} className="txh-row" onClick={() => setSelected(tx)}>
                              <td>
                                <TxRowIcon credit={credit} />
                              </td>
                              <td>
                                <div className="txh-row-desc">{rowLabel(tx, userAcct)}</div>
                                <div className="txh-row-sub">{fmtDate(tx.createdAt)} · {fmtTime(tx.createdAt)}</div>
                              </td>
                              <td style={{ display: "none" }}>
                                <div className="txh-date-cell">
                                  <span className="txh-date-main">{fmtDate(tx.createdAt)}</span>
                                  <span className="txh-date-time">{fmtTime(tx.createdAt)}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <span className={`txh-amount${isNeutral ? "" : credit ? " credit" : " debit"}`}
                                  style={isNeutral ? { color: "#7c3aed" } : {}}>
                                  {isNeutral ? "" : credit ? "+" : "-"}{fmt(Math.abs(tx.amount))}
                                </span>
                              </td>
                              <td>
                                <svg className="txh-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="9 18 15 12 9 6"/>
                                </svg>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* ── Mobile list ── */}
                <div className="txh-mobile-list">
                  {loading ? (
                    <SkeletonRows n={6} />
                  ) : displayed.length === 0 ? (
                    <div className="txh-empty">
                      <div className="txh-empty-icon">🗂️</div>
                      <div className="txh-empty-title">No transactions found</div>
                      <div className="txh-empty-sub">
                        {search ? "Try a different search term." : "No transactions match the selected filter."}
                      </div>
                    </div>
                  ) : displayed.map(tx => {
                    const m = getMeta(tx.type);
                    const credit = isCredit(tx, userAcct);
                    const isNeutral = credit === null;
                    return (
                      <div key={tx._id} className="txh-mobile-row" onClick={() => setSelected(tx)}>
                        <TxRowIcon credit={credit} />
                        <div className="txh-mobile-info">
                          <div className="txh-mobile-desc">{rowLabel(tx, userAcct)}</div>
                          <div className="txh-mobile-meta">
                            <span className="txh-mobile-date">{fmtDate(tx.createdAt)} · {fmtTime(tx.createdAt)}</span>
                          </div>
                        </div>
                        <div className="txh-mobile-right">
                          <span className={`txh-amount${isNeutral ? "" : credit ? " credit" : " debit"}`}
                            style={{ fontSize: ".9rem", ...(isNeutral ? { color: "#7c3aed" } : {}) }}>
                            {isNeutral ? "" : credit ? "+" : "-"}{fmt(Math.abs(tx.amount))}
                          </span>
                          <svg className="txh-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Pagination ── */}
                {!loading && !search && meta.totalPages > 1 && (
                  <div className="txh-pagination">
                    <div className="txh-page-info">
                      Showing <strong>{((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.count)}</strong> of <strong>{meta.count}</strong> transactions
                    </div>
                    <div className="txh-page-btns">
                      {/* Prev */}
                      <button
                        className="txh-page-btn"
                        onClick={() => setPage(p => p - 1)}
                        disabled={page <= 1}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"/>
                        </svg>
                      </button>

                      {/* Page numbers */}
                      {pageNumbers(page, meta.totalPages).map((p, i) =>
                        p === "..." ? (
                          <span key={`dots-${i}`} className="txh-page-dots">…</span>
                        ) : (
                          <button
                            key={p}
                            className={`txh-page-btn${page === p ? " active" : ""}`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button
                        className="txh-page-btn"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= meta.totalPages}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}