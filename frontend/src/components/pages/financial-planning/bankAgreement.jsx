import QuestionPage from "../questionPage";

const questions = [
  { id: "bank", label: "Banque :" },
  { id: "agreement_reference", label: "Référence de la convention :" }
];

export default function BankAgreement({ token }) {
  return (
    <QuestionPage
      pageId="bank-agreement"
      title="Convention bancaire"
      questions={questions}
      token={token}
    />
  );
}
