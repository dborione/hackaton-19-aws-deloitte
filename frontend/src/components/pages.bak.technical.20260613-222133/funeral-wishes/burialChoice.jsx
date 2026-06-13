import QuestionPage from "../questionPage";

const showBurialDetails = [
  { id: "let_relatives_choose", equals: "no" },
  { id: "wish_burial", equals: "yes" }
];

export const questions = [
  { id: "let_relatives_choose", label: "I let my relatives choose", type: "yesno", category: "easy" },
  { id: "wish_burial", label: "I wish to be buried", type: "yesno", showIf: { id: "let_relatives_choose", equals: "no" }, category: "easy" },
  { id: "cemetery", label: "Cemetery:", showIf: showBurialDetails, category: "documents" },
  { id: "has_existing_concession", label: "There is an existing concession", type: "yesno", showIf: showBurialDetails, category: "documents" },
  { id: "existing_concession_name", label: "Existing concession in the name of:", showIf: { id: "has_existing_concession", equals: "yes" }, category: "documents" },
  { id: "concession_number", label: "Concession number:", showIf: { id: "has_existing_concession", equals: "yes" }, category: "documents" },
  { id: "with_vault", label: "With vault", type: "yesno", showIf: { id: "has_existing_concession", equals: "yes" }, category: "documents" },
  { id: "without_vault", label: "Without vault", type: "yesno", showIf: { id: "has_existing_concession", equals: "yes" }, category: "documents" },
  { id: "vault_opening_contact", label: "Contact person for opening the vault:", showIf: { id: "with_vault", equals: "yes" }, category: "documents" },
  { id: "plan_new_concession", label: "Plan the purchase of a new concession", type: "yesno", showIf: showBurialDetails, category: "documents" },
  { id: "free_ground", label: "Free ground burial: 5 years, non-renewable", type: "yesno", showIf: { id: "plan_new_concession", equals: "yes" }, category: "documents" },
  { id: "paid_ground", label: "Paid ground burial: 10 to 50 years, depending on the municipality", type: "yesno", showIf: { id: "plan_new_concession", equals: "yes" }, category: "documents" },
  { id: "concession_with_vault", label: "Concession with vault", type: "yesno", showIf: { id: "plan_new_concession", equals: "yes" }, category: "documents" }
];

export default function BurialChoice({ token }) {
  return (
    <QuestionPage
      pageId="burial-choice"
      title="Funeral Choice | Burial Method"
      questions={questions}
      token={token}
    />
  );
}
