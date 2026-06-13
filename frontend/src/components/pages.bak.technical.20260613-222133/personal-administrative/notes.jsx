import QuestionPage from "../questionPage";

export const questions = [
  { id: "notes", label: "Notes:", category: "easy" }
];

export default function Notes({ token }) {
  return (
    <QuestionPage
      pageId="notes"
      title="Notes"
      questions={questions}
      token={token}
    />
  );
}
