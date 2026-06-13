import QuestionPage from "../questionPage";

const questions = [
  { id: "do_not_donate_body", label: "Je ne souhaite pas donner mon corps à la science" },
  { id: "body_donated_to_university", label: "J’ai légué mon corps à l’Université :" },
  { id: "body_donation_documents_location", label: "Les documents concernant ce don se trouvent :" },
  { id: "organ_donation", label: "Don d’organe :" }
];

export default function BodyAndOrganDonation({ token }) {
  return (
    <QuestionPage
      pageId="body-and-organ-donation"
      title="Don d’organe / de corps"
      questions={questions}
      token={token}
    />
  );
}
