import QuestionPage from "../questionPage";

const chooseTexts = { id: "relatives_choose_texts", equals: "no" };

export const questions = [
  { id: "relatives_choose_texts", label: "I let my relatives choose", type: "yesno", category: "easy" },
  { id: "significant_texts", label: "I would like the following meaningful text(s) to be read:", type: "textarea", showIf: chooseTexts, category: "documents" },
  { id: "last_message", label: "I would like to record or share a final message, audio recording, short film, etc. to attach:", type: "textarea", showIf: chooseTexts, category: "documents" }
];

export default function Texts({ token }) {
  return (
    <QuestionPage
      pageId="texts"
      title="Texts"
      questions={questions}
      token={token}
    />
  );
}
