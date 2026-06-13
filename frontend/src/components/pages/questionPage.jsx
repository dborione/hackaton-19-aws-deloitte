import React, { useEffect, useMemo, useState } from "react";
import config from "../../config";
import {
  cleanHiddenAnswers,
  getVisibleQuestions,
  normalizeQuestions
} from "../utils/progress";

const styles = {
  page: {
    textAlign: "left"
  },

  title: {
    margin: "0 0 24px 0",
    color: "#232f3e"
  },

  categoryBox: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 20,
    marginBottom: 24
  },

  categoryTitle: {
    margin: "0 0 8px 0",
    color: "#232f3e"
  },

  categoryHint: {
    margin: "0 0 18px 0",
    color: "#666",
    fontSize: 14
  },

  questionRow: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 42%) 1fr",
    gap: 18,
    alignItems: "center",
    borderBottom: "1px solid #eee",
    padding: "14px 0"
  },

  label: {
    fontWeight: "bold",
    color: "#232f3e",
    lineHeight: 1.4
  },

  input: {
    width: "100%",
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 4,
    boxSizing: "border-box"
  },

  textarea: {
    width: "100%",
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 4,
    resize: "vertical",
    boxSizing: "border-box"
  },

  yesNoBox: {
    display: "flex",
    gap: 18,
    justifyContent: "flex-start"
  },

  status: {
    color: "#555",
    fontWeight: "bold"
  }
};

function getQuestionCategory(question) {
  if (question.category === "technical" || question.category === "documents") {
    return "technical";
  }

  return "easy";
}

export default function QuestionPage({
  pageId,
  title,
  questions,
  token
}) {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("");

  const allQuestions = useMemo(() => {
    const normalized = normalizeQuestions(questions);

    return normalized.map((question, index) => ({
      ...question,
      category: question.category || questions[index]?.category || "easy"
    }));
  }, [questions]);

  useEffect(() => {
    async function loadAnswers() {
      try {
        const res = await fetch(`${config.apiUrl}/data/answers/${pageId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }

        const data = await res.json();
        setAnswers(data.answers || {});
      } catch (err) {
        console.error(err);
        setStatus("Loading error");
      }
    }

    if (token && pageId) {
      loadAnswers();
    }
  }, [token, pageId]);

  const saveAnswers = async (nextAnswers) => {
    try {
      setStatus("Saving...");

      const cleanedAnswers = cleanHiddenAnswers(allQuestions, nextAnswers);

      const payload = {
        pageId,
        questions: allQuestions,
        answers: cleanedAnswers
      };

      const res = await fetch(`${config.apiUrl}/data/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      setAnswers(cleanedAnswers);
      setStatus("Saved");
    } catch (err) {
      console.error(err);
      setStatus("Save error");
    }
  };

  const handleTextChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleTextBlur = (questionId, value) => {
    const nextAnswers = {
      ...answers,
      [questionId]: value
    };

    setAnswers(nextAnswers);
    saveAnswers(nextAnswers);
  };

  const handleYesNoChange = (questionId, value) => {
    const nextAnswers = cleanHiddenAnswers(allQuestions, {
      ...answers,
      [questionId]: value
    });

    setAnswers(nextAnswers);
    saveAnswers(nextAnswers);
  };

  const renderTextQuestion = (question) => {
    return (
      <input
        type="text"
        value={answers[question.id] || ""}
        onChange={(e) => handleTextChange(question.id, e.target.value)}
        onBlur={(e) => handleTextBlur(question.id, e.target.value)}
        style={styles.input}
      />
    );
  };

  const renderTextareaQuestion = (question) => {
    return (
      <textarea
        value={answers[question.id] || ""}
        onChange={(e) => handleTextChange(question.id, e.target.value)}
        onBlur={(e) => handleTextBlur(question.id, e.target.value)}
        rows={4}
        style={styles.textarea}
      />
    );
  };

  const renderYesNoQuestion = (question) => {
    return (
      <div style={styles.yesNoBox}>
        <label>
          <input
            type="radio"
            name={question.id}
            value="yes"
            checked={answers[question.id] === "yes"}
            onChange={() => handleYesNoChange(question.id, "yes")}
          />
          {" "}Yes
        </label>

        <label>
          <input
            type="radio"
            name={question.id}
            value="no"
            checked={answers[question.id] === "no"}
            onChange={() => handleYesNoChange(question.id, "no")}
          />
          {" "}No
        </label>
      </div>
    );
  };

  const renderInput = (question) => {
    if (question.type === "yesno") {
      return renderYesNoQuestion(question);
    }

    if (question.type === "textarea") {
      return renderTextareaQuestion(question);
    }

    return renderTextQuestion(question);
  };

  const renderQuestion = (question) => {
    return (
      <div key={question.id} style={styles.questionRow}>
        <label style={styles.label}>
          {question.label}
        </label>

        <div>
          {renderInput(question)}
        </div>
      </div>
    );
  };

  const visibleQuestions = getVisibleQuestions(allQuestions, answers);

  const easyQuestions = visibleQuestions.filter(
    (question) => getQuestionCategory(question) === "easy"
  );

  const technicalQuestions = visibleQuestions.filter(
    (question) => getQuestionCategory(question) === "technical"
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{title}</h1>

      <section style={styles.categoryBox}>
        <h2 style={styles.categoryTitle}>Easy to answer</h2>
        <p style={styles.categoryHint}>
          These questions can usually be answered on the spot, based on personal preferences.
        </p>

        {easyQuestions.length === 0 ? (
          <p>No easy questions visible yet.</p>
        ) : (
          easyQuestions.map(renderQuestion)
        )}
      </section>

      <section style={styles.categoryBox}>
        <h2 style={styles.categoryTitle}>Technical or harder questions</h2>
        <p style={styles.categoryHint}>
          These questions may require checking documents, understanding a technical funeral option, contacting someone, or doing a bit of research before answering.
        </p>

        {technicalQuestions.length === 0 ? (
          <p>No technical or harder questions visible yet.</p>
        ) : (
          technicalQuestions.map(renderQuestion)
        )}
      </section>

      {status && <p style={styles.status}>{status}</p>}
    </div>
  );
}
