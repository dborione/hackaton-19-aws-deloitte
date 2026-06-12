import React, { useState, useEffect } from "react";
import config from "../config";

const styles = {
  section:    { background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginTop: 24 },
  title:      { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#232f3e" },
  table:      { width: "100%", borderCollapse: "collapse" },
  th:         { textAlign: "left", padding: "10px 12px", background: "#f0f2f5", borderBottom: "2px solid #ddd", fontSize: 13 },
  td:         { padding: "10px 12px", borderBottom: "1px solid #eee", fontSize: 13 },
  btn:        { background: "#232f3e", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  empty:      { textAlign: "center", color: "#999", padding: 32 },
  modal:      { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalCard:  { background: "#fff", borderRadius: 8, padding: 32, maxWidth: 700, width: "90%", maxHeight: "85vh", overflow: "auto" },
  pre:        { background: "#f0f2f5", padding: 16, borderRadius: 4, fontSize: 12, whiteSpace: "pre-wrap", marginTop: 8 },
  sectionLbl: { fontWeight: "bold", fontSize: 14, marginTop: 20, marginBottom: 8, color: "#232f3e", borderBottom: "1px solid #eee", paddingBottom: 4 },
  kvRow:      { display: "flex", gap: 8, marginBottom: 6, fontSize: 13 },
  kvKey:      { fontWeight: "bold", minWidth: 160, color: "#555" },
  kvVal:      { color: "#333" },
  tblWrap:    { overflowX: "auto", marginTop: 8 },
  tblTable:   { borderCollapse: "collapse", fontSize: 12, width: "100%" },
  tblTh:      { background: "#232f3e", color: "#fff", padding: "6px 10px", textAlign: "left" },
  tblTd:      { border: "1px solid #ddd", padding: "5px 10px" }
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

  useEffect(() => { fetchDocuments(); }, []);

  return (
    <div style={styles.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={styles.title}>Documents traités</h2>
        <button style={styles.btn} onClick={fetchDocuments}>Rafraîchir</button>
      </div>

      {loading ? (
        <p style={styles.empty}>Chargement...</p>
      ) : documents.length === 0 ? (
        <p style={styles.empty}>Aucun document traité pour le moment.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Fichier</th>
              <th style={styles.th}>Traité le</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td style={styles.td}>{doc.file_key}</td>
                <td style={styles.td}>{new Date(doc.processed_at).toLocaleString("fr-FR")}</td>
                <td style={styles.td}>
                  <button style={styles.btn} onClick={() => fetchDetail(doc.id)}>Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div style={styles.modal} onClick={() => setSelected(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{selected.file_key}</h3>
            <small style={{ color: "#666" }}>Traité le {new Date(selected.processed_at).toLocaleString("fr-FR")}</small>

            {selected.forms && Object.keys(selected.forms).length > 0 && (
              <>
                <p style={styles.sectionLbl}>Champs extraits (Formulaire)</p>
                {Object.entries(selected.forms).map(([k, v]) => (
                  <div key={k} style={styles.kvRow}>
                    <span style={styles.kvKey}>{k}</span>
                    <span style={styles.kvVal}>{v || <em style={{ color: "#aaa" }}>vide</em>}</span>
                  </div>
                ))}
              </>
            )}

            {selected.tables && selected.tables.length > 0 && (
              <>
                <p style={styles.sectionLbl}>Tableaux extraits</p>
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

            <p style={styles.sectionLbl}>Texte brut</p>
            <pre style={styles.pre}>{selected.raw_text}</pre>

            <button style={{ ...styles.btn, marginTop: 16 }} onClick={() => setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
