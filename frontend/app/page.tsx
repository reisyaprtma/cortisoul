"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "register") {
        await register(username, password, fullname);
        setMode("login");
        setError("");
        setFullname("");
        setPassword("");
        setConfirmPassword("");
      } else {
        await login(username, password);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #f5f3ff 100%)",
        padding: "20px",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "fixed",
          top: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-80px",
          right: "-80px",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-fadeIn"
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.04)",
          width: "100%",
          maxWidth: "400px",
          overflow: "hidden",
        }}
      >
        {/* Header gradient */}
        <div
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
            padding: "32px 32px 28px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>
            {mode === "login" ? "Selamat Datang!" : "Buat Akun"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13.5px" }}>
            {mode === "login"
              ? "Masuk untuk melanjutkan jurnal mentalmu"
              : "Daftarkan diri untuk mulai perjalananmu"}
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px 32px" }}>
          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-primary)",
              borderRadius: "10px",
              padding: "4px",
              marginBottom: "24px",
            }}
          >
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  background: mode === m ? "#fff" : "transparent",
                  color: mode === m ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: mode === m ? 600 : 400,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                }}
              >
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {mode === "register" && (
                <>
                  <div className="animate-fadeIn">
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                      autoComplete="name"
                    />
                  </div>
                </>
              )}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            
            {mode === "register" && (
              <>
                <div className="animate-fadeIn">
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}

            {error && (
              <div
                className="animate-fadeIn"
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "#dc2626",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: "4px",
                padding: "12px",
                background: isLoading
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "15px",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isLoading && (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {mode === "login" ? "Masuk" : "Daftar Sekarang"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-blue)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {mode === "login" ? "Daftar" : "Masuk"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
