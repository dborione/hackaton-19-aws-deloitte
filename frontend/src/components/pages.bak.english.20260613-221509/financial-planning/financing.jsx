import QuestionPage from "../questionPage";

export const questions = [
  { id: "register_last_wishes_ag_funeral", label: "Enregistrement de mes dernières volontés chez A&G Funeral (gratuit)" },
  { id: "bank_agreement_for_funeral_costs", label: "Établissemement d’une convention bancaire pour couvrir mes frais de funérailles" }
];

export default function Financing({ token }) {
  return (
    <QuestionPage
      pageId="financing"
      title="Financement"
      questions={questions}
      token={token}
    />
  );
}
