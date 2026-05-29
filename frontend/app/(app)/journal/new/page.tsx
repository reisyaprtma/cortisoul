"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { journalsApi } from "@/lib/api";

const MOOD_OPTIONS = [
  { value: "happy", label: "Bahagia", emoji: "😊", color: "#22c55e" },
  { value: "calm", label: "Tenang", emoji: "😌", color: "#14b8a6" },
  { value: "neutral", label: "Biasa Saja", emoji: "😐", color: "#64748b" },
  { value: "anxious", label: "Cemas", emoji: "😰", color: "#f97316" },
  { value: "sad", label: "Sedih", emoji: "😢", color: "#3b82f6" },
  { value: "stressed", label: "Stres", emoji: "😤", color: "#ef4444" },
];

export default function NewJournalPage() {
  const router = useRouter();
  const [step, setStep] = useState<"mood" | "write">("mood");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleMoodNext = () => {
    if (!selectedMood) return;
    setStep("write");
    // Pre-fill content with mood context
    const moodLabel = MOOD_OPTIONS.find((m) => m.value === selectedMood)?.label || "";
    if (!content) {
      setContent(`Hari ini aku merasa ${moodLabel.toLowerCase()}. `);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Judul dan isi jurnal harus diisi");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const res = await journalsApi.create({ title, content });
      const journalId = res.data?.journalId;
      if (journalId) {
        router.push(`/journal/${journalId}`);
      } else {
        router.push("/history");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan jurnal");
      setIsSubmitting(false);
    }
  };

  const todayDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ padding: "28px 32px", maxWidth: "680px" }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "4px" }}>
          {todayDate}
        </p>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
          {step === "mood" ? "Bagaimana harimu? 🌤️" : "Tulis Jurnal ✍️"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          {step === "mood"
            ? "Pilih mood yang paling mencerminkan perasaanmu sekarang"
            : "Ceritakan apa yang kamu rasakan dan alami hari ini"}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
        {["mood", "write"].map((s, i) => (
          <React.Fragment key={s}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background:
                  step === s
                    ? "var(--accent-blue)"
                    : i === 0 && step === "write"
                    ? "var(--accent-green)"
                    : "var(--border-light)",
                color:
                  step === s || (i === 0 && step === "write") ? "#fff" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {i === 0 && step === "write" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              style={{
                fontSize: "13px",
                color: step === s ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: step === s ? 600 : 400,
                marginRight: i === 0 ? "0" : "0",
              }}
            >
              {s === "mood" ? "Pilih Mood" : "Tulis Jurnal"}
            </span>
            {i === 0 && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background: step === "write" ? "var(--accent-blue)" : "var(--border-light)",
                  borderRadius: "99px",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step: Mood Selection */}
      {step === "mood" && (
        <div className="animate-fadeIn">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                style={{
                  padding: "18px 12px",
                  borderRadius: "14px",
                  border: `2px solid ${selectedMood === mood.value ? mood.color : "var(--border-light)"}`,
                  background:
                    selectedMood === mood.value
                      ? `${mood.color}15`
                      : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: selectedMood === mood.value ? `0 0 0 3px ${mood.color}20` : "none",
                  transform: selectedMood === mood.value ? "scale(1.03)" : "scale(1)",
                }}
              >
                <span style={{ fontSize: "32px", lineHeight: 1 }}>{mood.emoji}</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: selectedMood === mood.value ? 600 : 400,
                    color: selectedMood === mood.value ? mood.color : "var(--text-secondary)",
                  }}
                >
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleMoodNext}
            disabled={!selectedMood}
            style={{
              width: "100%",
              padding: "13px",
              background: selectedMood
                ? "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)"
                : "#e2e8f0",
              color: selectedMood ? "#fff" : "var(--text-muted)",
              border: "none",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "15px",
              cursor: selectedMood ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            Lanjut Menulis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}

      {/* Step: Write Journal */}
      {step === "write" && (
        <div className="animate-fadeIn">
          {/* Selected mood display */}
          {selectedMood && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#fff",
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                padding: "8px 14px",
                marginBottom: "20px",
              }}
            >
              <span style={{ fontSize: "20px" }}>
                {MOOD_OPTIONS.find((m) => m.value === selectedMood)?.emoji}
              </span>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Mood: <strong style={{ color: "var(--text-primary)" }}>
                  {MOOD_OPTIONS.find((m) => m.value === selectedMood)?.label}
                </strong>
              </span>
              <button
                onClick={() => setStep("mood")}
                style={{ background: "none", border: "none", color: "var(--accent-blue)", fontSize: "12px", cursor: "pointer", padding: "0 4px" }}
              >
                Ubah
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Judul Jurnal <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Beri judul yang mencerminkan harimu..."
                maxLength={50}
                required
              />
              <div style={{ textAlign: "right", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                {title.length}/50
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Ceritakan harimu <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis apa yang kamu rasakan, alami, atau pikirkan hari ini..."
                rows={10}
                required
                style={{ resize: "vertical", minHeight: "200px", lineHeight: "1.7" }}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "#dc2626",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setStep("mood")}
                style={{
                  padding: "12px 20px",
                  background: "#fff",
                  border: "1.5px solid var(--border-medium)",
                  borderRadius: "12px",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                ← Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: isSubmitting
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isSubmitting && (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                )}
                {isSubmitting ? "Menyimpan..." : "Simpan & Analisis 🔍"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
