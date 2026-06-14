import { useCallback, useEffect, useMemo, useState } from "react";
import config from "../../config";

const styles = {
  page: {
    textAlign: "left"
  },

  infoBox: {
    background: "#f3f4f6",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    color: "#444",
    lineHeight: 1.5
  },

  group: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 18,
    marginBottom: 16
  },

  groupTitle: {
    margin: "0 0 14px 0",
    color: "#4f4f4f"
  },

  field: {
    marginBottom: 18
  },

  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: 8,
    color: "#4f4f4f"
  },

  textarea: {
    width: "100%",
    minHeight: 90,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
    resize: "vertical",
    boxSizing: "border-box"
  },

  actions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap"
  },

  button: {
    background: "#bd2430",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  },

  secondaryButton: {
    background: "#4f4f4f",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  },

  error: {
    color: "#c0392b",
    fontWeight: "bold"
  },

  success: {
    color: "#047857",
    fontWeight: "bold"
  }
};

function fieldKey(field) {
  return `${field.pageId}:${field.questionId}`;
}

export default function SharedInvitation({
  token,
  inviteToken,
  onClose,
  onSaved
}) {
  const [invitation, setInvitation] = useState(null);
  const [fields, setFields] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const groupedFields = useMemo(() => {
    const groups = {};

    fields.forEach((field) => {
      if (!groups[field.pageId]) {
        groups[field.pageId] = [];
      }

      groups[field.pageId].push(field);
    });

    return groups;
  }, [fields]);

  const loadInvitation = useCallback(async () => {
    if (!inviteToken) {
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      if (token) {
        const acceptRes = await fetch(
          `${config.apiUrl}/sharing/invitations/${inviteToken}/accept`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!acceptRes.ok && acceptRes.status !== 403) {
          throw new Error(await acceptRes.text());
        }
      }

      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch(
        `${config.apiUrl}/sharing/invitations/${inviteToken}`,
        {
          method: "GET",
          headers
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      setInvitation(data.invitation);
      setFields(data.fields || []);
      setAnswers(data.answers || {});
    } catch (err) {
      console.error(err);
      setError("Unable to load this shared invitation.");
    }

    setIsLoading(false);
  }, [inviteToken, token]);

  useEffect(() => {
    loadInvitation();
  }, [loadInvitation]);

  function updateAnswer(key, value) {
    setAnswers((previous) => ({
      ...previous,
      [key]: value
    }));
  }

  async function saveAnswers() {
    if (!token) {
      setError("You need to be logged in to save answers.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${config.apiUrl}/sharing/invitations/${inviteToken}/answers`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            answers
          })
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setMessage("Answers saved.");
      if (onSaved) {
        onSaved();
      }
    } catch (err) {
      console.error(err);
      setError("Unable to save answers.");
    }

    setIsSaving(false);
  }

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.infoBox}>
          You need to log in or create an account to answer this shared invitation.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.infoBox}>
        <strong>Shared instance</strong>
        <br />
        You are filling a separate copy of selected fields. Your answers will not
        overwrite the owner's personal answers.
      </div>

      {isLoading && <p>Loading invitation...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      {invitation && (
        <div style={styles.infoBox}>
          Status: <strong>{invitation.status}</strong>
          {invitation.recipientLabel && (
            <>
              <br />
              Label: <strong>{invitation.recipientLabel}</strong>
            </>
          )}
        </div>
      )}

      {Object.entries(groupedFields).map(([pageId, pageFields]) => (
        <section key={pageId} style={styles.group}>
          <h2 style={styles.groupTitle}>{pageId}</h2>

          {pageFields.map((field) => {
            const key = fieldKey(field);

            return (
              <div key={key} style={styles.field}>
                <label style={styles.label}>
                  {field.questionLabel}
                </label>

                <textarea
                  style={styles.textarea}
                  value={answers[key] || ""}
                  onChange={(event) => updateAnswer(key, event.target.value)}
                  placeholder="Write your answer here..."
                />
              </div>
            );
          })}
        </section>
      ))}

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.button}
          onClick={saveAnswers}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save answers"}
        </button>

        {onClose && (
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onClose}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
