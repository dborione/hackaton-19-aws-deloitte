import React, { useEffect, useMemo, useState } from "react";
import config from "../../config";

export default function QuestionPage({
  pageId,
  title,
  questions,
  token
}) {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("");

  const allQuestions = useMemo(() => {
    return questions.map((question) => ({
      id: question.id,
      label: question.label,
      type: question.type || "text",
      showIf: question.showIf || null
    }));
  }, [questions]);

  const getVisibleQuestions = (currentAnswers) => {
    return allQuestions.filter((question) => {
      if (!question.showIf) {
        return true;
      }

      return currentAnswers[question.showIf.id] === question.showIf.equals;
    });
  };

  const cleanHiddenAnswers = (currentAnswers) => {
    const visibleQuestions = getVisibleQuestions(currentAnswers);
    const visibleIds = new Set(visibleQuestions.map((question) => question.id));

    const cleaned = {};

    for (const [key, value] of Object.entries(currentAnswers)) {
      if (visibleIds.has(key)) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  };

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
        setStatus("Erreur chargement");
      }
    }

    if (token && pageId) {
      loadAnswers();
    }
  }, [token, pageId]);

  const saveAnswers = async (nextAnswers) => {
    try {
      setStatus("Sauvegarde...");

      const cleanedAnswers = cleanHiddenAnswers(nextAnswers);

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
      setStatus("Sauvegardé");
    } catch (err) {
      console.error(err);
      setStatus("Erreur sauvegarde");
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
    const nextAnswers = cleanHiddenAnswers({
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
        style={{
          width: "100%",
          padding: 8,
          border: "1px solid #ccc",
          borderRadius: 4
        }}
      />
    );
  };

  const renderYesNoQuestion = (question) => {
    return (
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <label>
          <input
            type="radio"
            name={question.id}
            value="yes"
            checked={answers[question.id] === "yes"}
            onChange={() => handleYesNoChange(question.id, "yes")}
          />
          {" "}Oui
        </label>

        <label>
          <input
            type="radio"
            name={question.id}
            value="no"
            checked={answers[question.id] === "no"}
            onChange={() => handleYesNoChange(question.id, "no")}
          />
          {" "}Non
        </label>
      </div>
    );
  };

  const renderQuestion = (question) => {
    return (
      <div key={question.id} style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          {question.label}
        </label>

        {question.type === "yesno"
          ? renderYesNoQuestion(question)
          : renderTextQuestion(question)}
      </div>
    );
  };

  const visibleQuestions = getVisibleQuestions(answers);

  return (
    <div>
      <h1>{title}</h1>

      <h2>Questions</h2>
      {visibleQuestions.map(renderQuestion)}

      {status && <p>{status}</p>}
    </div>
  );
}