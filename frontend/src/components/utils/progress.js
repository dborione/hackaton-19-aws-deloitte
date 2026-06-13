export function normalizeQuestions(questions) {
  return questions.map((question) => ({
    id: question.id,
    label: question.label,
    type: question.type || "text",
    showIf: question.showIf || null,
    hideIf: question.hideIf || null
  }));
}

function asArray(condition) {
  if (!condition) {
    return [];
  }

  return Array.isArray(condition) ? condition : [condition];
}

function conditionMatches(condition, answers) {
  return answers[condition.id] === condition.equals;
}

export function shouldShowQuestion(question, answers) {
  const showConditions = asArray(question.showIf);
  const hideConditions = asArray(question.hideIf);

  if (showConditions.length > 0) {
    const allShowConditionsMatch = showConditions.every((condition) =>
      conditionMatches(condition, answers)
    );

    if (!allShowConditionsMatch) {
      return false;
    }
  }

  if (hideConditions.length > 0) {
    const oneHideConditionMatches = hideConditions.some((condition) =>
      conditionMatches(condition, answers)
    );

    if (oneHideConditionMatches) {
      return false;
    }
  }

  return true;
}

export function getVisibleQuestions(questions, answers) {
  return normalizeQuestions(questions).filter((question) =>
    shouldShowQuestion(question, answers)
  );
}

export function cleanHiddenAnswers(questions, answers) {
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const visibleIds = new Set(visibleQuestions.map((question) => question.id));

  const cleaned = {};

  for (const [key, value] of Object.entries(answers)) {
    if (visibleIds.has(key)) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export function isAnswered(question, answers) {
  const value = answers[question.id];

  if (question.type === "yesno") {
    return value === "yes" || value === "no";
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== undefined && value !== null && value !== "";
}

export function getProgressForPage(questions, answers) {
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const total = visibleQuestions.length;
  const answered = visibleQuestions.filter((question) =>
    isAnswered(question, answers)
  ).length;

  const percent = total === 0
    ? 0
    : Math.round((answered / total) * 100);

  return {
    answered,
    total,
    percent
  };
}

export function getProgressForGroup(pages) {
  let answered = 0;
  let total = 0;

  for (const page of pages) {
    const progress = getProgressForPage(page.questions, page.answers);
    answered += progress.answered;
    total += progress.total;
  }

  const percent = total === 0
    ? 0
    : Math.round((answered / total) * 100);

  return {
    answered,
    total,
    percent
  };
}
