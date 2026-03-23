import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Statscard from "../components/Dashboard/Statscard";
import Billscard from "../components/Dashboard/Billscard";
import Transactionstable from "../components/Dashboard/Transactionstable";
import Savingscard from "../components/Dashboard/Savingscard";
import Quickactions from "../components/Dashboard/Quickactions";
import Topbar from "../components/Dashboard/Topbar";
import { getTokenData } from "../auth/auth";
import PageLoader from "../components/PageLoader";

/* ─── Brand Colours (Bank of Saturn) ─── */
/* navy: #1b3a6b  |  blue: #2563eb  |  green: #16a34a  |  amber: #d97706 */

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:        #1b3a6b;
    --navy-dark:   #122850;
    --blue:        #2563eb;
    --green:       #16a34a;
    --amber:       #d97706;
    --red:         #ef4444;
    --text:        #1e293b;
    --muted:       #64748b;
    --text-muted:  #64748b;
    --border:      #e2e8f0;
    --bg:          #f1f5f9;
    --white:       #ffffff;
    --sidebar-w:   240px;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    background: var(--bg);
    overflow-x: hidden;
  }

  /* ════════════════════════
     LAYOUT
  ════════════════════════ */
  .dash-layout {
    display: flex;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .dash-main {
    flex: 1;
    margin-left: var(--sidebar-w);
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow-x: hidden;
    transition: margin-left 0.3s;
  }

  .dash-content {
    padding: 28px 32px 56px;
    flex: 1;
  }

  /* ════════════════════════
     SIDEBAR
  ════════════════════════ */
  .bos-sidebar {
    width: var(--sidebar-w);
    background: var(--navy);
    position: fixed;
    top: 0; left: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    z-index: 300;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    overflow-y: auto;
  }
  .bos-sidebar.mobile-open {
    transform: translateX(0) !important;
    box-shadow: 4px 0 24px rgba(0,0,0,0.3);
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 22px 20px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-shrink: 0;
  }
  .sidebar-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 0.92rem;
    color: white;
    line-height: 1.2;
    font-weight: 700;
  }

  .sidebar-nav {
    flex: 1;
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow-y: auto;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.6);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    text-align: left;
    width: 100%;
    text-decoration: none;
  }
  .sidebar-item:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
  .sidebar-item.active { background: rgba(255,255,255,0.14); color: white; font-weight: 600; }
  .sidebar-item-icon { display: flex; align-items: center; flex-shrink: 0; }

  .sidebar-footer {
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,0.1);
    flex-shrink: 0;
  }
  .sidebar-logout {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.5);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    transition: all 0.18s;
  }
  .sidebar-logout:hover { background: rgba(239,68,68,0.15); color: #f87171; }

  /* Mobile overlay */
  .sidebar-overlay-bg {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 250;
  }

  /* ════════════════════════
     TOPBAR
  ════════════════════════ */
  .bos-topbar {
    height: 68px;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 8px rgba(0,0,0,0.05);
    flex-shrink: 0;
  }
  .topbar-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .topbar-hamburger {
    display: none;
    background: none;
    border: none;
    color: var(--navy);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    flex-shrink: 0;
  }
  .topbar-hamburger:hover { background: var(--bg); }
  .topbar-greeting { min-width: 0; }
  .topbar-welcome {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    color: var(--navy);
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .topbar-date { font-size: 0.78rem; color: var(--muted); margin-top: 1px; white-space: nowrap; }
  .topbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .topbar-bell {
    position: relative;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.18s;
    flex-shrink: 0;
  }
  .topbar-bell:hover { border-color: var(--navy); color: var(--navy); }
  .bell-badge {
    position: absolute;
    top: -3px; right: -3px;
    background: var(--red);
    color: white;
    font-size: 0.58rem;
    font-weight: 700;
    width: 16px; height: 16px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid white;
  }
  .topbar-user {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 5px 10px 5px 5px;
    border-radius: 30px;
    border: 1px solid var(--border);
    background: var(--bg);
    transition: all 0.18s;
    flex-shrink: 0;
  }
  .topbar-user:hover { border-color: var(--navy); }
  .topbar-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: var(--navy);
    color: white;
    font-size: 0.72rem;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .topbar-name { font-size: 0.85rem; font-weight: 600; color: var(--text); }

  /* Sidebar user pill + upward dropdown */
  .sidebar-user-footer {
    position: relative;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding: 10px 12px;
    flex-shrink: 0;
  }
  .sidebar-user-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border-radius: 10px;
    border: none;
    background: rgba(255,255,255,0.06);
    cursor: pointer;
    transition: background 0.18s;
    text-align: left;
  }
  .sidebar-user-pill:hover { background: rgba(255,255,255,0.12); }
  .sidebar-user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.25);
    color: white; font-size: 0.75rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sidebar-user-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
  .sidebar-user-name  { color: white; font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-user-role  { color: rgba(255,255,255,0.4); font-size: 0.68rem; margin-top: 1px; }

  /* Dropdown panel (pops UP above pill) */
  .sidebar-dropdown {
    position: absolute;
    bottom: calc(100% - 10px);
    left: 12px; right: 12px;
    background: #1e2d50;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 -8px 28px rgba(0,0,0,0.35);
    z-index: 400;
    animation: dropUp 0.15s ease;
  }
  @keyframes dropUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sidebar-drop-header {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px 10px;
  }
  .sidebar-drop-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255,255,255,0.15); color: white;
    font-size: 0.8rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sidebar-drop-name { font-size: 0.85rem; font-weight: 700; color: white; }
  .sidebar-drop-role { font-size: 0.7rem; color: rgba(255,255,255,0.45); margin-top: 1px; }
  .sidebar-drop-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0; }
  .sidebar-drop-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 9px 12px; border-radius: 8px;
    border: none; background: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.84rem; font-weight: 500;
    color: rgba(255,255,255,0.75); cursor: pointer;
    transition: background 0.15s;
    text-align: left;
  }
  .sidebar-drop-item:hover { background: rgba(255,255,255,0.08); color: white; }
  .sidebar-drop-logout { color: #f87171; }
  .sidebar-drop-logout:hover { background: rgba(239,68,68,0.12) !important; color: #fca5a5; }

  /* ════════════════════════
     ERROR BANNER
  ════════════════════════ */
  .dash-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.88rem;
    font-weight: 500;
  }
  .dash-error button {
    background: #dc2626; color: white; border: none;
    padding: 6px 14px; border-radius: 6px;
    cursor: pointer; font-size: 0.82rem; font-weight: 600;
    flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }

  /* ════════════════════════
     BALANCE HERO CARD
  ════════════════════════ */
  .balance-hero-card {
    position: relative;
    background: linear-gradient(135deg, var(--navy) 0%, #1e4db7 55%, #2563eb 100%);
    border-radius: 20px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 16px 48px rgba(27,58,107,0.35);
  }
  .balance-hero-deco {
    position: absolute;
    top: -60px; right: -60px;
    width: 260px; height: 260px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    pointer-events: none;
  }
  .balance-hero-deco::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .balance-hero-body {
    position: relative;
    z-index: 1;
    padding: 28px 32px 24px;
  }
  .balance-hero-label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }
  .balance-hero-value {
    display: inline-flex !important;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .balance-hero-value span {
    font-size: clamp(2rem, 5vw, 3rem) !important;
    font-weight: 700 !important;
    font-family: 'Playfair Display', serif !important;
    color: white !important;
    letter-spacing: -0.01em;
    line-height: 1.1;
  }
  .balance-hero-value button {
    color: rgba(255,255,255,0.6) !important;
    width: 32px; height: 32px;
    border-radius: 8px !important;
    background: rgba(255,255,255,0.1) !important;
    transition: all 0.18s !important;
  }
  .balance-hero-value button:hover {
    background: rgba(255,255,255,0.2) !important;
    color: white !important;
  }
  .balance-hero-sub {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.45);
    margin-bottom: 0;
  }
  .balance-hero-divider {
    height: 1px;
    background: rgba(255,255,255,0.12);
    margin: 20px 0 16px;
  }
  .balance-hero-summary {
    display: flex;
    align-items: center;
    gap: 0;
  }
  .balance-hero-sep {
    width: 1px; height: 36px;
    background: rgba(255,255,255,0.14);
    flex-shrink: 0;
  }

  /* ════════════════════════
     QUICK ACTIONS
  ════════════════════════ */
  .quick-actions-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .card-heading { font-size: 0.95rem; font-weight: 700; color: var(--navy); margin-bottom: 14px; }
  .quick-actions-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .quick-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 10px;
    border: none;
    border-radius: 10px;
    background: var(--color);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
  }
  .quick-action-btn:hover { background: var(--hover); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
  .quick-action-btn:active { transform: scale(0.97); }
  .qa-icon { display: flex; }
  .qa-arrow { opacity: 0.7; }
  .qa-label { white-space: nowrap; }

  /* ════════════════════════
     MIDDLE ROW
  ════════════════════════ */
  .middle-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  /* ════════════════════════
     SAVINGS CARD
  ════════════════════════ */
  .savings-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 22px;
  }
  .savings-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .savings-badge {
    font-size: 0.65rem; font-weight: 700;
    background: #f0fdf4; color: var(--green);
    border: 1px solid #bbf7d0;
    padding: 3px 9px; border-radius: 20px;
    letter-spacing: 0.04em;
  }
  .savings-actions { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
  .savings-btn {
    display: flex; align-items: center; gap: 6px;
    flex: 1; justify-content: center;
    padding: 9px 12px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: all 0.18s;
    white-space: nowrap;
    min-width: 140px;
  }
  .savings-btn.primary { background: var(--blue); color: white; border: none; }
  .savings-btn.primary:hover { background: #1d4ed8; }
  .savings-btn.secondary { background: transparent; color: var(--green); border: 1.5px solid var(--green); }
  .savings-btn.secondary:hover { background: #f0fdf4; }
  .savings-stats { display: flex; flex-direction: column; gap: 0; }
  .savings-stat-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .savings-stat-row:last-child { border-bottom: none; }
  .savings-stat-label { font-size: 0.82rem; color: var(--muted); }
  .savings-stat-val { font-weight: 700; font-family: 'Playfair Display', serif; font-size: 0.95rem; }
  .savings-stat-val.navy { color: var(--navy); }
  .savings-stat-val.green { color: var(--green); }

  /* ════════════════════════
     BILLS CARD (dark)
  ════════════════════════ */
  .bills-card-widget {
    background: #0f172a;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 22px;
    position: relative;
    overflow: hidden;
  }
  .bills-card-widget::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .bills-widget-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .bills-badge-count {
    font-size: 0.62rem; font-weight: 600;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #94a3b8;
    padding: 3px 8px; border-radius: 20px;
    letter-spacing: 0.05em;
  }
  .bills-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 14px;
  }
  .bill-tile {
    position: relative;
    background: var(--bg);
    border: 1.5px solid var(--bdr);
    border-radius: 12px;
    padding: 12px 4px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    border: 1.5px solid rgba(255,255,255,0.08);
  }
  .bill-tile::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--grad);
    opacity: 0;
    transition: opacity 0.22s;
    border-radius: 10px;
  }
  .bill-tile:hover { transform: translateY(-3px); box-shadow: 0 8px 20px var(--glow); border-color: transparent; }
  .bill-tile:hover::after, .bill-tile.active::after { opacity: 1; }
  .bill-tile.active { transform: translateY(-3px) scale(1.04); box-shadow: 0 10px 24px var(--glow); border-color: transparent; }
  .bill-tile-icon { position: relative; z-index: 1; display: flex; }
  .bill-tile-label { position: relative; z-index: 1; font-size: 0.59rem; font-weight: 600; color: #cbd5e1; text-align: center; line-height: 1.2; transition: color 0.2s; }
  .bill-tile:hover .bill-tile-label, .bill-tile.active .bill-tile-label { color: rgba(255,255,255,0.95); }
  .bills-pay-btn {
    width: 100%; border: none; border-radius: 10px;
    padding: 12px; font-family: 'DM Sans', sans-serif;
    font-size: 0.86rem; font-weight: 700;
    cursor: pointer;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    box-shadow: 0 4px 16px rgba(99,102,241,0.4);
    transition: all 0.22s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .bills-pay-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.55); }
  .bills-pay-btn.success { background: linear-gradient(135deg, #10b981, #34d399); box-shadow: 0 4px 16px rgba(16,185,129,0.4); pointer-events: none; }

  /* ════════════════════════
     TRANSACTIONS TABLE
  ════════════════════════ */
  .txn-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }
  .txn-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid var(--border);
  }
  .txn-view-all {
    background: none; border: none; color: var(--blue);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem; font-weight: 600;
    cursor: pointer; padding: 0; transition: color 0.2s;
  }
  .txn-view-all:hover { color: #1d4ed8; }
  .txn-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .txn-table { width: 100%; border-collapse: collapse; min-width: 480px; }
  .txn-table th {
    font-size: 0.7rem; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.06em;
    padding: 11px 20px; border-bottom: 1px solid var(--border);
    white-space: nowrap; text-align: left;
    background: #f8fafc;
  }
  .txn-table td { padding: 13px 20px; border-bottom: 1px solid var(--border); vertical-align: middle; font-size: 0.87rem; }
  .txn-table tr:last-child td { border-bottom: none; }
  .txn-date { font-size: 0.8rem; color: var(--muted); white-space: nowrap; }
  .txn-type-badge { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
  .txn-desc { font-size: 0.84rem; color: var(--text); font-weight: 500; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .txn-amount { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 0.9rem; white-space: nowrap; text-align: right; }
  .txn-amount.credit { color: var(--green); }
  .txn-amount.debit  { color: var(--red); }
  .txn-status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 7px; }
  .txn-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 0; color: var(--muted); font-size: 0.88rem; }

  /* ════════════════════════
     SKELETON
  ════════════════════════ */
  .skeleton {
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ════════════════════════
     TABLET  (769–1200px)
  ════════════════════════ */
  @media (min-width: 769px) and (max-width: 1200px) {
    :root { --sidebar-w: 200px; }
    .dash-content { padding: 20px 24px 40px; }
    .balance-hero-body { padding: 24px 24px 20px; }
    .quick-actions-row { gap: 10px; }
  }

  /* ════════════════════════
     MOBILE  (≤ 768px)
  ════════════════════════ */
  @media (max-width: 768px) {
    .bos-sidebar { transform: translateX(-100%); width: 280px; }
    .dash-main { margin-left: 0; }
    .sidebar-overlay-bg { display: block; }
    .topbar-hamburger { display: flex; }
    .bos-topbar { padding: 0 16px; height: 60px; }
    .topbar-welcome { font-size: 1rem; }
    .topbar-name { display: none; }
    .dash-content { padding: 14px 14px 40px; }
    .balance-hero-body { padding: 20px 20px 16px; }
    .quick-actions-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .middle-row { grid-template-columns: 1fr; gap: 14px; }
    .bills-grid { grid-template-columns: repeat(4, 1fr); gap: 6px; }
  }

  /* ════════════════════════
     SMALL MOBILE  (≤ 480px)
  ════════════════════════ */
  @media (max-width: 480px) {
    .balance-hero-body { padding: 16px 16px 14px; }
    .balance-hero-value span { font-size: 1.8rem !important; }
    .balance-hero-summary { flex-wrap: wrap; gap: 12px 0; }
    .balance-hero-sep { display: none; }
    .quick-action-btn { padding: 10px 6px; font-size: 0.78rem; gap: 5px; }
    .qa-arrow { display: none; }
    .savings-actions { flex-direction: column; }
    .bills-grid { grid-template-columns: repeat(2, 1fr); }
    .dash-content { padding: 10px 10px 36px; }
  }
`;

const fmt = (n) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard() {
  const navigate = useNavigate();
  const cookies = new Cookies();
    const { roles: userRole } = getTokenData();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = cookies.get("token");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:9000/api/v1/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        cookies.remove("token", { path: "/" });
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  // silentFetch: re-fetches without showing the full loading skeleton,
  // used for background refreshes so the UI doesn't flicker.
  const silentFetch = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/v1/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        cookies.remove("token", { path: "/" });
        navigate("/login");
      }
      // silently ignore other errors on background refresh
    }
  }, [token]);

  // 1️⃣ Initial load (shows skeleton)
  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // 2️⃣ Re-fetch when browser tab/window regains focus
  useEffect(() => {
    const onFocus = () => silentFetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [silentFetch]);

  // 3️⃣ Re-fetch when page becomes visible (mobile tab switching)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") silentFetch();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [silentFetch]);

  // 4️⃣ Auto-poll every 60 seconds while the dashboard is open
  useEffect(() => {
    const timer = setInterval(silentFetch, 60_000);
    return () => clearInterval(timer);
  }, [silentFetch]);

  const handleLogout = () => {
    cookies.remove("token", { path: "/" });
    navigate("/login");
  };


  if (loading) return (
    <>
      <style>{style}</style>
      <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
      <div className="dash-layout">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
          onNavigate={key => navigate("/" + key)}
          active="dashboard"
          fullName={data?.fullName || ""}
        />
        <main className="dash-main">
          <Topbar
            fullName={data?.fullName || ""}
            onMenuToggle={() => setMobileOpen(o => !o)}
          />
          <div className="dash-content">
            <PageLoader message="Loading your Dashboard…" />
          </div>
        </main>
      </div>
    </>
  );

  return (

    <>



      <style>{style}</style>

      {/* Mobile sidebar overlay */}
      <div
        className="sidebar-overlay-bg"
        style={{ display: mobileOpen ? "block" : "none" }}
        onClick={() => setMobileOpen(false)}
      />

      <div className="dash-layout">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
          onNavigate={(key) => navigate("/" + key)}
          active="dashboard"
          fullName={data?.fullName || ""}
        />

        <main className="dash-main">
          <Topbar
            fullName={data?.fullName || ""}
            onMenuToggle={() => setMobileOpen(o => !o)}
          />

          <div className="dash-content">
            {error && (
              <div className="dash-error">
                {error}
                <button onClick={fetchDashboard}>Retry</button>
              </div>
            )}

            {/* ── BALANCE HERO ── */}
            <Statscard
              mainBalance={data?.totalBalance ?? 0}
              savingsBalance={data?.savingsBalance}
              interestThisMonth={data?.interestThisMonth}
              billsThisMonth={data?.billsThisMonth}
              accountNumber={data?.accountNumber || ""}
              loading={loading}
            />

            {/* ── QUICK ACTIONS ── */}
            <Quickactions onNavigate={(key) => navigate("/" + key)} />

            {/* ── SAVINGS + BILLS ── */}
            <div className="middle-row">
              <Savingscard
                savingsBalance={data?.savingsBalance}
                interestThisMonth={data?.interestThisMonth}
                loading={loading}
              />
              <Billscard billsThisMonth={data?.billsThisMonth} />
            </div>

            {/* ── TRANSACTIONS ── */}
            <Transactionstable
              transactions={data?.recentTransactions}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </>
  );
}
