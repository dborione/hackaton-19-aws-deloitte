import QuestionPage from "../questionPage";

export const questions = [
  { id: "insurances", label: "Assurances" },
  { id: "has_funeral_insurance", label: "Je possède une assurance obsèques" },
  { id: "funeral_insurance_company", label: "Compagnie :" },
  { id: "funeral_insurance_policy_number", label: "N° de police :" },
  { id: "funeral_insurance_broker_contact", label: "Contact (courtier) :" },
  { id: "funeral_insurance_address", label: "Adresse :" },
  { id: "wants_funeral_insurance", label: "Je souhaite souscrire à une assurance obsèques" },
  { id: "has_life_insurance", label: "Je possède une assurance vie" },
  { id: "life_insurance_company", label: "Compagnie :" },
  { id: "life_insurance_policy_number", label: "N° de police :" },
  { id: "life_insurance_broker_contact", label: "Contact (courtier) :" },
  { id: "life_insurance_address", label: "Adresse :" },
  { id: "no_insurance", label: "Je ne possède pas d’assurance" }
];

export default function Insurance({ token }) {
  return (
    <QuestionPage
      pageId="insurance"
      title="Assurances"
      questions={questions}
      token={token}
    />
  );
}
