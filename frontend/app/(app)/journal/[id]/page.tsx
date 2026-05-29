"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { journalsApi, type Journal } from "@/lib/api";

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadJournal = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await journalsApi.getById(id);
      const j = res.data?.journal;
      if (j) {
        setJournal(j);
        setEditTitle(j.title);
        setEditContent(j.content);
      }
    } catch {
      setError("Jurnal tidak ditemukan");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setError("Judul dan isi tidak boleh kosong");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const res = await journalsApi.update(id, {
        title: editTitle,
        content: editContent,
      });
      if (res.data?.journal) {
        setJournal(res.data.journal);
      } else {
        await loadJournal();
      }
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await journalsApi.delete(id);
      router.push("/history");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus jurnal");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "32px" }}>
        <div
          style={{
            height: "400px",
            background: "#fff",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="animate-pulse-soft"
        >
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      </div>
    );
  }

  if (error && !journal) {
    return (
      <div style={{ padding: "32px" }}>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
            {error}
          </h2>
          <Link href="/history" style={{ color: "var(--accent-blue)", textDecoration: "none", fontSize: "14px" }}>
            ← Kembali ke Riwayat
          </Link>
        </div>
      </div>
    );
  }

  if (!journal) return null;

  const createdAt = new Date(journal.created_at);
  const formattedDate = createdAt.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = createdAt.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const stressColor = getStressColor(journal.stress_score);
  const stressLabel = getStressLabel(journal.stress_score);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "780px" }} className="animate-fadeIn">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <Link href="/history" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px" }}>
          Riwayat Jurnal
        </Link>
        <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>›</span>
        <span style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 500 }}>
          {journal.title}
        </span>
      </div>

      {/* Journal Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%)",
            borderBottom: "1px solid var(--border-light)",
            padding: "24px 28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                {journal.emotion && (
                  <span
                    style={{
                      background: "rgba(14,165,233,0.1)",
                      color: "var(--accent-blue)",
                      padding: "3px 10px",
                      borderRadius: "99px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {emotionEmoji(journal.emotion)} {journal.emotion}
                  </span>
                )}
                {journal.stress_score !== undefined && journal.stress_score !== null && (
                  <span
                    style={{
                      background: `${stressColor}15`,
                      color: stressColor,
                      padding: "3px 10px",
                      borderRadius: "99px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Stres: {journal.stress_score}/10
                  </span>
                )}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={50}
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    border: "2px solid var(--accent-blue)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    width: "100%",
                    background: "#fff",
                  }}
                />
              ) : (
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {journal.title}
                </h1>
              )}

              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                {formattedDate} · {formattedTime}
              </p>
            </div>

            {/* Action buttons */}
            {!isEditing && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: "8px 14px",
                    background: "#fff",
                    border: "1.5px solid var(--border-medium)",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    padding: "8px 14px",
                    background: "#fef2f2",
                    border: "1.5px solid #fecaca",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#dc2626",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px" }}>
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={12}
              style={{
                width: "100%",
                border: "2px solid var(--accent-blue)",
                borderRadius: "10px",
                resize: "vertical",
                fontSize: "15px",
                lineHeight: "1.8",
                padding: "14px",
                minHeight: "200px",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: "15px",
                lineHeight: "1.8",
                color: "var(--text-primary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {journal.content}
            </div>
          )}

          {/* Edit actions */}
          {isEditing && (
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              {error && (
                <p style={{ color: "#dc2626", fontSize: "13px", flex: 1 }}>{error}</p>
              )}
              <button
                onClick={() => { setIsEditing(false); setError(""); }}
                style={{
                  padding: "10px 18px",
                  background: "#fff",
                  border: "1.5px solid var(--border-medium)",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "#fff",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isSaving && (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                )}
                Simpan Perubahan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Panel */}
      {(journal.emotion || journal.stress_score !== undefined || journal.suggestion) && (
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                Hasil Analisis AI
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Berdasarkan isi jurnalmu
              </p>
            </div>
          </div>

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Emotion */}
            {journal.emotion && (
              <div style={{ display: "flex", gap: "16px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--accent-blue-light)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "20px",
                  }}
                >
                  {emotionEmoji(journal.emotion)}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "2px" }}>Emosi Terdeteksi</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>
                    {journal.emotion}
                  </p>
                </div>
              </div>
            )}

            {/* Stress level */}
            {journal.stress_score !== undefined && journal.stress_score !== null && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Tingkat Stres</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: stressColor }}>
                      {journal.stress_score}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/10</span>
                    <span
                      style={{
                        background: `${stressColor}15`,
                        color: stressColor,
                        padding: "2px 8px",
                        borderRadius: "99px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {stressLabel}
                    </span>
                  </div>
                </div>
                <div style={{ height: "8px", background: "var(--bg-primary)", borderRadius: "99px" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(journal.stress_score / 10) * 100}%`,
                      background: `linear-gradient(90deg, #22c55e, ${stressColor})`,
                      borderRadius: "99px",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Suggestion */}
            {journal.suggestion && (
              <div
                style={{
                  background: "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ fontSize: "20px", flexShrink: 0 }}>💡</div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-blue)", marginBottom: "6px" }}>
                      Saran untuk Kamu
                    </p>
                    <p style={{ fontSize: "13.5px", color: "var(--text-primary)", lineHeight: "1.7" }}>
                      {journal.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "20px",
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-fadeIn"
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "380px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗑️</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Hapus Jurnal?
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Jurnal &ldquo;<strong>{journal.title}</strong>&rdquo; akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "#fff",
                  border: "1.5px solid var(--border-medium)",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "#dc2626",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function emotionEmoji(emotion: string) {
  const map: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    anxious: "😰",
    angry: "😠",
    calm: "😌",
    stressed: "😤",
    excited: "🤩",
    neutral: "😐",
    fear: "😨",
    love: "🥰",
  };
  return map[emotion?.toLowerCase()] || "💭";
}

function getStressColor(score?: number | null): string {
  if (score === null || score === undefined) return "#64748b";
  if (score <= 3) return "#22c55e";
  if (score <= 6) return "#f97316";
  return "#ef4444";
}

function getStressLabel(score?: number | null): string {
  if (score === null || score === undefined) return "-";
  if (score <= 3) return "Rendah";
  if (score <= 6) return "Sedang";
  return "Tinggi";
}
