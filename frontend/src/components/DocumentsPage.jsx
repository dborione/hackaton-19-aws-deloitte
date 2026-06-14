import React, { useState, useRef, useEffect } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import config from "../config";
import { questions as identityQuestions } from "./pages/personal-administrative/identity";
import { questions as currentHomeQuestions } from "./pages/personal-administrative/currentHome";
import { questions as insuranceQuestions } from "./pages/financial-planning/insurance";

/*
  Maps common Textract FORMS keys → identity page question IDs.
  Textract returns keys in uppercase with spaces/underscores — we normalize.
*/
const IDENTITY_FIELD_MAP = {
    // Name / last name variants (French & German & English)
    "surname": "birth_name",
    "last name": "birth_name",
    "nom": "birth_name",
    "family name": "birth_name",
    "last_name": "birth_name",
    "nom de naissance": "birth_name",
    "name": "birth_name",  // Belgian ID: "Name / Name" → birth_name
    "Nom / Name": "birth_name",  // Belgian ID: bilingual
    "Naam / Name": "birth_name",  // Belgian ID: bilingual

    // First name variants
    "first name": "first_names",
    "given name": "first_names",
    "given names": "first_names",
    "first_name": "first_names",
    "prénom": "first_names",
    "prenom": "first_names",
    "prénoms": "first_names",
    "prenoms": "first_names",
    "vornamen": "first_names",  // German for given names
    "given names / vornamen": "first_names",  // bilingual
    "Given names": "first_names",  // bilingual
    "Prénoms / Given names": "first_names",  // bilingual
    "Voornamen / Given names": "first_names",  // bilingual
    
    // Birth date variants
    "date of birth": "birth_date",
    "birth date": "birth_date",
    "geburtsdatum": "birth_date",  // German
    "date de naissance": "birth_date",
    "dob": "birth_date",
    "birthdate": "birth_date",
    "date_of_birth": "birth_date",
    "Date or birth": "birth_date",  // Belgian ID: bilingual

    // Birth place variants
    "place of birth": "birth_place",
    "lieu de naissance": "birth_place",
    "birthplace": "birth_place",
    "birth place": "birth_place",
    "Lieu et date de naissance / Place and date of birth": "birth_place",  // Belgian ID

    // National register / Card number variants
    "national register": "national_register_number",
    "nationalregisternr": "national_register_number",
    "n° national": "national_register_number",
    "national number": "national_register_number",
    "id number": "national_register_number",
    "numéro national": "national_register_number",
    "card number": "national_register_number",
    "card no": "national_register_number",
    "card n": "national_register_number",
    "ausweisnr": "national_register_number",
    "n° carte": "national_register_number",
    "numéro de carte": "national_register_number",
    "Rijksregisternr. / National Register N°": "national_register_number",  // Belgian ID
    "Nationalregisternr. / National Register N°": "national_register_number",  // Belgian ID

    // Full name (for later reassembly if needed)
    "full name": "cover_full_name",
    "nom prénom": "cover_full_name",
};

const INSURANCE_FIELD_MAP = {
    "company": "insurance_company",
    "compagnie": "insurance_company",
    "policy number": "insurance_policy_number",
    "numéro de police": "insurance_policy_number",
    "broker": "insurance_broker",
    "courtier": "insurance_broker",
};

const CURRENT_HOME_FIELD_MAP = {
    "address": "address",
    "adresse": "address",
    "street": "address",
    "postal code": "postal_code",
    "code postal": "postal_code",
    "zip": "postal_code",
    "city": "locality",
    "ville": "locality",
    "locality": "locality",
    "phone": "phone_number",
    "téléphone": "phone_number",
    "email": "email",
    "e-mail": "email",
};

function normalizeKey(key) {
    return (key || "").toLowerCase().trim().replace(/_/g, " ");
}

/**
 * Maps Textract forms JSON to identity question IDs.
 * Handles bilingual keys with "/" separator (e.g., "Vornamen / Given names").
 * Tries full key first, then the part after "/" if bilingual.
 */
function mapToAnswers(forms, fieldMap) {
    const answers = {};
    for (const [rawKey, value] of Object.entries(forms)) {
        if (!value) continue;
        
        const normalized = normalizeKey(rawKey);
        
        // Try full normalized key first
        if (fieldMap[normalized]) {
            answers[fieldMap[normalized]] = value;
            continue;
        }
        
        // Try splitting by "/" and using the part after it (for bilingual keys)
        if (rawKey.includes("/")) {
            const parts = rawKey.split("/").map(p => p.trim());
            for (const part of parts) {
                const partNormalized = normalizeKey(part);
                if (fieldMap[partNormalized]) {
                    answers[fieldMap[partNormalized]] = value;
                    break;
                }
            }
        }
    }

    // Build cover_full_name from first_names + birth_name if not already set
    if (!answers["cover_full_name"] && (answers["first_names"] || answers["birth_name"])) {
        answers["cover_full_name"] = [answers["first_names"], answers["birth_name"]]
            .filter(Boolean)
            .join(" ");
    }

    return answers;
}

const DOCUMENT_CATEGORIES = [
    {
        id: "identity",
        icon: "🪪",
        title: "Identity Document",
        color: "#4f46e5",
        gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        description: "National ID card, passport, or driver's license.",
        examples: ["ID Card", "Passport", "Driver's License"],
        acceptHint: "Photo or PDF of your identity document",
        pageId: "identity",
        questions: identityQuestions,
        fieldMap: IDENTITY_FIELD_MAP,
    },
    {
        id: "home",
        icon: "🏠",
        title: "Proof of Address",
        color: "#059669",
        gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
        description: "Water, electricity, or gas bill less than 3 months old.",
        examples: ["Water Bill", "Electricity Bill", "Bank Statement"],
        acceptHint: "Photo or PDF of proof of address",
        pageId: "current-home",
        questions: currentHomeQuestions,
        fieldMap: CURRENT_HOME_FIELD_MAP,
    },
    {
        id: "insurance",
        icon: "📋",
        title: "Insurance",
        color: "#d97706",
        gradient: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
        description: "Life insurance or funeral insurance policy.",
        examples: ["Life Insurance", "Funeral Insurance"],
        acceptHint: "Photo or PDF of insurance contract",
        pageId: "insurance",
        questions: insuranceQuestions,
        fieldMap: INSURANCE_FIELD_MAP,
    },
    {
        id: "other",
        icon: "📄",
        title: "Other Document",
        color: "#6b7280",
        gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
        description: "Any other document relevant to your file.",
        examples: ["Will", "Contract", "Certificate"],
        acceptHint: "Photo or PDF",
        pageId: null,        // No autofill for "other"
        questions: [],
        fieldMap: {},
    },
];

const styles = {
    page: { maxWidth: 900, margin: "0 auto", padding: "0 16px 64px" },
    header: { marginBottom: 32, paddingTop: 8 },
    h1: { fontSize: 28, fontWeight: "bold", color: "#4f4f4f", margin: "0 0 8px" },
    subtitle: { color: "#555", lineHeight: 1.6 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 },
    card: { borderRadius: 12, padding: 20, cursor: "pointer", color: "#fff", transition: "transform .15s, box-shadow .15s", position: "relative", overflow: "hidden" },
    cardIcon: { fontSize: 36, marginBottom: 8 },
    cardTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
    cardDesc: { fontSize: 13, opacity: 0.85, lineHeight: 1.4 },
    cardBadge: { position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: "bold" },
    uploadArea: { background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 28 },
    backBtn: { background: "transparent", color: "#bd2430", border: "1px solid #bd2430", borderRadius: 6, padding: "8px 14px", cursor: "pointer", marginBottom: 20, fontSize: 14 },
    dropzone: { border: "2px dashed #ddd", borderRadius: 10, padding: 40, textAlign: "center", cursor: "pointer", color: "#888", transition: "all .2s" },
    dropActive: { borderColor: "#4f46e5", background: "#f5f3ff" },
    uploadBtn: { display: "inline-block", marginTop: 16, padding: "10px 28px", borderRadius: 6, border: "none", fontWeight: "bold", fontSize: 15, cursor: "pointer", color: "#fff" },
    statusBox: { marginTop: 16, padding: "12px 16px", borderRadius: 8, fontSize: 14, lineHeight: 1.5 },
    autofillBox: { marginTop: 20, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 16 },
    fieldRow: { display: "flex", gap: 8, marginBottom: 6, fontSize: 13 },
    fieldKey: { color: "#555", minWidth: 180 },
    fieldVal: { fontWeight: "600", color: "#111" },
    examplesWrap: { marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" },
    exampleChip: { background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "3px 10px", fontSize: 12 },
};

function CategoryCard({ cat, onClick, uploadedCount }) {
    return (
        <div
            style={{ ...styles.card, background: cat.gradient }}
            onClick={onClick}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
        >
            {uploadedCount > 0 && (
                <span style={styles.cardBadge}>✓ {uploadedCount}</span>
            )}
            <div style={styles.cardIcon}>{cat.icon}</div>
            <div style={styles.cardTitle}>{cat.title}</div>
            <div style={styles.cardDesc}>{cat.description}</div>
            <div style={styles.examplesWrap}>
                {cat.examples.map(ex => <span key={ex} style={styles.exampleChip}>{ex}</span>)}
            </div>
        </div>
    );
}

function UploadZone({ category, token, onSuccess }) {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [phase, setPhase] = useState("idle");   // idle | uploading | processing | done | error
    const [autofilled, setAutofilled] = useState(null); // { fieldId: value }
    const [errorMsg, setErrorMsg] = useState("");
    const inputRef = useRef();

    const reset = () => { setFile(null); setPhase("idle"); setAutofilled(null); setErrorMsg(""); };

    const handleFile = f => {
        setFile(f);
        setPhase("idle");
        setAutofilled(null);
        setErrorMsg("");
    };

    /**
     * 1. Upload to S3
     * 2. Poll /data/documents until a new document appears with forms data
     * 3. Map forms → answers and save via POST /data/answers
     */
    const handleUpload = async () => {
        if (!file) return;
        setPhase("uploading");
        setErrorMsg("");

        try {
            const arrayBuffer = await file.arrayBuffer();
            const body = new Uint8Array(arrayBuffer);
            const key = `uploads/${Date.now()}_${file.name}`;

            const s3 = new S3Client({
                region: config.region,
                credentials: fromCognitoIdentityPool({
                    clientConfig: { region: config.region },
                    identityPoolId: config.identityPoolId,
                    logins: { [`cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`]: token }
                })
            });

            await s3.send(new PutObjectCommand({
                Bucket: config.documentsBucket,
                Key: key,
                Body: body,
                ContentType: file.type
            }));

            setPhase("processing");

            if (!category.pageId) {
                // No autofill for "other" category
                setPhase("done");
                setAutofilled({});
                if (onSuccess) onSuccess(category.id);
                return;
            }

            // Poll for the processed document (up to 60s)
            let found = null;
            for (let i = 0; i < 30; i++) {
                await new Promise(r => setTimeout(r, 2000));
                const res = await fetch(`${config.apiUrl}/data/documents`, {
                    headers: { Authorization: token }
                });
                const data = await res.json();
                const match = (data.documents || []).find(d =>
                    d.file_key && d.file_key.includes(key.split("/").pop().split("_").slice(1).join("_").split(".")[0].slice(0, 20))
                );
                if (match) { found = match; break; }

                // Fallback: check the most recent document uploaded in last 2 min
                const recent = (data.documents || []).find(d => {
                    const processedAt = new Date(d.processed_at);
                    return Date.now() - processedAt.getTime() < 120000;
                });
                if (recent) { found = recent; break; }
            }

            if (!found) {
                setPhase("done");
                setAutofilled({});
                if (onSuccess) onSuccess(category.id);
                return;
            }

            // Fetch document detail for forms data
            const detailRes = await fetch(`${config.apiUrl}/data/documents/${found.id}`, {
                headers: { Authorization: token }
            });
            const detail = await detailRes.json();
            const forms = detail.forms || {};

            // Map to answers
            const mapped = mapToAnswers(forms, category.fieldMap);

            if (Object.keys(mapped).length > 0) {
                // Load existing answers first, merge, then save
                const existingRes = await fetch(`${config.apiUrl}/data/answers/${category.pageId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const existing = existingRes.ok ? (await existingRes.json()) : {};
                const merged = { ...(existing.answers || {}), ...mapped };

                await fetch(`${config.apiUrl}/data/answers`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        pageId: category.pageId,
                        questions: category.questions,
                        answers: merged
                    })
                });
            }

            setAutofilled(mapped);
            setPhase("done");
            if (onSuccess) onSuccess(category.id);

        } catch (err) {
            setErrorMsg(err.message);
            setPhase("error");
        }
    };

    const fieldLabels = {};
    for (const q of category.questions) {
        fieldLabels[q.id] = q.label;
    }

    return (
        <div style={styles.uploadArea}>
            {phase === "idle" || phase === "error" ? (
                <>
                    <div
                        style={dragging ? { ...styles.dropzone, ...styles.dropActive } : styles.dropzone}
                        onClick={() => inputRef.current.click()}
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                    >
                        {file ? (
                            <p>📄 <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>
                        ) : (
                            <>
                                <p style={{ fontSize: 32, margin: "0 0 8px" }}>{category.icon}</p>
                                <p style={{ margin: "0 0 4px", fontWeight: 500 }}>{category.acceptHint}</p>
                                <p style={{ margin: 0, fontSize: 13 }}>Glissez-déposez ou <u>cliquez pour parcourir</u><br /><small>PDF, PNG, JPG</small></p>
                            </>
                        )}
                        <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                    </div>

                    {file && (
                        <button
                            style={{ ...styles.uploadBtn, background: category.color }}
                            onClick={handleUpload}
                        >
                            Analyze &amp; Auto-Fill
                        </button>
                    )}

                    {phase === "error" && (
                        <div style={{ ...styles.statusBox, background: "#fef2f2", color: "#b91c1c" }}>
                            ❌ Error: {errorMsg}
                        </div>
                    )}
                </>
            ) : phase === "uploading" ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ fontSize: 40 }}>📤</div>
                    <p style={{ fontWeight: "bold", marginTop: 12 }}>Upload in progress...</p>
                    <p style={{ color: "#888", fontSize: 13 }}>Sending your document to the cloud</p>
                </div>
            ) : phase === "processing" ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>🔍</div>
                    <p style={{ fontWeight: "bold", marginTop: 12 }}>Analysis in progress…</p>
                    <p style={{ color: "#888", fontSize: 13 }}>Amazon Textract extracts information from your document.<br />This may take a few seconds.</p>
                    <div style={{ marginTop: 16, height: 4, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "60%", background: category.color, borderRadius: 4, animation: "loading-bar 2s ease-in-out infinite" }} />
                    </div>
                </div>
            ) : (
                /* phase === "done" */
                <div>
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                        <span style={{ fontSize: 40 }}>✅</span>
                        <p style={{ fontWeight: "bold", fontSize: 16, margin: "8px 0 0" }}>Document analyzed successfully!</p>
                    </div>

                    {autofilled && Object.keys(autofilled).length > 0 ? (
                        <div style={styles.autofillBox}>
                            <p style={{ fontWeight: "bold", color: "#166534", marginBottom: 10, fontSize: 14 }}>
                                🎉 Fields auto-filled in "&nbsp;{category.title}&nbsp;":
                            </p>
                            {Object.entries(autofilled).map(([qId, val]) => (
                                <div key={qId} style={styles.fieldRow}>
                                    <span style={styles.fieldKey}>{fieldLabels[qId] || qId}</span>
                                    <span style={styles.fieldVal}>{val}</span>
                                </div>
                            ))}
                            <p style={{ fontSize: 12, color: "#166534", marginTop: 8, opacity: 0.7 }}>
                                This information has been saved to your file. You can edit it from the dashboard.
                            </p>
                        </div>
                    ) : (
                        <div style={{ ...styles.statusBox, background: "#fffbeb", color: "#92400e" }}>
                            ℹ️ Document archived. No fields could be extracted automatically. You can fill them manually from the dashboard.
                        </div>
                    )}

                    <button onClick={reset} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                        Upload Another Document
                    </button>
                </div>
            )}
        </div>
    );
}

// Constants for document categorization (matching Dashboard structure)
const PROCESSED_CATEGORIES = {
  "personal": { name: "Personal & Administrative", color: "#4CAF50", icon: "👤" },
  "funeral": { name: "Funeral Wishes", color: "#2196F3", icon: "⚱️" },
  "financial": { name: "Financial Planning", color: "#FF9800", icon: "💰" }
};

// Utility functions for processed documents
function categorizeData(forms) {
  const categorized = {
    personal: {},
    funeral: {},
    financial: {}
  };

  if (!forms) return categorized;

  Object.entries(forms).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes("name") || lowerKey.includes("identity") || lowerKey.includes("birth") || 
        lowerKey.includes("address") || lowerKey.includes("contact") || lowerKey.includes("donation")) {
      categorized.personal[key] = value;
    } else if (lowerKey.includes("burial") || lowerKey.includes("cremation") || lowerKey.includes("ceremony") ||
               lowerKey.includes("coffin") || lowerKey.includes("flower") || lowerKey.includes("music") ||
               lowerKey.includes("viewing") || lowerKey.includes("funeral") || lowerKey.includes("wishes")) {
      categorized.funeral[key] = value;
    } else if (lowerKey.includes("bank") || lowerKey.includes("insurance") || lowerKey.includes("payment") ||
               lowerKey.includes("financing")) {
      categorized.financial[key] = value;
    }
  });

  return categorized;
}

function getDocumentStats(doc) {
  const formCount = doc.forms ? Object.keys(doc.forms).length : 0;
  const tableCount = doc.tables ? doc.tables.length : 0;
  return { formCount, tableCount };
}

export default function DocumentsPage({ token, onBack }) {
    const [tab, setTab] = useState("upload"); // "upload" or "processed"
    const [selected, setSelected] = useState(null);
    const [uploadCounts, setUploadCounts] = useState({});
    
    // For processed documents
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(tab === "processed");
    const [selectedDetail, setSelectedDetail] = useState(null);

    const ALLOWED_API_ORIGIN = new URL(config.apiUrl).origin;

    // Fetch processed documents when tab changes to processed
    useEffect(() => {
        if (tab === "processed") {
            fetchDocuments();
        }
    }, [tab]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${config.apiUrl}/data/documents`, {
                headers: { Authorization: token }
            });
            const data = await res.json();
            setDocuments(data.documents || []);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetail = async (id) => {
        if (!/^[a-zA-Z0-9_-]+$/.test(String(id))) {
            console.error("Invalid document id");
            return;
        }
        const url = new URL(`/data/documents/${encodeURIComponent(id)}`, ALLOWED_API_ORIGIN);
        if (url.origin !== ALLOWED_API_ORIGIN) {
            console.error("URL origin mismatch");
            return;
        }
        const res = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            console.error(`Failed to fetch document: ${res.status} ${res.statusText}`);
            return;
        }
        const data = await res.json();
        setSelectedDetail(data);
    };

    const renderCategorySection = (title, icon, color, data) => {
        const entries = Object.entries(data);
        if (entries.length === 0) return null;

        return (
            <div key={title} style={{ marginTop: 20, border: "1px solid #ddd", borderRadius: 6, padding: 16, background: "#fafafa" }}>
                <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 12, color: "#4f4f4f", borderBottom: `2px solid ${color}`, paddingBottom: 8, paddingLeft: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{icon}</span>
                    <span>{title}</span>
                    <span style={{ marginLeft: "auto", background: color, color: "#fff", borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: "bold" }}>
                        {entries.length}
                    </span>
                </div>
                {entries.map(([k, v]) => (
                    <div key={k} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, marginBottom: 8, fontSize: 13, padding: "8px 12px", background: "#f9f9f9", borderRadius: 4 }}>
                        <span style={{ fontWeight: "bold", color: "#4f4f4f" }}>{k}</span>
                        <span style={{ color: "#333" }}>{v || <em style={{ color: "#aaa" }}>empty</em>}</span>
                    </div>
                ))}
            </div>
        );
    };

    const handleSuccess = (catId) => {
        setUploadCounts(prev => ({ ...prev, [catId]: (prev[catId] || 0) + 1 }));
    };

    return (
        <div style={styles.page}>
            <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

            <div style={{ display: "flex", gap: 12, marginBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
                <button
                    onClick={() => setTab("upload")}
                    style={{
                        padding: "12px 16px",
                        background: tab === "upload" ? "#4f4f4f" : "transparent",
                        color: tab === "upload" ? "#fff" : "#555",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: tab === "upload" ? "bold" : "normal",
                        borderBottom: tab === "upload" ? "3px solid #ff9900" : "none",
                        transition: "all .2s"
                    }}
                >
                    📤 Upload Documents
                </button>
                <button
                    onClick={() => setTab("processed")}
                    style={{
                        padding: "12px 16px",
                        background: tab === "processed" ? "#4f4f4f" : "transparent",
                        color: tab === "processed" ? "#fff" : "#555",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: tab === "processed" ? "bold" : "normal",
                        borderBottom: tab === "processed" ? "3px solid #ff9900" : "none",
                        transition: "all .2s"
                    }}
                >
                    📋 Processed Documents ({documents.length})
                </button>
            </div>

            {/* UPLOAD TAB */}
            {tab === "upload" && !selected && (
                <>
                    <div style={styles.grid}>
                        {DOCUMENT_CATEGORIES.map(cat => (
                            <CategoryCard
                                key={cat.id}
                                cat={cat}
                                uploadedCount={uploadCounts[cat.id] || 0}
                                onClick={() => setSelected(cat)}
                            />
                        ))}
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
                        <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#374151" }}>💡 How does it work?</h3>
                        <ol style={{ margin: 0, paddingLeft: 20, color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>
                            <li>Choose the category matching your document.</li>
                            <li>Upload the photo or PDF (ID card, proof of address, etc.).</li>
                            <li>Data is automatically imported into your file.</li>
                        </ol>
                    </div>
                </>
            )}

            {/* UPLOAD TAB - WITH SELECTED CATEGORY */}
            {tab === "upload" && selected && (
                <>
                    <button style={styles.backBtn} onClick={() => setSelected(null)}>
                        ← Back to Categories
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: selected.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                            {selected.icon}
                        </div>
                        <div>
                            <h2 style={{ margin: "0 0 4px", fontSize: 22, color: "#4f4f4f" }}>{selected.title}</h2>
                            <p style={{ margin: 0, color: "#888", fontSize: 14 }}>{selected.description}</p>
                        </div>
                    </div>

                    <UploadZone
                        category={selected}
                        token={token}
                        onSuccess={handleSuccess}
                    />
                </>
            )}

            {/* PROCESSED TAB */}
            {tab === "processed" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: "bold", margin: 0, color: "#4f4f4f" }}>Processed Documents</h2>
                        <button style={{ background: "#4f4f4f", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12 }} onClick={fetchDocuments}>
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: "center", color: "#999", padding: 32 }}>Loading...</p>
                    ) : documents.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#999", padding: 32 }}>No processed documents yet.</p>
                    ) : (
                        <div>
                            {documents.map(doc => {
                                const stats = getDocumentStats(doc);
                                return (
                                    <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#f9f9f9", borderRadius: 4, marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: "bold", color: "#4f4f4f", marginBottom: 4 }}>{doc.file_key}</div>
                                            <div style={{ fontSize: 12, color: "#666" }}>
                                                {new Date(doc.processed_at).toLocaleString("en-US")} • 
                                                {stats.formCount > 0 && ` ${stats.formCount} form field${stats.formCount !== 1 ? "s" : ""}`}
                                                {stats.tableCount > 0 && ` • ${stats.tableCount} table${stats.tableCount !== 1 ? "s" : ""}`}
                                            </div>
                                        </div>
                                        <button style={{ background: "#4f4f4f", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12 }} onClick={() => fetchDetail(doc.id)}>
                                            View Details
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* DETAIL MODAL */}
                    {selectedDetail && (
                        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedDetail(null)}>
                            <div style={{ background: "#fff", borderRadius: 8, padding: 32, maxWidth: 900, width: "95%", maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 4px 0", fontSize: 20, color: "#4f4f4f" }}>{selectedDetail.file_key}</h3>
                                        <small style={{ color: "#666" }}>Processed on {new Date(selectedDetail.processed_at).toLocaleString("en-US")}</small>
                                    </div>
                                    <button style={{ background: "#555", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 3, cursor: "pointer", fontSize: 11 }} onClick={() => setSelectedDetail(null)}>
                                        ✕ Close
                                    </button>
                                </div>

                                {selectedDetail.forms && Object.keys(selectedDetail.forms).length > 0 && (
                                    <div>
                                        <p style={{ fontWeight: "bold", fontSize: 14, marginTop: 20, marginBottom: 12, color: "#fff", background: "#4CAF50", padding: "8px 12px", borderRadius: 4, display: "flex", alignItems: "center", gap: 8 }}>
                                            👤 Extracted Data by Category
                                        </p>
                                        {(() => {
                                            const categorized = categorizeData(selectedDetail.forms);
                                            return (
                                                <div>
                                                    {renderCategorySection(PROCESSED_CATEGORIES.personal.name, PROCESSED_CATEGORIES.personal.icon, PROCESSED_CATEGORIES.personal.color, categorized.personal)}
                                                    {renderCategorySection(PROCESSED_CATEGORIES.funeral.name, PROCESSED_CATEGORIES.funeral.icon, PROCESSED_CATEGORIES.funeral.color, categorized.funeral)}
                                                    {renderCategorySection(PROCESSED_CATEGORIES.financial.name, PROCESSED_CATEGORIES.financial.icon, PROCESSED_CATEGORIES.financial.color, categorized.financial)}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {selectedDetail.tables && selectedDetail.tables.length > 0 && (
                                    <>
                                        <p style={{ fontWeight: "bold", fontSize: 14, marginTop: 20, marginBottom: 12, color: "#fff", background: "#2196F3", padding: "8px 12px", borderRadius: 4, display: "flex", alignItems: "center", gap: 8 }}>
                                            📊 Extracted Tables
                                        </p>
                                        {selectedDetail.tables.map((tbl, i) => (
                                            <div key={i} style={{ overflowX: "auto", marginTop: 8, marginBottom: 16 }}>
                                                <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                                                    <thead>
                                                        <tr>{tbl[0]?.map((h, j) => <th key={j} style={{ background: "#4f4f4f", color: "#fff", padding: "8px 10px", textAlign: "left" }}>{h}</th>)}</tr>
                                                    </thead>
                                                    <tbody>
                                                        {tbl.slice(1).map((row, r) => (
                                                            <tr key={r}>{row.map((cell, c) => <td key={c} style={{ border: "1px solid #ddd", padding: "6px 10px" }}>{cell}</td>)}</tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </>
                                )}

                                <p style={{ fontWeight: "bold", fontSize: 14, marginTop: 20, marginBottom: 12, color: "#fff", background: "#FF9800", padding: "8px 12px", borderRadius: 4, display: "flex", alignItems: "center", gap: 8 }}>
                                    📝 Raw Text Content
                                </p>
                                <pre style={{ background: "#f0f2f5", padding: 12, borderRadius: 4, fontSize: 11, whiteSpace: "pre-wrap", marginTop: 8 }}>
                                    {selectedDetail.raw_text}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
