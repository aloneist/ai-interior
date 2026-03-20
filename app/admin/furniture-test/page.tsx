"use client";

import { useEffect, useMemo, useState } from "react";

type ImportJob = {
  id?: string | number;
  source_site?: string | null;
  source_url?: string | null;
  extracted_name?: string | null;
  extracted_brand?: string | null;
  extracted_category?: string | null;
  extracted_price?: number | null;
  extracted_material?: string | null;
  extracted_width_cm?: number | null;
  extracted_depth_cm?: number | null;
  extracted_height_cm?: number | null;
  extracted_color_options?: string[] | null;
  extracted_size_label?: string | null;
  extracted_capacity_label?: string | null;
  extracted_image_urls?: string[] | null;
  extracted_source_variant_ids?: string[] | null;
  extracted_option_summaries?: string[] | null;
  extracted_source_site?: string | null;
  extracted_affiliate_url?: string | null;
  extracted_confidence?: number | null;
  extraction_notes?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
};

type RunResult = {
  url: string;
  ok: boolean;
  importJob?: ImportJob | null;
  error?: string | null;
};

const TOKEN_STORAGE_KEY = "admin_furniture_test_token";
const URLS_STORAGE_KEY = "admin_furniture_test_urls";

function parseUrls(input: string): string[] {
  return input
    .split(/\n|,/)
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);
}

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatPrice(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function formatDim(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return `${value} cm`;
}

function getNotesPreview(notes?: string | null) {
  if (!notes) return "-";

  try {
    const parsed = JSON.parse(notes);
    if (parsed?.parser_debug) {
      return prettyJson(parsed.parser_debug);
    }
    return prettyJson(parsed);
  } catch {
    return notes;
  }
}

//109까지 테스트 가독성용 코드
function getParserDebug(job?: ImportJob | null) {
  if (!job?.extraction_notes) return null;

  try {
    const parsed = JSON.parse(job.extraction_notes);
    return parsed?.parser_debug ?? null;
  } catch {
    return null;
  }
}

function getParserVersion(job?: ImportJob | null) {
  const debug = getParserDebug(job);
  return debug?.parser_version ?? "-";
}

function getRawDimensionPreview(job?: ImportJob | null) {
  const debug = getParserDebug(job);
  return debug?.raw_dimension_text_preview ?? "-";
}

function getDimensionSummary(job?: ImportJob | null) {
  if (!job) return "-";
  const w = job.extracted_width_cm ?? "null";
  const d = job.extracted_depth_cm ?? "null";
  const h = job.extracted_height_cm ?? "null";
  return `W ${w} / D ${d} / H ${h}`;
}

export default function FurnitureTestPage() {
  const [token, setToken] = useState("");
  const [urlsText, setUrlsText] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    const savedUrls = window.localStorage.getItem(URLS_STORAGE_KEY) || "";

    setToken(savedToken);
    setUrlsText(savedUrls);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }, [token]);

  useEffect(() => {
    window.localStorage.setItem(URLS_STORAGE_KEY, urlsText);
  }, [urlsText]);

  const urls = useMemo(() => parseUrls(urlsText), [urlsText]);

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;

  async function runSingle(url: string): Promise<RunResult> {
    try {
      const res = await fetch("/api/import-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ sourceUrl: url }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          url,
          ok: false,
          error: data?.message || data?.error || `HTTP ${res.status}`,
        };
      }

      return {
        url,
        ok: true,
        importJob: data?.import_job ?? null,
      };
    } catch (error: any) {
      return {
        url,
        ok: false,
        error: error?.message || "Unknown error",
      };
    }
  }

  async function handleRun() {
    if (!token.trim()) {
      alert("ADMIN TOKEN을 입력해줘.");
      return;
    }

    if (urls.length === 0) {
      alert("가구 URL을 1개 이상 입력해줘.");
      return;
    }

    setIsRunning(true);
    setResults([]);

    const nextResults: RunResult[] = [];

    for (const url of urls) {
      setCurrentUrl(url);
      const result = await runSingle(url);
      nextResults.push(result);
      setResults([...nextResults]);
    }

    setCurrentUrl(null);
    setIsRunning(false);
  }

  function handleClearResults() {
    setResults([]);
    setCurrentUrl(null);
  }

  function handleClearAll() {
    setToken("");
    setUrlsText("");
    setResults([]);
    setCurrentUrl(null);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(URLS_STORAGE_KEY);
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>가구 파서 테스트 콘솔</h1>
          <p style={styles.desc}>
            URL을 넣고 import-product를 바로 호출해서, Supabase upsert 결과와 핵심
            추출값만 빠르게 확인하는 테스트 화면이야.
          </p>
        </header>

        <section style={styles.panel}>
          <label style={styles.label}>ADMIN TOKEN</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="x-admin-token 값 입력"
            style={styles.input}
          />

          <label style={{ ...styles.label, marginTop: 16 }}>
            가구 URL 목록
          </label>
          <textarea
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            placeholder={`한 줄에 하나씩 입력\nhttps://www.ikea.com/kr/ko/p/...\nhttps://www.ikea.com/kr/ko/p/...`}
            rows={8}
            style={styles.textarea}
          />

          <div style={styles.helperRow}>
            <span>감지된 URL 수: {urls.length}</span>
            {isRunning && currentUrl ? (
              <span>진행 중: {currentUrl}</span>
            ) : (
              <span>대기 중</span>
            )}
          </div>

          <div style={styles.buttonRow}>
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                ...styles.button,
                ...(isRunning ? styles.buttonDisabled : styles.buttonPrimary),
              }}
            >
              {isRunning ? "분석 중..." : "분석 시작"}
            </button>

            <button onClick={handleClearResults} style={styles.buttonSecondary}>
              결과만 지우기
            </button>

            <button onClick={handleClearAll} style={styles.buttonSecondary}>
              전체 초기화
            </button>
          </div>
        </section>

        <section style={styles.summaryRow}>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>전체</div>
            <div style={styles.summaryValue}>{results.length}</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>성공</div>
            <div style={styles.summaryValue}>{successCount}</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>실패</div>
            <div style={styles.summaryValue}>{failCount}</div>
          </div>
        </section>

        <section style={styles.resultsWrap}>
          {results.length === 0 ? (
            <div style={styles.emptyBox}>아직 실행 결과가 없어.</div>
          ) : (
            results.map((result, idx) => {
              const job = result.importJob;

              return (
                <article
                  key={`${result.url}-${idx}`}
                  style={{
                    ...styles.card,
                    borderColor: result.ok ? "#d0d7de" : "#f1aeb5",
                  }}
                >
                  <div style={styles.cardTop}>
                    <div>
                      <div style={styles.cardTitle}>
                        {result.ok ? "성공" : "실패"}
                      </div>
                      <div style={styles.cardUrl}>{result.url}</div>
                    </div>
                  </div>

                  {!result.ok ? (
                    <div style={styles.errorBox}>
                      {result.error || "알 수 없는 오류"}
                    </div>
                  ) : (
                    <>
                      <div style={styles.grid}>
                        <Field label="상품명" value={job?.extracted_name} />
                        <Field label="브랜드" value={job?.extracted_brand} />
                        <Field
                          label="카테고리"
                          value={job?.extracted_category}
                        />
                        <Field
                          label="가격"
                          value={formatPrice(job?.extracted_price)}
                        />
                        <Field label="재질" value={job?.extracted_material} />
                        <Field
                          label="폭"
                          value={formatDim(job?.extracted_width_cm)}
                        />
                        <Field
                          label="깊이"
                          value={formatDim(job?.extracted_depth_cm)}
                        />
                        <Field
                          label="높이"
                          value={formatDim(job?.extracted_height_cm)}
                        />
                        <Field
                          label="신뢰도"
                          value={
                            typeof job?.extracted_confidence === "number"
                              ? `${job.extracted_confidence}`
                              : "-"
                          }
                        />
                        <Field label="상태" value={job?.status} />
                        <Field
                          label="source_site"
                          value={job?.source_site || job?.extracted_source_site}
                        />
                        <Field
                          label="affiliate_url"
                          value={job?.extracted_affiliate_url}
                        />
                        <Field label="parser_version" value={getParserVersion(job)} />
                      </div>

                      <div style={styles.subSection}>
                        <div style={styles.subTitle}>치수 요약</div>
                        <pre style={styles.pre}>{getDimensionSummary(job)}</pre>
                      </div>

                      <div style={styles.subSection}>
                        <div style={styles.subTitle}>이미지 URL</div>
                        <pre style={styles.pre}>
                          {job?.extracted_image_urls?.length
                            ? prettyJson(job.extracted_image_urls)
                            : "-"}
                        </pre>
                      </div>

                      <div style={styles.subSection}>
                        <div style={styles.subTitle}>옵션 요약</div>
                        <pre style={styles.pre}>
                          {job?.extracted_option_summaries?.length
                            ? prettyJson(job.extracted_option_summaries)
                            : "-"}
                        </pre>
                      </div>

                      <div style={styles.subSection}>
                        <div style={styles.subTitle}>치수 원문 미리보기</div>
                        <pre style={styles.pre}>{getRawDimensionPreview(job)}</pre>
                      </div>

                      <div style={styles.subSection}>
                        <div style={styles.subTitle}>추출 노트 / parser debug</div>
                        <pre style={styles.pre}>
                          {getNotesPreview(job?.extraction_notes)}
                        </pre>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      <div style={styles.fieldValue}>
        {value === null || value === undefined || value === "" ? "-" : String(value)}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fa",
    padding: "32px 20px",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  desc: {
    marginTop: 8,
    color: "#57606a",
    lineHeight: 1.6,
  },
  panel: {
    background: "#fff",
    border: "1px solid #d0d7de",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    border: "1px solid #d0d7de",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    border: "1px solid #d0d7de",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    background: "#fff",
    lineHeight: 1.5,
  },
  helperRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
    color: "#57606a",
    fontSize: 13,
    flexWrap: "wrap",
  },
  buttonRow: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
  },
  button: {
    border: 0,
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonPrimary: {
    background: "#111827",
    color: "#fff",
  },
  buttonSecondary: {
    background: "#e5e7eb",
    color: "#111827",
  },
  buttonDisabled: {
    background: "#9ca3af",
    color: "#fff",
    cursor: "not-allowed",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  summaryBox: {
    background: "#fff",
    border: "1px solid #d0d7de",
    borderRadius: 14,
    padding: 16,
  },
  summaryLabel: {
    color: "#57606a",
    fontSize: 13,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 700,
  },
  resultsWrap: {
    display: "grid",
    gap: 16,
  },
  emptyBox: {
    background: "#fff",
    border: "1px dashed #d0d7de",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    color: "#57606a",
  },
  card: {
    background: "#fff",
    border: "1px solid #d0d7de",
    borderRadius: 16,
    padding: 20,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 6,
  },
  cardUrl: {
    color: "#57606a",
    wordBreak: "break-all",
    fontSize: 13,
  },
  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    borderRadius: 12,
    padding: 14,
    whiteSpace: "pre-wrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 16,
  },
  field: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    minHeight: 72,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#57606a",
    marginBottom: 6,
  },
  fieldValue: {
    fontWeight: 600,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  subSection: {
    marginTop: 14,
  },
  subTitle: {
    fontWeight: 700,
    marginBottom: 8,
  },
  pre: {
    margin: 0,
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: 12,
    lineHeight: 1.5,
  },
};