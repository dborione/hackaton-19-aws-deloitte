import QuestionPage from "../questionPage";

const questions = [
  { id: "single_payment", label: "Paiement en prime unique (sous conditions)" },
  { id: "single_payment_amount_date", label: "Montant de effectué le" }
];

export default function SinglePayment({ token }) {
  return (
    <QuestionPage
      pageId="single-payment"
      title="Paiement en prime unique"
      questions={questions}
      token={token}
    />
  );
}
