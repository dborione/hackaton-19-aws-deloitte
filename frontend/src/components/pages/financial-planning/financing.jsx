import QuestionPage from "../questionPage";

export const questions = [
  { id: "register_last_wishes_ag_funeral", label: "Register my final wishes with A&G Funeral (free of charge)", category: "easy" },
  { id: "bank_agreement_for_funeral_costs", label: "Set up a bank agreement to cover my funeral costs", category: "technical" }
];

export default function Financing({ token }) {
  return (
    <QuestionPage
      pageId="financing"
      title="Financing"
      questions={questions}
      token={token}
    />
  );
}
