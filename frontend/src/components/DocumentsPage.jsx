import React, { useState, useRef } from "react";
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
    // Name / last name variants
    "surname": "birth_name",
    "last name": "birth_name",
    "nom": "birth_name",
    "family name": "birth_name",
    "last_name": "birth_name",
    "nom de naissance": "birth_name",
    // First name
    "first name": "first_names",
    "given name": "first_names",
    "prénom": "first_names",
    "prenom": "first_names",
    "given names": "first_names",
    "first_name": "first_names",
    // Birth date
    "date of birth": "birth_date",
    "birth date": "birth_date",
    "date de naissance": "birth_date",
    "dob": "birth_date",
    "birthdate": "birth_date",
    "date_of_birth": "birth_date",
    // Birth place
    "place of birth": "birth_place",
    "lieu de naissance": "birth_place",
    "birthplace": "birth_place",
    "birth place": "birth_place",
    // National register
    "national register": "national_register_number",
    "n° national": "national_register_number",
    "national number": "national_register_number",
    "id number": "national_register_number",
    "numéro national": "national_register_number",
    "card number": "national_register_number",
    // Full name reassembly
    "name": "cover_full_name",
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
 * Tries to find matching keys and reassembles full name if needed.
 */
function mapToAnswers(forms, fieldMap) {
    const answers = {};
    for (const [rawKey, value] of Object.entries(forms)) {
        const normalized = normalizeKey(rawKey);
        if (fieldMap[normalized] && value) {
            answers[fieldMap[normalized]] = value;
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
        title: "Pièce d'identité",
        color: "#4f46e5",
        gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        description: "Carte nationale d'identité, passeport ou permis de conduire.",
        examples: ["Carte d'identité", "Passeport", "Permis de conduire"],
        acceptHint: "Photo ou PDF de votre pièce d'identité",
        pageId: "identity",
        questions: identityQuestions,
        fieldMap: IDENTITY_FIELD_MAP,
    },
    {
        id: "home",
        icon: "🏠",
        title: "Justificatif de domicile",
        color: "#059669",
        gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
        description: "Facture d'eau, électricité ou gaz de moins de 3 mois.",
        examples: ["Facture d'eau", "Facture EDF", "Relevé bancaire"],
        acceptHint: "Photo ou PDF du justificatif",
        pageId: "current-home",
        questions: currentHomeQuestions,
        fieldMap: CURRENT_HOME_FIELD_MAP,
    },
    {
        id: "insurance",
        icon: "📋",
        title: "Assurance",
        color: "#d97706",
        gradient: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
        description: "Police d'assurance vie ou funéraire.",
        examples: ["Contrat d'assurance vie", "Assurance obsèques"],
        acceptHint: "Photo ou PDF du contrat d'assurance",
        pageId: "insurance",
        questions: insuranceQuestions,
        fieldMap: INSURANCE_FIELD_MAP,
    },
    {
        id: "other",
        icon: "📄",
        title: "Autre document",
        color: "#6b7280",
        gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
        description: "Tout autre document pertinent pour votre dossier.",
        examples: ["Testament", "Contrat", "Diplôme"],
        acceptHint: "Photo ou PDF",
        pageId: null,        // No autofill for "other"
        questions: [],
        fieldMap: {},
    },
];

const styles = {
    page: { maxWidth: 900, margin: "0 auto", padding: "0 16px 64px" },
    header: { marginBottom: 32, paddingTop: 8 },
    h1: { fontSize: 28, fontWeight: "bold", color: "#232f3e", margin: "0 0 8px" },
    subtitle: { color: "#555", lineHeight: 1.6 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 },
    card: { borderRadius: 12, padding: 20, cursor: "pointer", color: "#fff", transition: "transform .15s, box-shadow .15s", position: "relative", overflow: "hidden" },
    cardIcon: { fontSize: 36, marginBottom: 8 },
    cardTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
    cardDesc: { fontSize: 13, opacity: 0.85, lineHeight: 1.4 },
    cardBadge: { position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: "bold" },
    uploadArea: { background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 28 },
    backBtn: { background: "transparent", color: "#232f3e", border: "1px solid #ddd", borderRadius: 6, padding: "8px 14px", cursor: "pointer", marginBottom: 20, fontSize: 14 },
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
                            Analyser &amp; remplir automatiquement
                        </button>
                    )}

                    {phase === "error" && (
                        <div style={{ ...styles.statusBox, background: "#fef2f2", color: "#b91c1c" }}>
                            ❌ Erreur : {errorMsg}
                        </div>
                    )}
                </>
            ) : phase === "uploading" ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ fontSize: 40 }}>📤</div>
                    <p style={{ fontWeight: "bold", marginTop: 12 }}>Upload en cours...</p>
                    <p style={{ color: "#888", fontSize: 13 }}>Envoi de votre document vers le cloud</p>
                </div>
            ) : phase === "processing" ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>🔍</div>
                    <p style={{ fontWeight: "bold", marginTop: 12 }}>Analyse en cours…</p>
                    <p style={{ color: "#888", fontSize: 13 }}>Amazon Textract extrait les informations de votre document.<br />Cela peut prendre quelques secondes.</p>
                    <div style={{ marginTop: 16, height: 4, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "60%", background: category.color, borderRadius: 4, animation: "loading-bar 2s ease-in-out infinite" }} />
                    </div>
                </div>
            ) : (
                /* phase === "done" */
                <div>
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                        <span style={{ fontSize: 40 }}>✅</span>
                        <p style={{ fontWeight: "bold", fontSize: 16, margin: "8px 0 0" }}>Document analysé avec succès !</p>
                    </div>

                    {autofilled && Object.keys(autofilled).length > 0 ? (
                        <div style={styles.autofillBox}>
                            <p style={{ fontWeight: "bold", color: "#166534", marginBottom: 10, fontSize: 14 }}>
                                🎉 Champs remplis automatiquement dans «&nbsp;{category.title}&nbsp;» :
                            </p>
                            {Object.entries(autofilled).map(([qId, val]) => (
                                <div key={qId} style={styles.fieldRow}>
                                    <span style={styles.fieldKey}>{fieldLabels[qId] || qId}</span>
                                    <span style={styles.fieldVal}>{val}</span>
                                </div>
                            ))}
                            <p style={{ fontSize: 12, color: "#166534", marginTop: 8, opacity: 0.7 }}>
                                Ces informations ont été sauvegardées dans votre dossier. Vous pouvez les modifier depuis le tableau de bord.
                            </p>
                        </div>
                    ) : (
                        <div style={{ ...styles.statusBox, background: "#fffbeb", color: "#92400e" }}>
                            ℹ️ Document archivé. Aucun champ n'a pu être extrait automatiquement. Vous pouvez remplir manuellement depuis le tableau de bord.
                        </div>
                    )}

                    <button onClick={reset} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                        Uploader un autre document
                    </button>
                </div>
            )}
        </div>
    );
}

export default function DocumentsPage({ token }) {
    const [selected, setSelected] = useState(null);
    const [uploadCounts, setUploadCounts] = useState({});

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

            <div style={styles.header}>
                <h1 style={styles.h1}>Documents</h1>
                <p style={styles.subtitle}>
                    Uploadez vos documents pour que les informations soient automatiquement
                    extraites et importées dans votre dossier.
                </p>
            </div>

            {!selected ? (
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
                        <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#374151" }}>💡 Comment ça marche ?</h3>
                        <ol style={{ margin: 0, paddingLeft: 20, color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>
                            <li>Choisissez la catégorie correspondant à votre document.</li>
                            <li>Uploadez la photo ou le PDF (carte d'identité, justificatif, etc.).</li>
                            <li>Amazon Textract analyse le document et en extrait les informations.</li>
                            <li>Les données sont automatiquement importées dans votre dossier.</li>
                        </ol>
                    </div>
                </>
            ) : (
                <>
                    <button style={styles.backBtn} onClick={() => setSelected(null)}>
                        ← Retour aux catégories
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: selected.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                            {selected.icon}
                        </div>
                        <div>
                            <h2 style={{ margin: "0 0 4px", fontSize: 22, color: "#232f3e" }}>{selected.title}</h2>
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
        </div>
    );
}
