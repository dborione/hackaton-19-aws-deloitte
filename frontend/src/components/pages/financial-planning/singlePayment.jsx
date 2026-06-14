import QuestionPage from "../questionPage";

export const questions = [
  { id: "single_payment", label: "Single premium payment (subject to conditions)", category: "technical" },
  { id: "single_payment_amount_date", label: "Amount paid and payment date:", category: "technical" }
];

export default function SinglePayment({ token }) {
  return (
    <QuestionPage
      pageId="single-payment"
      title="Single Premium Payment"
      questions={questions}
      token={token}
    />
  );
}
