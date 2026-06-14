import React, { useState, useEffect } from "react";
import config from "../config";

const CATEGORIES = {
  "personal": { name: "Personal & Administrative", color: "#4CAF50", icon: "👤" },
  "funeral": { name: "Funeral Wishes", color: "#2196F3", icon: "⚱️" },
  "financial": { name: "Financial Planning", color: "#FF9800", icon: "💰" }
};

const styles = {
  section:    { background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginTop: 24 },
  title:      { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#4f4f4f" },
  table:      { width: "100%", borderCollapse: "collapse" },
  th:         { textAlign: "left", padding: "10px 12px", background: "#f0f2f5", borderBottom: "2px solid #ddd", fontSize: 13 },
  td:         { padding: "12px 12px", borderBottom: "1px solid #eee", fontSize: 13 },
  btn:        { background: "#4f4f4f", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  btnSmall:   { background: "#555", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 3, cursor: "pointer", fontSize: 11 },
  empty:      { textAlign: "center", color: "#999", padding: 32 },
  modal:      { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalCard:  { background: "#fff", borderRadius: 8, padding: 32, maxWidth: 900, width: "95%", maxHeight: "90vh", overflow: "auto" },
  pre:        { background: "#f0f2f5", padding: 12, borderRadius: 4, fontSize: 11, whiteSpace: "pre-wrap", marginTop: 8 },
  sectionLbl: { fontWeight: "bold", fontSize: 14, marginTop: 20, marginBottom: 12, color: "#fff", background: "#4f4f4f", padding: "8px 12px", borderRadius: 4, display: "flex", alignItems: "center", gap: 8 },
  categoryBadge: { display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: "bold", color: "#fff", marginRight: 8 },
  kvRow:      { display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, marginBottom: 8, fontSize: 13, padding: "8px 12px", background: "#f9f9f9", borderRadius: 4 },
  kvKey:      { fontWeight: "bold", color: "#4f4f4f" },
  kvVal:      { color: "#333" },
  catSection: { marginTop: 20, border: "1px solid #ddd", borderRadius: 6, padding: 16, background: "#fafafa" },
  catHeader:  { fontWeight: "bold", fontSize: 14, marginBottom: 12, color: "#4f4f4f", borderBottom: "2px solid", paddingBottom: 8 },
  tblWrap:    { overflowX: "auto", marginTop: 8, marginBottom: 16 },
  tblTable:   { borderCollapse: "collapse", fontSize: 12, width: "100%" },
  tblTh:      { background: "#4f4f4f", color: "#fff", padding: "8px 10px", textAlign: "left" },
  tblTd:      { border: "1px solid #ddd", padding: "6px 10px" },
  docCard:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#f9f9f9", borderRadius: 4, marginBottom: 8 },
  stats:      { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }
};

export default function DocumentList({ token }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);

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

  const ALLOWED_API_ORIGIN = new URL(config.apiUrl).origin;

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
      headers: { Authorization: token }
    });
    const data = await res.json();
    setSelected(data);
  };

  const categorizeData = (forms) => {
    const categorized = {
      personal: {},
      funeral: {},
      financial: {}
    };

    if (!forms) return categorized;

    // Simple heuristic to categorize fields based on keywords
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
  };

  const getDocumentStats = (doc) => {
    const formCount = doc.forms ? Object.keys(doc.forms).length : 0;
    const tableCount = doc.tables ? doc.tables.length : 0;
    const textLength = doc.raw_text ? doc.raw_text.length : 0;
    return { formCount, tableCount, textLength };
  };

  const renderCategorySection = (title, icon, color, data) => {
    const entries = Object.entries(data);
    if (entries.length === 0) return null;

    return (
      <div key={title} style={styles.catSection}>
        <div style={{ ...styles.catHeader, borderColor: color, paddingLeft: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{icon}</span>
          <span>{title}</span>
          <span style={{ marginLeft: "auto", background: color, color: "#fff", borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: "bold" }}>
            {entries.length}
          </span>
        </div>
        {entries.map(([k, v]) => (
          <div key={k} style={styles.kvRow}>
            <span style={styles.kvKey}>{k}</span>
            <span style={styles.kvVal}>{v || <em style={{ color: "#aaa" }}>empty</em>}</span>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => { fetchDocuments(); }, []);

  return (
    <div style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={styles.title}>📄 Processed Documents</h2>
        <button style={styles.btn} onClick={fetchDocuments}>Refresh</button>
      </div>

      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : documents.length === 0 ? (
        <p style={styles.empty}>No processed documents yet.</p>
      ) : (
        <div>
          {documents.map(doc => {
            const stats = getDocumentStats(doc);
            return (
              <div key={doc.id} style={styles.docCard}>
                <div>
                  <div style={{ fontWeight: "bold", color: "#4f4f4f", marginBottom: 4 }}>{doc.file_key}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {new Date(doc.processed_at).toLocaleString("en-US")} • 
                    {stats.formCount > 0 && ` ${stats.formCount} form field${stats.formCount !== 1 ? "s" : ""}`}
                    {stats.tableCount > 0 && ` • ${stats.tableCount} table${stats.tableCount !== 1 ? "s" : ""}`}
                  </div>
                </div>
                <button style={styles.btn} onClick={() => fetchDetail(doc.id)}>View Details</button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={styles.modal} onClick={() => setSelected(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 20, color: "#4f4f4f" }}>{selected.file_key}</h3>
                <small style={{ color: "#666" }}>Processed on {new Date(selected.processed_at).toLocaleString("en-US")}</small>
              </div>
              <button style={styles.btnSmall} onClick={() => setSelected(null)}>✕ Close</button>
            </div>

            {selected.forms && Object.keys(selected.forms).length > 0 && (
              <div>
                <p style={{ ...styles.sectionLbl, background: "#4CAF50" }}>👤 Extracted Data by Category</p>
                {(() => {
                  const categorized = categorizeData(selected.forms);
                  return (
                    <div>
                      {renderCategorySection(CATEGORIES.personal.name, CATEGORIES.personal.icon, CATEGORIES.personal.color, categorized.personal)}
                      {renderCategorySection(CATEGORIES.funeral.name, CATEGORIES.funeral.icon, CATEGORIES.funeral.color, categorized.funeral)}
                      {renderCategorySection(CATEGORIES.financial.name, CATEGORIES.financial.icon, CATEGORIES.financial.color, categorized.financial)}
                    </div>
                  );
                })()}
              </div>
            )}

            {selected.tables && selected.tables.length > 0 && (
              <>
                <p style={{ ...styles.sectionLbl, background: "#2196F3" }}>📊 Extracted Tables</p>
                {selected.tables.map((tbl, i) => (
                  <div key={i} style={styles.tblWrap}>
                    <table style={styles.tblTable}>
                      <thead>
                        <tr>{tbl[0]?.map((h, j) => <th key={j} style={styles.tblTh}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {tbl.slice(1).map((row, r) => (
                          <tr key={r}>{row.map((cell, c) => <td key={c} style={styles.tblTd}>{cell}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </>
            )}

            <p style={{ ...styles.sectionLbl, background: "#FF9800" }}>📝 Raw Text Content</p>
            <pre style={styles.pre}>{selected.raw_text}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
