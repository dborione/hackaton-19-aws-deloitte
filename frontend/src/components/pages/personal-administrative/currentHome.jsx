import QuestionPage from "../questionPage";

const questions = [
  { id: "address", label: "Adresse :" },
  { id: "postal_code", label: "Code Postal :" },
  { id: "locality", label: "Localité :" },
  { id: "phone", label: "Téléphone / GSM :" },
  { id: "email", label: "E-mail :" }
];

export default function CurrentHome({ token }) {
  return (
    <QuestionPage
      pageId="current-home"
      title="Mon domicile actuel"
      questions={questions}
      token={token}
    />
  );
}
