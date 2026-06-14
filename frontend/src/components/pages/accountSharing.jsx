import { useMemo, useState } from "react";
import config from "../../config";

const styles = {
  page: {
    textAlign: "left"
  },

  form: {
    display: "grid",
    gap: 16,
    marginBottom: 24
  },

  label: {
    fontWeight: "bold",
    color: "#4f4f4f"
  },

  input: {
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14
  },

  section: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 18,
    marginBottom: 16
  },

  categoryTitle: {
    margin: "0 0 12px 0",
    color: "#4f4f4f"
  },

  subcategoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    marginBottom: 8
  },

  subcategoryTitle: {
    margin: 0,
    color: "#444"
  },

  questionRow: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 8
  },

  checkbox: {
    marginTop: 3
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
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 13
  },

  smallButton: {
    background: "#f3f4f6",
    color: "#4f4f4f",
    border: "1px solid #4f4f4f",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 12,
    whiteSpace: "nowrap"
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20
  },

  result: {
    background: "#f3f4f6",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    marginTop: 20
  },

  linkBox: {
    wordBreak: "break-all",
    color: "#4f4f4f",
    fontWeight: "bold"
  },

  error: {
    color: "#ff0000",
    fontWeight: "bold"
  },

  hint: {
    color: "#666",
    lineHeight: 1.5
  }
};

function getQuestionLabel(question) {
  if (typeof question === "string") {
    return question;
  }

  return question.label || question.text || question.title || "Untitled question";
}

function getQuestionId(question, index) {
  if (typeof question === "string") {
    return `question-${index}`;
  }

  return question.id || `question-${index}`;
}

function getSelectionKey(pageId, questionId) {
  return `${pageId}:${questionId}`;
}

export default function AccountSharing({
  token,
  dashboardCategories,
  pageQuestions
}) {
  const [recipientLabel, setRecipientLabel] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [shareLink, setShareLink] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [error, setError] = useState("");

  const allQuestions = useMemo(() => {
    const result = [];

    dashboardCategories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        const questions = pageQuestions[subcategory.id] || [];

        questions.forEach((question, index) => {
          const questionId = getQuestionId(question, index);
          const questionLabel = getQuestionLabel(question);

          result.push({
            pageId: subcategory.id,
            questionId,
            questionLabel
          });
        });
      });
    });

    return result;
  }, [dashboardCategories, pageQuestions]);

  const selectedCount = useMemo(() => {
    return Object.keys(selectedQuestions).length;
  }, [selectedQuestions]);

  const allSelected = allQuestions.length > 0 && selectedCount === allQuestions.length;

  function toggleQuestion(pageId, questionId, questionLabel) {
    const key = getSelectionKey(pageId, questionId);

    setSelectedQuestions((previous) => {
      const next = { ...previous };

      if (next[key]) {
        delete next[key];
      } else {
        next[key] = {
          pageId,
          questionId,
          questionLabel
        };
      }

      return next;
    });
  }

  function toggleAllQuestions() {
    if (allSelected) {
      setSelectedQuestions({});
      return;
    }

    const next = {};

    allQuestions.forEach((question) => {
      const key = getSelectionKey(question.pageId, question.questionId);
      next[key] = question;
    });

    setSelectedQuestions(next);
  }

  function getSubcategoryQuestions(subcategory) {
    const questions = pageQuestions[subcategory.id] || [];

    return questions.map((question, index) => {
      const questionId = getQuestionId(question, index);
      const questionLabel = getQuestionLabel(question);

      return {
        pageId: subcategory.id,
        questionId,
        questionLabel
      };
    });
  }

  function isSubcategoryFullySelected(subcategory) {
    const questions = getSubcategoryQuestions(subcategory);

    if (questions.length === 0) {
      return false;
    }

    return questions.every((question) => {
      const key = getSelectionKey(question.pageId, question.questionId);
      return Boolean(selectedQuestions[key]);
    });
  }

  function toggleSubcategory(subcategory) {
    const questions = getSubcategoryQuestions(subcategory);
    const fullySelected = isSubcategoryFullySelected(subcategory);

    setSelectedQuestions((previous) => {
      const next = { ...previous };

      questions.forEach((question) => {
        const key = getSelectionKey(question.pageId, question.questionId);

        if (fullySelected) {
          delete next[key];
        } else {
          next[key] = question;
        }
      });

      return next;
    });
  }

  async function createSharingLink() {
    setError("");
    setShareLink("");

    const fields = Object.values(selectedQuestions);

    if (fields.length === 0) {
      setError("Please select at least one question.");
      return;
    }

    setIsCreatingLink(true);

    try {
      const res = await fetch(`${config.apiUrl}/sharing/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientLabel: recipientLabel,
          fields
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      setShareLink(data.shareLink || data.url || data.link || "");
    } catch (err) {
      console.error(err);
      setError("Unable to create sharing link. The backend endpoint may not exist yet.");
    }

    setIsCreatingLink(false);
  }

  async function copyLink() {
    if (!shareLink) {
      return;
    }

    await navigator.clipboard.writeText(shareLink);
  }

  return (
    <div style={styles.page}>
      <p style={styles.hint}>
        Select the questions you want to share. The recipient will only see
        those selected fields. Their answers should be stored separately from
        your own answers, but you will be able to review what they submit.
      </p>

      <div style={styles.form}>
        <label style={styles.label} htmlFor="recipientLabel">
          Recipient label
        </label>

        <input
          id="recipientLabel"
          style={styles.input}
          type="text"
          value={recipientLabel}
          onChange={(event) => setRecipientLabel(event.target.value)}
          placeholder="Example: brother, sister, notary, friend..."
        />
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.secondaryButton}
          onClick={toggleAllQuestions}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>

        <span style={styles.hint}>
          {selectedCount}/{allQuestions.length} selected
        </span>
      </div>

      {dashboardCategories.map((category) => (
        <section key={category.id} style={styles.section}>
          <h2 style={styles.categoryTitle}>{category.title}</h2>

          {category.subcategories.map((subcategory) => {
            const questions = pageQuestions[subcategory.id] || [];
            const subcategoryFullySelected = isSubcategoryFullySelected(subcategory);

            return (
              <div key={subcategory.id}>
                <div style={styles.subcategoryHeader}>
                  <h3 style={styles.subcategoryTitle}>
                    {subcategory.title}
                  </h3>

                  <button
                    type="button"
                    style={styles.smallButton}
                    onClick={() => toggleSubcategory(subcategory)}
                  >
                    {subcategoryFullySelected
                      ? "Deselect subcategory"
                      : "Select subcategory"}
                  </button>
                </div>

                {questions.length === 0 && (
                  <p style={styles.hint}>
                    No questions configured for this page.
                  </p>
                )}

                {questions.map((question, index) => {
                  const questionId = getQuestionId(question, index);
                  const questionLabel = getQuestionLabel(question);
                  const key = getSelectionKey(subcategory.id, questionId);

                  return (
                    <label key={key} style={styles.questionRow}>
                      <input
                        style={styles.checkbox}
                        type="checkbox"
                        checked={Boolean(selectedQuestions[key])}
                        onChange={() =>
                          toggleQuestion(
                            subcategory.id,
                            questionId,
                            questionLabel
                          )
                        }
                      />

                      <span>{questionLabel}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </section>
      ))}

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.button}
          onClick={createSharingLink}
          disabled={isCreatingLink}
        >
          {isCreatingLink
            ? "Creating link..."
            : `Create sharing link (${selectedCount})`}
        </button>

        {shareLink && (
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={copyLink}
          >
            Copy link
          </button>
        )}
      </div>

      {shareLink && (
        <div style={styles.result}>
          <strong>Sharing link:</strong>
          <p style={styles.linkBox}>{shareLink}</p>
        </div>
      )}
    </div>
  );
}
