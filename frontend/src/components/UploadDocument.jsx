import React, { useState, useRef } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import config from "../config";

const styles = {
  section: { background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#232f3e" },
  dropzone: { border: "2px dashed #ccc", borderRadius: 8, padding: 40, textAlign: "center", cursor: "pointer", color: "#666" },
  dropzoneActive: { border: "2px dashed #ff9900", background: "#fff8f0" },
  btn: { background: "#ff9900", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 4, cursor: "pointer", fontWeight: "bold", marginTop: 16 },
  progress: { marginTop: 12, color: "#27ae60", fontWeight: "bold" },
  error: { marginTop: 12, color: "#c0392b" }
};

export default function UploadDocument({ token }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    setFile(f);
    setStatus("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("Upload en cours...");
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const body = new Uint8Array(arrayBuffer);

      const s3 = new S3Client({
        region: config.region,
        credentials: fromCognitoIdentityPool({
          clientConfig: { region: config.region },
          identityPoolId: config.identityPoolId,
          logins: { [`cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`]: token }
        })
      });

      await s3.send(new PutObjectCommand({
        Bucket:      config.documentsBucket,
        Key:         `uploads/${Date.now()}_${file.name}`,
        Body:        body,
        ContentType: file.type
      }));

      setStatus(`✅ "${file.name}" uploadé avec succès — traitement en cours...`);
      setFile(null);
      setTimeout(() => setStatus(""), 5000);
    } catch (err) {
      setError(`Erreur : ${err.message}`);
      setStatus("");
    }
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.title}>Uploader un document</h2>
      <div
        style={dragging ? { ...styles.dropzone, ...styles.dropzoneActive } : styles.dropzone}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      >
        {file ? (
          <p>📄 <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>
        ) : (
          <p>Glissez un fichier ici ou <u>cliquez pour parcourir</u><br /><small>PDF, PNG, JPG acceptés</small></p>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      </div>

      {file && <button style={styles.btn} onClick={handleUpload}>Envoyer</button>}
      {status && <p style={styles.progress}>{status}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}
