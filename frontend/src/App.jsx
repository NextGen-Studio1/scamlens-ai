import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ScanSearch,
  Upload,
  AlertTriangle,
  ArrowRight,
  LoaderCircle,
  RotateCcw,
  CheckCircle2,
  FileSearch,
  ListChecks,
  Quote,
  LockKeyhole,
  Palette,
  Sparkles,
  Copy,
  Check,
  HelpCircle,
  X,
  FileText,
} from "lucide-react";
import "./App.css";
import ReportCybercrime from "./components/ReportCybercrime";
import Login from './Login';
import Register from './Register';
import { useLocation, Link } from "react-router-dom";

const PALETTES = [
  { id: "cyber", name: "Cyber Sentinel", color: "#38bdf8", ring: "#2563eb" },
  { id: "emerald", name: "Matrix Emerald", color: "#34d399", ring: "#059669" },
  { id: "crimson", name: "Obsidian Crimson", color: "#fb7185", ring: "#e11d48" },
  { id: "violet", name: "Deep Cosmos", color: "#c084fc", ring: "#9333ea" },
  { id: "amber", name: "Solar Flare", color: "#fbbf24", ring: "#d97706" },
];

const SAMPLE_MESSAGES = [
  {
    id: "bank",
    label: "💳 Bank OTP Scam",
    text: "URGENT: Your Chase checking account has been locked due to suspicious activity. Verify your identity immediately to prevent permanent suspension: http://chase-secure-verify.net/login. Enter your card details and OTP.",
  },
  {
    id: "delivery",
    label: "📦 Delivery Fee Phishing",
    text: "USPS Notification: We were unable to deliver your package #US94821034 because of an incomplete address. A $1.85 redelivery fee is required. Update your information here: https://usps-track-parcel-redelivery.com/pay within 12 hours.",
  },
  {
    id: "crypto",
    label: "🎁 Crypto Airdrop Scam",
    text: "CONGRATULATIONS! You won 2.5 ETH in the Binance Community Airdrop! Connect your wallet and approve the transaction to claim your reward instantly: https://claim-binance-airdrop-bonus.xyz (Offer valid for 30 minutes).",
  },
  {
    id: "job",
    label: "💼 Remote Job Offer",
    text: "Hello! I am Sarah from Global HR. We reviewed your profile and you are selected for a Remote Data Reviewer position ($45/hr). No experience needed. Contact our Telegram manager @HR_GlobalTask to receive your $200 onboarding bonus.",
  },
];

function cleanText(text = "") {
  return text
    .replace(/\*\*/g, "")
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}

function parseAnalysis(text) {
  const getSection = (name) => {
    const headings = "RISK LEVEL|VERDICT|WARNING SIGNS|EVIDENCE|SAFE NEXT STEPS";
    const pattern = new RegExp(
      `(?:\\*\\*)?${name}(?:\\*\\*)?\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:\\*\\*)?(?:${headings})(?:\\*\\*)?\\s*:|$)`,
      "i"
    );
    return text.match(pattern)?.[1]?.trim() || "";
  };

  const listItems = (section) =>
    section
      .split("\n")
      .map(cleanText)
      .filter(Boolean);

  const riskMatch = text.match(/RISK LEVEL\s*:\s*(High|Medium|Low|Unclear)/i);

  return {
    risk: riskMatch?.[1] || "Unclear",
    verdict: cleanText(getSection("VERDICT")) || text,
    warnings: listItems(getSection("WARNING SIGNS")),
    evidence: listItems(getSection("EVIDENCE")),
    steps: listItems(getSection("SAFE NEXT STEPS")),
  };
}

function ReportSection({ icon: Icon, title, children, className = "" }) {
  return (
    <section className={`report-card ${className}`}>
      <div className="report-card-heading">
        <span className="report-icon">
          <Icon size={19} />
        </span>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function App() {
  const [palette, setPalette] = useState(() => {
    return localStorage.getItem("scamlens_palette") || "cyber";
  });
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("scamlens_user")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("scamlens_user")) || null;
      setUser(stored);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("scamlens_palette", palette);
  }, [palette]);

  function handleLogout() {
    localStorage.removeItem("scamlens_user");
    localStorage.removeItem("scamlens_token");
    setUser(null);
  }

  function handleFile(file) {
    setError("");
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function selectImage(event) {
    const file = event.target.files?.[0];
    handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  async function handleAnalyze(event) {
    event.preventDefault();
    setError("");
    setAnalysis("");

    if (!message.trim() && !image) {
      setError("Enter a message or upload a screenshot first.");
      return;
    }

    const data = new FormData();
    data.append("message", message);
    if (image) data.append("image", image);

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed.");
      }

      setAnalysis(result.analysis);
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessage("");
    setImage(null);
    setPreview("");
    setAnalysis("");
    setError("");
    const input = document.querySelector("#screenshot");
    if (input) input.value = "";
  }

  function copyReport() {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const report = analysis ? parseAnalysis(analysis) : null;
  const risk = report?.risk || "Unclear";

  const riskDescriptions = {
    High: "Multiple strong warning signs detected. High likelihood of deception, credential theft, or unauthorized fund transfer.",
    Medium: "Suspicious indicators detected. Verification required through independent, trusted channels before taking any action.",
    Low: "Few warning signs detected. However, exercise standard digital caution as legitimate appearances can still be mimicked.",
    Unclear: "Insufficient or ambiguous evidence to make a confident risk determination. Treat with caution.",
  };

  const riskOrder = ["Low", "Medium", "High", "Unclear"];

  if (location.pathname === '/login') {
    return <Login />;
  }

  if (location.pathname === '/register') {
    return <Register />;
  }

  return (
    <div className="app-shell" data-theme={palette}>
      <header className="topbar">
        <div className="brand-group">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <ShieldCheck size={22} />
            </span>
            <span className="brand-title">
              ScamLens<span className="accent"> AI</span>
            </span>
          </Link>
          <span className="header-status">
            <span className="status-dot" /> Threat Detection Engine
          </span>
        </div>

        <div className="topbar-actions">
          {/* Color Palette Switcher */}
          <div className="palette-picker" title="Switch Color Palette">
            <span className="palette-label">
              <Palette size={14} />
              <span className="palette-text">Theme:</span>
            </span>
            <div className="palette-options" role="radiogroup" aria-label="Color Palette">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`palette-btn ${palette === p.id ? "active" : ""}`}
                  onClick={() => setPalette(p.id)}
                  aria-label={`Switch to ${p.name} palette`}
                  title={p.name}
                >
                  <span
                    className="palette-swatch"
                    style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.ring}66` }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="nav-auth-buttons">
            {user ? (
              <>
                <span className="nav-user-greeting">
                  <span className="user-dot" /> {user.name}
                </span>
                <button
                  type="button"
                  className="nav-logout-btn"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-login-btn">
                  Login
                </Link>
                <Link to="/register" className="nav-register-btn">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        {/* Hero Section */}
        <section className="hero">
          <div className="eyebrow">
            <ScanSearch size={15} />
            <span>AI-POWERED PHISHING & FRAUD DETECTION</span>
          </div>
          <h1>
            Pause before you <br />
            <span className="gradient-text">trust the message.</span>
          </h1>
          <p>
            Verify suspicious SMS alerts, phishing emails, payment requests, and
            screenshots with neural safety intelligence before you click or reply.
          </p>
          <div className="trust-points">
            <span>
              <ShieldCheck size={16} /> Evidence-backed verdicts
            </span>
            <span>
              <Sparkles size={16} /> Multimodal text & image scan
            </span>
            <span>
              <LockKeyhole size={16} /> Zero credential harvesting
            </span>
          </div>
        </section>

        {/* Input Workspace */}
        <section className="workspace">
          <div className="section-heading">
            <div>
              <h2>Analyze suspicious content</h2>
              <p>Paste the raw text, upload a screenshot, or test an example scenario.</p>
            </div>
            <div className="model-pill">
              <span className="pulse-indicator" />
              <span>GEMMA 4 SAFETY</span>
            </div>
          </div>

          {/* Quick-fill Sample Chips */}
          <div className="sample-prompts-bar">
            <span className="sample-label">
              <FileText size={13} /> Try test scenario:
            </span>
            <div className="sample-chips">
              {SAMPLE_MESSAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  className="sample-chip"
                  onClick={() => {
                    setMessage(sample.text);
                    setError("");
                  }}
                  title="Click to load into message box"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="field-group">
              <label htmlFor="message">
                Message content
                <span className="field-hint">SMS, WhatsApp, email, or chat snippet</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={12000}
                placeholder="Paste the suspicious message, urgent warning, investment offer, or OTP verification request here..."
              />
              <div className="field-meta">
                <span>🛡️ Never submit passwords, credit card CVVs, or active OTPs.</span>
                <span className="char-count">{message.length} / 12,000</span>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="screenshot">
                Screenshot evidence <span className="optional">(optional)</span>
              </label>

              <div
                className={`upload-area ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="preview-wrap">
                    <img src={preview} alt="Selected screenshot preview" />
                    <button
                      className="remove-image"
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setPreview("");
                        const input = document.querySelector("#screenshot");
                        if (input) input.value = "";
                      }}
                    >
                      <X size={15} /> Remove image
                    </button>
                  </div>
                ) : (
                  <label className="upload-prompt" htmlFor="screenshot">
                    <span className="upload-icon">
                      <Upload size={22} />
                    </span>
                    <strong>Drop screenshot here or browse</strong>
                    <span>Supports PNG, JPG, or WebP up to 5 MB</span>
                    <span className="browse-button">Select Image File</span>
                  </label>
                )}
                <input
                  id="screenshot"
                  className="file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={selectImage}
                />
              </div>
            </div>

            {error && (
              <div className="error-box" role="alert">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button className="analyze-button" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={20} />
                  <span>Analyzing message evidence...</span>
                </>
              ) : (
                <>
                  <span>Run Safety Intelligence Analysis</span>
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <p className="privacy-note">
            Your inputs are analyzed in real time using Gemma AI. All sensitive
            identifiers should be redacted before analysis.
          </p>
        </section>

        {/* Results Section */}
        {report && (
          <section className="results" aria-live="polite">
            <div className="report-header">
              <div>
                <div className="eyebrow success">
                  <CheckCircle2 size={15} />
                  <span>THREAT INTELLIGENCE REPORT</span>
                </div>
                <h2>Safety analysis verdict</h2>
                <p>Detailed breakdown of detected indicators, intent, and suggested defense steps.</p>
              </div>

              <div className="report-actions">
                <button
                  type="button"
                  className={`copy-button ${copied ? "copied" : ""}`}
                  onClick={copyReport}
                  title="Copy full report to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={15} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={15} /> Copy Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Risk Spectrum Segmented Bar */}
            <div className="risk-spectrum-container">
              <span className="spectrum-label">Threat Spectrum:</span>
              <div className="risk-spectrum-bar">
                {riskOrder.map((level) => {
                  const isActive = risk.toLowerCase() === level.toLowerCase();
                  return (
                    <div
                      key={level}
                      className={`spectrum-segment seg-${level.toLowerCase()} ${isActive ? "active" : ""
                        }`}
                    >
                      <span className="segment-dot" />
                      <span className="segment-title">{level}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Risk Banner */}
            <div className={`risk-banner risk-${risk.toLowerCase()}`}>
              <div className="risk-symbol">
                {risk.toLowerCase() === "high" ? (
                  <ShieldAlert size={30} />
                ) : risk.toLowerCase() === "low" ? (
                  <ShieldCheck size={30} />
                ) : risk.toLowerCase() === "medium" ? (
                  <AlertTriangle size={30} />
                ) : (
                  <HelpCircle size={30} />
                )}
              </div>
              <div className="risk-copy">
                <div className="risk-eyebrow">ASSESSED THREAT LEVEL</div>
                <h3>{risk} Risk Detected</h3>
                <p>{riskDescriptions[risk]}</p>
              </div>
              <span className={`risk-pill ${risk.toLowerCase()}`}>
                {risk.toUpperCase()} RISK
              </span>
            </div>

            {/* Verdict Card */}
            <ReportSection icon={FileSearch} title="Verdict & Assessment" className="verdict-section">
              <p className="verdict-text">{report.verdict}</p>
            </ReportSection>

            {/* Warning Signs Card */}
            <ReportSection
              icon={AlertTriangle}
              title="Warning Signs & Red Flags"
              className="warning-section"
            >
              {report.warnings.length > 0 ? (
                <div className="warning-list">
                  {report.warnings.map((item, index) => {
                    const separator = item.indexOf(":");
                    const heading =
                      separator > -1
                        ? item.slice(0, separator).replace(/^\*\*|\*\*$/g, "")
                        : "";
                    const detail =
                      separator > -1
                        ? item.slice(separator + 1).trim()
                        : item;

                    return (
                      <div className="warning-item" key={`${index}-${item}`}>
                        <span className="warning-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="warning-content">
                          {heading && <h4>{heading}</h4>}
                          <p>{cleanText(detail)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-report">
                  No explicit red flags were isolated in the message structure.
                </p>
              )}
            </ReportSection>

            {/* Evidence Card */}
            <ReportSection icon={Quote} title="Observed Evidence in Content" className="evidence-section">
              {report.evidence.length > 0 ? (
                <div className="evidence-list">
                  {report.evidence.map((item, index) => (
                    <blockquote key={`${index}-${item}`}>
                      <span className="quote-mark">“</span>
                      <p>{cleanText(item)}</p>
                    </blockquote>
                  ))}
                </div>
              ) : (
                <p className="empty-report">
                  No verbatim deceptive phrases were extracted.
                </p>
              )}
            </ReportSection>

            {/* Safe Next Steps Card */}
            <ReportSection
              icon={ListChecks}
              title="Recommended Defensive Actions"
              className="steps-section"
            >
              {report.steps.length > 0 ? (
                <div className="steps-list">
                  {report.steps.map((item, index) => (
                    <div className="step-item" key={`${index}-${item}`}>
                      <span className="step-icon">
                        <CheckCircle2 size={18} />
                      </span>
                      <p>{cleanText(item)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-report">
                  Verify the sender through an official website or phone directory before taking action.
                </p>
              )}
            </ReportSection>

            {/* Security Notice */}
            <div className="report-disclaimer">
              <LockKeyhole size={20} />
              <p>
                <strong>Security Advisory:</strong> This report is an AI-assisted threat
                assessment. High-risk requests should always be reported to your IT security
                team or relevant fraud prevention department.
              </p>
            </div>

            <div className="results-actions">
              <ReportCybercrime />
              <button className="reset-button" onClick={reset} type="button">
                <RotateCcw size={16} />
                <span>Analyze another message</span>
              </button>
            </div>
          </section>
        )}

        {/* Modern Footer */}
        <footer>
          <div className="footer-left">
            <span>ScamLens AI · Digital Threat Intelligence</span>
            <span className="footer-dot">·</span>
            <span>Powered by Gemma 4</span>
          </div>
          <div className="footer-right">
            <span>Pause. Verify. Protect.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
