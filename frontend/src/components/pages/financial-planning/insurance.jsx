import QuestionPage from "../questionPage";

export const questions = [
  { id: "insurances", label: "Insurance notes", category: "easy" },
  { id: "has_funeral_insurance", label: "I have funeral insurance", category: "easy" },
  { id: "funeral_insurance_company", label: "Funeral insurance company:", category: "technical" },
  { id: "funeral_insurance_policy_number", label: "Funeral insurance policy number:", category: "technical" },
  { id: "funeral_insurance_broker_contact", label: "Funeral insurance broker/contact:", category: "technical" },
  { id: "funeral_insurance_address", label: "Funeral insurance address:", category: "technical" },
  { id: "wants_funeral_insurance", label: "I would like to take out funeral insurance", category: "easy" },
  { id: "has_life_insurance", label: "I have life insurance", category: "easy" },
  { id: "life_insurance_company", label: "Life insurance company:", category: "technical" },
  { id: "life_insurance_policy_number", label: "Life insurance policy number:", category: "technical" },
  { id: "life_insurance_broker_contact", label: "Life insurance broker/contact:", category: "technical" },
  { id: "life_insurance_address", label: "Life insurance address:", category: "technical" },
  { id: "no_insurance", label: "I do not have any insurance", category: "easy" }
];

export default function Insurance({ token }) {
  return (
    <QuestionPage
      pageId="insurance"
      title="Insurance"
      questions={questions}
      token={token}
    />
  );
}
