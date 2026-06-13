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

  invitationCard: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 18,
    marginBottom: 18
  },

  invitationHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 16
  },

  title: {
    margin: 0,
    color: "#232f3e"
  },

  status: {
    background: "#232f3e",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "bold",
    whiteSpace: "nowrap"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    padding: "8px",
    color: "#232f3e"
  },

  td: {
    borderBottom: "1px solid #eee",
    padding: "8px",
    verticalAlign: "top"
  },

  answerEmpty: {
    color: "#999",
    fontStyle: "italic"
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 20
  },

  button: {
    background: "#ff9900",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  },

  dangerButton: {
    background: "#b91c1c",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  },

  error: {
    color: "#b91c1c",
    fontWeight: "bold"
  },

  success: {
    color: "#047857",
    fontWeight: "bold"
  }
};

function groupByInvitation(rows) {
  const groups = {};

  rows.forEach((row) => {
    if (!groups[row.invitationId]) {
      groups[row.invitationId] = {
        invitationId: row.invitationId,
        recipientLabel: row.recipientLabel || "",
        status: row.status || "pending",
        rows: []
      };
    }

    groups[row.invitationId].rows.push(row);
  });

  return Object.values(groups);
}

export default function ReceivedSharedAnswers({ token }) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingInvitationId, setDeletingInvitationId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const invitations = useMemo(() => {
    return groupByInvitation(rows);
  }, [rows]);

  const loadAnswers = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${config.apiUrl}/sharing/received-answers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      setRows(data.sharedAnswers || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load received answers.");
      setRows([]);
    }

    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    loadAnswers();
  }, [loadAnswers]);

  async function deleteInvitation(invitation) {
    if (invitation.status !== "pending") {
      setError("Only pending invitations can be deleted.");
      return;
    }

    const ok = window.confirm(
      "Delete this pending invitation? This cannot be undone."
    );

    if (!ok) {
      return;
    }

    setDeletingInvitationId(invitation.invitationId);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${config.apiUrl}/sharing/invitations/${invitation.invitationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setMessage("Invitation deleted.");
      await loadAnswers();
    } catch (err) {
      console.error(err);
      setError("Unable to delete invitation. It may already be accepted.");
    }

    setDeletingInvitationId(null);
  }

  return (
    <div style={styles.page}>
      <div style={styles.infoBox}>
        Here you can see the answers submitted by people you invited through
        Account Sharing. Pending invitations can be deleted until they are
        accepted.
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.button}
          onClick={loadAnswers}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      {isLoading && <p>Loading received answers...</p>}

      {!isLoading && invitations.length === 0 && (
        <div style={styles.infoBox}>
          No received answers yet.
        </div>
      )}

      {invitations.map((invitation) => (
        <section
          key={invitation.invitationId}
          style={styles.invitationCard}
        >
          <div style={styles.invitationHeader}>
            <div>
              <h2 style={styles.title}>
                Shared invitation #{invitation.invitationId}
              </h2>

              <p>
                {invitation.recipientLabel
                  ? `Label: ${invitation.recipientLabel}`
                  : "No label"}
              </p>

              {invitation.status === "pending" && (
                <button
                  type="button"
                  style={styles.dangerButton}
                  onClick={() => deleteInvitation(invitation)}
                  disabled={deletingInvitationId === invitation.invitationId}
                >
                  {deletingInvitationId === invitation.invitationId
                    ? "Deleting..."
                    : "Delete pending invitation"}
                </button>
              )}
            </div>

            <span style={styles.status}>
              {invitation.status}
            </span>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Page</th>
                <th style={styles.th}>Question</th>
                <th style={styles.th}>Answer</th>
                <th style={styles.th}>Updated</th>
              </tr>
            </thead>

            <tbody>
              {invitation.rows.map((row) => (
                <tr key={`${row.pageId}:${row.questionId}`}>
                  <td style={styles.td}>{row.pageId}</td>
                  <td style={styles.td}>{row.questionLabel}</td>
                  <td style={styles.td}>
                    {row.answer ? (
                      row.answer
                    ) : (
                      <span style={styles.answerEmpty}>
                        No answer yet
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {row.updatedAt || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
