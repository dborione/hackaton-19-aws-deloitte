import QuestionPage from "../questionPage";

const questions = [
  { id: "notes", label: "Notes :" }
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
