import QuestionPage from "../questionPage";

export const questions = [
  { id: "bank", label: "Bank:", category: "technical" },
  { id: "agreement_reference", label: "Bank agreement reference:", category: "technical" }
];

export default function BankAgreement({ token }) {
  return (
    <QuestionPage
      pageId="bank-agreement"
      title="Bank Agreement"
      questions={questions}
      token={token}
    />
  );
}
