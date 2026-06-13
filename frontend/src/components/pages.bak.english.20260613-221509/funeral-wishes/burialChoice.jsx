import QuestionPage from "../questionPage";

const showBurialDetails = [
  { id: "let_relatives_choose", equals: "no" },
  { id: "wish_burial", equals: "yes" }
];

export const questions = [
  { id: "let_relatives_choose", label: "Je laisse mes proches choisir", type: "yesno" },
  { id: "wish_burial", label: "Je souhaite être inhumé(e) (enterrement)", type: "yesno", showIf: { id: "let_relatives_choose", equals: "no" } },
  { id: "cemetery", label: "Cimetière :", showIf: showBurialDetails },
  { id: "has_existing_concession", label: "Concession existante au nom de :", type: "yesno", showIf: showBurialDetails },
  { id: "existing_concession_name", label: "Concession existante au nom de :", showIf: { id: "has_existing_concession", equals: "yes" } },
  { id: "concession_number", label: "Concession n°", showIf: { id: "has_existing_concession", equals: "yes" } },
  { id: "with_vault", label: "Avec caveau", type: "yesno", showIf: { id: "has_existing_concession", equals: "yes" } },
  { id: "without_vault", label: "Sans caveau", type: "yesno", showIf: { id: "has_existing_concession", equals: "yes" } },
  { id: "vault_opening_contact", label: "Personne de contact pour l’ouverture du caveau :", showIf: { id: "with_vault", equals: "yes" } },
  { id: "plan_new_concession", label: "Prévoir l’achat d’une nouvelle concession :", type: "yesno", showIf: showBurialDetails },
  { id: "free_ground", label: "Pleine terre gratuite : 5 ans pleine terre, non renouvelable", type: "yesno", showIf: { id: "plan_new_concession", equals: "yes" } },
  { id: "paid_ground", label: "Pleine terre payante : 10 à 50 ans - selon la commune", type: "yesno", showIf: { id: "plan_new_concession", equals: "yes" } },
  { id: "concession_with_vault", label: "Concession avec caveau", type: "yesno", showIf: { id: "plan_new_concession", equals: "yes" } }
];

export default function BurialChoice({ token }) {
  return (
    <QuestionPage
      pageId="burial-choice"
      title="Choix des funérailles | Mode de sépulture"
      questions={questions}
      token={token}
    />
  );
}
