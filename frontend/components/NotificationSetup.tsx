"use client";

import React, { useEffect, useState, useCallback } from "react";
import { notificationsApi } from "@/lib/api";

type NotifStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

/**
 * Komponen yang mengelola pendaftaran Web Push Notification.
 * Ditampilkan sebagai banner di bagian atas halaman jika izin belum diberikan.
 * Secara otomatis mendaftar ke backend jika izin sudah diberikan.
 */
export default function NotificationSetup() {
  const [status, setStatus] = useState<NotifStatus>("idle");
  const [dismissed, setDismissed] = useState(false);

  // Ambil VAPID public key dari environment variable
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const checkCurrentPermission = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") setStatus("granted");
    else if (Notification.permission === "denied") setStatus("denied");
    else setStatus("idle");
  }, []);

  useEffect(() => {
    checkCurrentPermission();

    // Cek apakah user sudah pernah dismiss banner ini
    const wasDismissed = localStorage.getItem("cortisoul_notif_dismissed");
    if (wasDismissed) setDismissed(true);
  }, [checkCurrentPermission]);

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToNotifications = useCallback(async () => {
    if (!vapidPublicKey) {
      console.warn("[Notif] NEXT_PUBLIC_VAPID_PUBLIC_KEY belum diset");
      return;
    }

    setStatus("loading");
    try {
      // Daftarkan service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      // Minta izin notifikasi dari browser
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      // Subscribe ke Push API
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
      });

      // Kirim subscription ke backend
      await notificationsApi.subscribe(subscription.toJSON());
      setStatus("granted");
    } catch (err) {
      console.error("[Notif] Gagal subscribe:", err);
      setStatus("denied");
    }
  }, [vapidPublicKey]);

  const handleDismiss = () => {
    localStorage.setItem("cortisoul_notif_dismissed", "true");
    setDismissed(true);
  };

  // Jangan tampilkan jika: sudah granted, denied, unsupported, dismissed, atau VAPID key tidak ada
  if (
    status === "granted" ||
    status === "denied" ||
    status === "unsupported" ||
    dismissed ||
    !vapidPublicKey
  ) {
    return null;
  }

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
        <p style={{ color: "#fff", fontSize: "13.5px", fontWeight: 500 }}>
          Aktifkan pengingat harian untuk menulis jurnal
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={subscribeToNotifications}
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
          }}
        >
          {status === "loading" ? (
            <>
              <svg
                className="animate-spin"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
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
          }}
        >
          Nanti
        </button>
      </div>
    </div>
  );
}
