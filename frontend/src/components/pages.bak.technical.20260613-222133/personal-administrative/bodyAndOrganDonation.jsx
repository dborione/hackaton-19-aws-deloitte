import QuestionPage from "../questionPage";

export const questions = [
  { id: "do_not_donate_body", label: "I do not wish to donate my body to science", category: "easy" },
  { id: "body_donated_to_university", label: "I have donated my body to the following university:", category: "documents" },
  { id: "body_donation_documents_location", label: "The documents related to this donation are located at:", category: "documents" },
  { id: "organ_donation", label: "Organ donation:", category: "documents" }
];

export default function BodyAndOrganDonation({ token }) {
  return (
    <QuestionPage
      pageId="body-and-organ-donation"
      title="Organ and Body Donation"
      questions={questions}
      token={token}
    />
  );
}
