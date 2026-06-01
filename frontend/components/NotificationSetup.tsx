"use client";

import React, { useEffect, useState, useCallback } from "react";
import { notificationsApi } from "@/lib/api";

type NotifStatus = "idle" | "loading" | "subscribed" | "denied" | "unsupported" | "unsubscribing" | "testing";

/**
 * Komponen yang mengelola pendaftaran Web Push Notification.
 * - Menampilkan banner jika izin belum diberikan
 * - Menampilkan tombol unsubscribe & test jika sudah subscribe
 */
export default function NotificationSetup() {
  const [status, setStatus] = useState<NotifStatus>("idle");
  const [dismissed, setDismissed] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Cek status awal: apakah sudah subscribe atau belum
  const checkCurrentStatus = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    // Cek apakah sudah ada subscription aktif di service worker
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      if (reg) {
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          setSubscription(existingSub);
          setStatus("subscribed");
          return;
        }
      }
    } catch {
      // SW belum terdaftar, lanjut
    }

    // Cek apakah user sudah pernah dismiss banner
    const wasDismissed = localStorage.getItem("cortisoul_notif_dismissed");
    if (wasDismissed) setDismissed(true);

    setStatus("idle");
  }, []);

  useEffect(() => {
    checkCurrentStatus();
  }, [checkCurrentStatus]);

  // ─── Subscribe ─────────────────────────────────────────────────────────────

  const handleSubscribe = useCallback(async () => {
    if (!vapidPublicKey) {
      console.warn("[Notif] NEXT_PUBLIC_VAPID_PUBLIC_KEY belum diset");
      setErrorMsg("Konfigurasi VAPID key belum tersedia.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
      });

      await notificationsApi.subscribe(sub.toJSON());
      setSubscription(sub);
      setStatus("subscribed");
      // Hapus dismissed flag jika sebelumnya dismiss
      localStorage.removeItem("cortisoul_notif_dismissed");
    } catch (err) {
      console.error("[Notif] Gagal subscribe:", err);
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengaktifkan notifikasi.");
      setStatus("idle");
    }
  }, [vapidPublicKey]);

  // ─── Unsubscribe ───────────────────────────────────────────────────────────

  const handleUnsubscribe = useCallback(async () => {
    if (!subscription) return;
    setStatus("unsubscribing");
    setErrorMsg("");
    try {
      await notificationsApi.unsubscribe(subscription.toJSON());
      await subscription.unsubscribe();
      setSubscription(null);
      setStatus("idle");
      localStorage.setItem("cortisoul_notif_dismissed", "true");
      setDismissed(true);
    } catch (err) {
      console.error("[Notif] Gagal unsubscribe:", err);
      setErrorMsg(err instanceof Error ? err.message : "Gagal menonaktifkan notifikasi.");
      setStatus("subscribed");
    }
  }, [subscription]);

  // ─── Test Notification ─────────────────────────────────────────────────────

  const handleTest = useCallback(async () => {
    setStatus("testing");
    setErrorMsg("");
    setTestSent(false);
    try {
      await notificationsApi.test();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } catch (err) {
      console.error("[Notif] Gagal kirim test notif:", err);
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim notifikasi test.");
    } finally {
      setStatus("subscribed");
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("cortisoul_notif_dismissed", "true");
    setDismissed(true);
  };

  // ─── Unsupported ───────────────────────────────────────────────────────────
  if (status === "unsupported") return null;

  // ─── Already subscribed: tampilkan panel kecil ─────────────────────────────
  if (status === "subscribed" || status === "unsubscribing" || status === "testing") {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(139,92,246,0.10) 100%)",
          borderBottom: "1px solid rgba(14,165,233,0.18)",
          padding: "8px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🔔</span>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
            Notifikasi harian <span style={{ color: "#22c55e", fontWeight: 700 }}>aktif</span>
          </p>
          {testSent && (
            <span
              style={{
                background: "rgba(34,197,94,0.15)",
                color: "#22c55e",
                fontSize: "12px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "99px",
              }}
            >
              ✓ Terkirim!
            </span>
          )}
          {errorMsg && (
            <span style={{ color: "#f87171", fontSize: "12px" }}>{errorMsg}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          {/* Test button */}
          <button
            onClick={handleTest}
            disabled={status === "testing" || status === "unsubscribing"}
            title="Kirim notifikasi test"
            style={{
              padding: "5px 12px",
              background: "rgba(139,92,246,0.12)",
              color: "#a78bfa",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: status === "testing" ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              opacity: status === "testing" ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            {status === "testing" ? (
              <>
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Mengirim...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
                Test
              </>
            )}
          </button>

          {/* Unsubscribe button */}
          <button
            onClick={handleUnsubscribe}
            disabled={status === "unsubscribing" || status === "testing"}
            title="Nonaktifkan notifikasi"
            style={{
              padding: "5px 12px",
              background: "rgba(248,113,113,0.10)",
              color: "#f87171",
              border: "1px solid rgba(248,113,113,0.20)",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: status === "unsubscribing" ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              opacity: status === "unsubscribing" ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            {status === "unsubscribing" ? (
              <>
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Menonaktifkan...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Nonaktifkan
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── Denied: browser memblokir notifikasi ──────────────────────────────────
  if (status === "denied") {
    return (
      <div
        style={{
          background: "rgba(248,113,113,0.08)",
          borderBottom: "1px solid rgba(248,113,113,0.15)",
          padding: "8px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "15px" }}>🔕</span>
        <p style={{ fontSize: "13px", color: "#f87171", fontWeight: 500 }}>
          Notifikasi diblokir browser. Aktifkan secara manual di pengaturan browser.
        </p>
      </div>
    );
  }

  // ─── Dismissed: jangan tampilkan ──────────────────────────────────────────
  if (dismissed || !vapidPublicKey) return null;

  // ─── Idle: tampilkan banner ajakan subscribe ───────────────────────────────
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "18px" }}>🔔</span>
        <div>
          <p style={{ color: "#fff", fontSize: "13.5px", fontWeight: 500 }}>
            Aktifkan pengingat harian untuk menulis jurnal
          </p>
          {errorMsg && (
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "2px" }}>
              {errorMsg}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={handleSubscribe}
          disabled={status === "loading"}
          style={{
            padding: "6px 16px",
            background: "#fff",
            color: "#0ea5e9",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: status === "loading" ? 0.8 : 1,
            transition: "all 0.2s",
          }}
        >
          {status === "loading" ? (
            <>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Memproses...
            </>
          ) : (
            "Aktifkan"
          )}
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: "6px 12px",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "all 0.2s",
          }}
        >
          Nanti
        </button>
      </div>
    </div>
  );
}
