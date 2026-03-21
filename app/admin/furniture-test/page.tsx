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

type ExpectedRecord = {
  expected_category?: string;
  expected_price?: string;
  expected_width_cm?: string;
  expected_depth_cm?: string;
  expected_height_cm?: string;
};

type CompareStatus = "PASS" | "FAIL" | "SKIP";

type FieldCompare = {
  label: string;
  expected: string;
  actual: string;
  status: CompareStatus;
};

const TOKEN_STORAGE_KEY = "admin_furniture_test_token";
const URLS_STORAGE_KEY = "admin_furniture_test_urls";
const EXPECTED_STORAGE_KEY = "admin_furniture_test_expected_map";

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

function normalizeString(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeNumberString(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const normalized = raw.replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return "";

  return String(num);
}

function compareStringField(expected: string, actual: string): CompareStatus {
  if (!expected.trim()) return "SKIP";
  return normalizeString(expected) === normalizeString(actual) ? "PASS" : "FAIL";
}

function compareNumberField(expected: string, actual: number | null | undefined): CompareStatus {
  if (!expected.trim()) return "SKIP";
  const e = normalizeNumberString(expected);
  const a =
    typeof actual === "number" && Number.isFinite(actual) ? String(actual) : "";
  return e !== "" && e === a ? "PASS" : "FAIL";
}

function getExpectedMapFromStorage(): Record<string, ExpectedRecord> {
  try {
    const raw = window.localStorage.getItem(EXPECTED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getComparison(result: RunResult, expected?: ExpectedRecord) {
  if (!result.ok || !result.importJob) {
    return {
      overall: "FAIL" as CompareStatus,
      fields: [] as FieldCompare[],
      passCount: 0,
      failCount: 0,
      skipCount: 0,
    };
  }

  const job = result.importJob;

  const fields: FieldCompare[] = [
    {
      label: "category",
      expected: expected?.expected_category?.trim() || "-",
      actual: job.extracted_category || "-",
      status: compareStringField(
        expected?.expected_category || "",
        job.extracted_category || ""
      ),
    },
    {
      label: "price",
      expected: expected?.expected_price?.trim() || "-",
      actual:
        typeof job.extracted_price === "number"
          ? String(job.extracted_price)
          : "-",
      status: compareNumberField(
        expected?.expected_price || "",
        job.extracted_price
      ),
    },
    {
      label: "width",
      expected: expected?.expected_width_cm?.trim() || "-",
      actual:
        typeof job.extracted_width_cm === "number"
          ? String(job.extracted_width_cm)
          : "-",
      status: compareNumberField(
        expected?.expected_width_cm || "",
        job.extracted_width_cm
      ),
    },
    {
      label: "depth",
      expected: expected?.expected_depth_cm?.trim() || "-",
      actual:
        typeof job.extracted_depth_cm === "number"
          ? String(job.extracted_depth_cm)
          : "-",
      status: compareNumberField(
        expected?.expected_depth_cm || "",
        job.extracted_depth_cm
      ),
    },
    {
      label: "height",
      expected: expected?.expected_height_cm?.trim() || "-",
      actual:
        typeof job.extracted_height_cm === "number"
          ? String(job.extracted_height_cm)
          : "-",
      status: compareNumberField(
        expected?.expected_height_cm || "",
        job.extracted_height_cm
      ),
    },
  ];

  const passCount = fields.filter((f) => f.status === "PASS").length;
  const failCount = fields.filter((f) => f.status === "FAIL").length;
  const skipCount = fields.filter((f) => f.status === "SKIP").length;

  const comparedFields = fields.filter((f) => f.status !== "SKIP");
  const overall: CompareStatus =
    comparedFields.length === 0
      ? "SKIP"
      : comparedFields.every((f) => f.status === "PASS")
      ? "PASS"
      : "FAIL";

  return {
    overall,
    fields,
    passCount,
    failCount,
    skipCount,
  };
}

function getStatusTone(status: CompareStatus) {
  if (status === "PASS") return styles.badgePass;
  if (status === "FAIL") return styles.badgeFail;
  return styles.badgeSkip;
}

export default function FurnitureTestPage() {
  const [token, setToken] = useState("");
  const [urlsText, setUrlsText] = useState("");
  const [expectedMap, setExpectedMap] = useState<Record<string, ExpectedRecord>>(
    {}
  );
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    const savedUrls = window.localStorage.getItem(URLS_STORAGE_KEY) || "";
    const savedExpectedMap = getExpectedMapFromStorage();

    setToken(savedToken);
    setUrlsText(savedUrls);
    setExpectedMap(savedExpectedMap);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }, [token]);

  useEffect(() => {
    window.localStorage.setItem(URLS_STORAGE_KEY, urlsText);
  }, [urlsText]);

  useEffect(() => {
    window.localStorage.setItem(
      EXPECTED_STORAGE_KEY,
      JSON.stringify(expectedMap)
    );
  }, [expectedMap]);

  const urls = useMemo(() => parseUrls(urlsText), [urlsText]);

  const orderedResults = useMemo(() => {
    const list = [...results];
    list.sort((a, b) => {
      const aCompare = getComparison(a, expectedMap[a.url]);
      const bCompare = getComparison(b, expectedMap[b.url]);

      const rank = (r: RunResult, c: ReturnType<typeof getComparison>) => {
        if (!r.ok) return 0;
        if (c.overall === "FAIL") return 1;
        if (c.overall === "SKIP") return 2;
        return 3;
      };

      return rank(a, aCompare) - rank(b, bCompare);
    });
    return list;
  }, [results, expectedMap]);

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;

  const compareSummary = useMemo(() => {
    let compared = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const result of results) {
      const comparison = getComparison(result, expectedMap[result.url]);
      if (!result.ok) {
        failed += 1;
        continue;
      }

      if (comparison.overall === "SKIP") {
        skipped += 1;
      } else {
        compared += 1;
        if (comparison.overall === "PASS") passed += 1;
        if (comparison.overall === "FAIL") failed += 1;
      }
    }

    return { compared, passed, failed, skipped };
  }, [results, expectedMap]);

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
    setExpectedMap({});
    setResults([]);
    setCurrentUrl(null);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(URLS_STORAGE_KEY);
    window.localStorage.removeItem(EXPECTED_STORAGE_KEY);
  }

  function updateExpected(url: string, patch: Partial<ExpectedRecord>) {
    setExpectedMap((prev) => ({
      ...prev,
      [url]: {
        ...(prev[url] || {}),
        ...patch,
      },
    }));
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>가구 파서 테스트 콘솔</h1>
          <p style={styles.desc}>
            URL별 정답값을 적어두고 import-product 결과와 자동 비교하는 검증
            화면이야. 핵심 필드는 category / price / width / depth / height만
            자동 판정한다.
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

        <section style={styles.expectedPanel}>
          <div style={styles.expectedPanelTitle}>정답값 입력</div>
          <p style={styles.expectedPanelDesc}>
            URL별 예상 정답을 적어두면 실행 후 자동 비교해준다. 비워두면 해당
            필드는 SKIP 처리된다.
          </p>

          {urls.length === 0 ? (
            <div style={styles.emptyBox}>먼저 URL을 입력해줘.</div>
          ) : (
            <div style={styles.expectedTableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thWide}>URL</th>
                    <th style={styles.th}>category</th>
                    <th style={styles.th}>price</th>
                    <th style={styles.th}>width</th>
                    <th style={styles.th}>depth</th>
                    <th style={styles.th}>height</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => {
                    const expected = expectedMap[url] || {};

                    return (
                      <tr key={url}>
                        <td style={styles.tdUrl}>{url}</td>
                        <td style={styles.td}>
                          <input
                            value={expected.expected_category || ""}
                            onChange={(e) =>
                              updateExpected(url, {
                                expected_category: e.target.value,
                              })
                            }
                            placeholder="sofa"
                            style={styles.tableInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            value={expected.expected_price || ""}
                            onChange={(e) =>
                              updateExpected(url, {
                                expected_price: e.target.value,
                              })
                            }
                            placeholder="499000"
                            style={styles.tableInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            value={expected.expected_width_cm || ""}
                            onChange={(e) =>
                              updateExpected(url, {
                                expected_width_cm: e.target.value,
                              })
                            }
                            placeholder="199"
                            style={styles.tableInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            value={expected.expected_depth_cm || ""}
                            onChange={(e) =>
                              updateExpected(url, {
                                expected_depth_cm: e.target.value,
                              })
                            }
                            placeholder="93"
                            style={styles.tableInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            value={expected.expected_height_cm || ""}
                            onChange={(e) =>
                              updateExpected(url, {
                                expected_height_cm: e.target.value,
                              })
                            }
                            placeholder="82"
                            style={styles.tableInput}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={styles.summaryRow}>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>전체 실행</div>
            <div style={styles.summaryValue}>{results.length}</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>API 성공</div>
            <div style={styles.summaryValue}>{successCount}</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>API 실패</div>
            <div style={styles.summaryValue}>{failCount}</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>비교 대상</div>
            <div style={styles.summaryValue}>{compareSummary.compared}</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>비교 통과</div>
            <div style={styles.summaryValue}>{compareSummary.passed}</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>비교 실패</div>
            <div style={styles.summaryValue}>{compareSummary.failed}</div>
          </div>
        </section>

        <section style={styles.resultsWrap}>
          {orderedResults.length === 0 ? (
            <div style={styles.emptyBox}>아직 실행 결과가 없어.</div>
          ) : (
            orderedResults.map((result, idx) => {
              const job = result.importJob;
              const expected = expectedMap[result.url];
              const comparison = getComparison(result, expected);

              return (
                <article
                  key={`${result.url}-${idx}`}
                  style={{
                    ...styles.card,
                    ...(result.ok
                      ? comparison.overall === "PASS"
                        ? styles.cardPass
                        : comparison.overall === "FAIL"
                        ? styles.cardFail
                        : styles.cardNeutral
                      : styles.cardFail),
                  }}
                >
                  <div style={styles.cardTop}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.cardTitleRow}>
                        <div style={styles.cardTitle}>
                          {result.ok ? "성공" : "실패"}
                        </div>
                        <span
                          style={{
                            ...styles.badge,
                            ...getStatusTone(
                              result.ok ? comparison.overall : "FAIL"
                            ),
                          }}
                        >
                          {result.ok ? comparison.overall : "FAIL"}
                        </span>
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
                        <Field
                          label="parser_version"
                          value={getParserVersion(job)}
                        />
                      </div>

                      <div style={styles.subSection}>
                        <div style={styles.subTitle}>자동 비교 결과</div>
                        <div style={styles.compareGrid}>
                          {comparison.fields.map((field) => (
                            <div key={field.label} style={styles.compareCard}>
                              <div style={styles.compareCardTop}>
                                <div style={styles.compareLabel}>
                                  {field.label}
                                </div>
                                <span
                                  style={{
                                    ...styles.badge,
                                    ...getStatusTone(field.status),
                                  }}
                                >
                                  {field.status}
                                </span>
                              </div>
                              <div style={styles.compareValueRow}>
                                <span style={styles.compareKey}>expected</span>
                                <span style={styles.compareValue}>
                                  {field.expected}
                                </span>
                              </div>
                              <div style={styles.compareValueRow}>
                                <span style={styles.compareKey}>actual</span>
                                <span style={styles.compareValue}>
                                  {field.actual}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
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
    background: "#0b1220",
    padding: "32px 20px",
    color: "#e5e7eb",
  },
  container: {
    maxWidth: 1440,
    margin: "0 auto",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 800,
    margin: 0,
    color: "#f8fafc",
  },
  desc: {
    marginTop: 10,
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  panel: {
    background: "#111827",
    border: "1px solid #253047",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
  },
  expectedPanel: {
    background: "#111827",
    border: "1px solid #253047",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
  },
  expectedPanelTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: 8,
  },
  expectedPanelDesc: {
    margin: "0 0 14px 0",
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 1.6,
  },
  label: {
    display: "block",
    fontWeight: 700,
    marginBottom: 8,
    color: "#e5e7eb",
  },
  input: {
    width: "100%",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "#0f172a",
    color: "#e5e7eb",
  },
  textarea: {
    width: "100%",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    background: "#0f172a",
    color: "#e5e7eb",
    lineHeight: 1.5,
  },
  helperRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
    color: "#94a3b8",
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
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonPrimary: {
    background: "#2563eb",
    color: "#eff6ff",
  },
  buttonSecondary: {
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #334155",
  },
  buttonDisabled: {
    background: "#475569",
    color: "#cbd5e1",
    cursor: "not-allowed",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  summaryBox: {
    background: "#111827",
    border: "1px solid #253047",
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "#f8fafc",
  },
  resultsWrap: {
    display: "grid",
    gap: 16,
  },
  emptyBox: {
    background: "#0f172a",
    border: "1px dashed #334155",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    color: "#94a3b8",
  },
  expectedTableWrap: {
    overflowX: "auto",
    border: "1px solid #253047",
    borderRadius: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1100,
    background: "#0f172a",
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: 12,
    color: "#94a3b8",
    borderBottom: "1px solid #253047",
    background: "#111827",
  },
  thWide: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: 12,
    color: "#94a3b8",
    borderBottom: "1px solid #253047",
    background: "#111827",
    minWidth: 420,
  },
  td: {
    padding: 10,
    borderBottom: "1px solid #1e293b",
    verticalAlign: "top",
  },
  tdUrl: {
    padding: 10,
    borderBottom: "1px solid #1e293b",
    verticalAlign: "top",
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 1.5,
    wordBreak: "break-all",
  },
  tableInput: {
    width: "100%",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
    background: "#111827",
    color: "#e5e7eb",
  },
  card: {
    background: "#111827",
    border: "1px solid #253047",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
  },
  cardPass: {
    borderColor: "#166534",
  },
  cardFail: {
    borderColor: "#991b1b",
  },
  cardNeutral: {
    borderColor: "#334155",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  cardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#f8fafc",
  },
  cardUrl: {
    color: "#94a3b8",
    wordBreak: "break-all",
    fontSize: 13,
    lineHeight: 1.5,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 58,
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.2,
  },
  badgePass: {
    background: "rgba(34,197,94,0.16)",
    color: "#86efac",
    border: "1px solid rgba(34,197,94,0.35)",
  },
  badgeFail: {
    background: "rgba(239,68,68,0.16)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.35)",
  },
  badgeSkip: {
    background: "rgba(148,163,184,0.16)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.35)",
  },
  errorBox: {
    background: "rgba(127,29,29,0.18)",
    border: "1px solid rgba(248,113,113,0.35)",
    color: "#fecaca",
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
    background: "#0f172a",
    border: "1px solid #253047",
    borderRadius: 12,
    padding: 12,
    minHeight: 72,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 6,
  },
  fieldValue: {
    fontWeight: 700,
    lineHeight: 1.5,
    wordBreak: "break-word",
    color: "#e5e7eb",
  },
  subSection: {
    marginTop: 16,
  },
  subTitle: {
    fontWeight: 800,
    marginBottom: 10,
    color: "#f8fafc",
  },
  compareGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 12,
  },
  compareCard: {
    background: "#0f172a",
    border: "1px solid #253047",
    borderRadius: 14,
    padding: 12,
  },
  compareCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  compareLabel: {
    fontWeight: 800,
    color: "#e5e7eb",
    textTransform: "uppercase",
    fontSize: 12,
  },
  compareValueRow: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 8,
  },
  compareKey: {
    color: "#94a3b8",
    fontSize: 11,
    textTransform: "uppercase",
  },
  compareValue: {
    color: "#e5e7eb",
    fontWeight: 700,
    wordBreak: "break-word",
    lineHeight: 1.4,
  },
  pre: {
    margin: 0,
    background: "#020617",
    color: "#e2e8f0",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: 14,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: 12,
    lineHeight: 1.6,
  },
};