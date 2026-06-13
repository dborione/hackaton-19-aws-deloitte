import QuestionPage from "../questionPage";

const cremationYes = { id: "wish_cremation", equals: "yes" };

const questions = [
  { id: "wish_cremation", label: "Je souhaite une incinération (crémation)", type: "yesno" },
  { id: "crematorium", label: "Crématorium :", showIf: cremationYes },
  { id: "ashes_home_conservation", label: "Conservation au domicile de :", type: "yesno", showIf: cremationYes },
  { id: "ashes_home_conservation_person", label: "Conservation au domicile de :", showIf: { id: "ashes_home_conservation", equals: "yes" } },
  { id: "urn_burial", label: "Inhumation de l’urne :", type: "yesno", showIf: cremationYes },
  { id: "columbarium_cemetery", label: "Columbarium au cimetière de :", showIf: { id: "urn_burial", equals: "yes" } },
  { id: "urn_field_cemetery", label: "Champ d’urne au cimetière de :", showIf: { id: "urn_burial", equals: "yes" } },
  { id: "concession_vault_cemetery", label: "Concession / caveau au cimetière de :", showIf: { id: "urn_burial", equals: "yes" } },
  { id: "concession_number", label: "Concession n°", showIf: { id: "urn_burial", equals: "yes" } },
  { id: "plan_paid_ground_concession", label: "Prévoir l’achat d’une concession pleine terre payante", type: "yesno", showIf: cremationYes },
  { id: "ashes_scattering", label: "Dispersion des cendres", type: "yesno", showIf: cremationYes },
  { id: "crematorium_scattering_lawn", label: "Pelouse de dispersion du crématorium", type: "yesno", showIf: { id: "ashes_scattering", equals: "yes" } },
  { id: "cemetery_scattering_lawn", label: "Pelouse de dispersion du cimetière de :", showIf: { id: "ashes_scattering", equals: "yes" } },
  { id: "sea_scattering_by_family", label: "Dispersion par la famille en pleine mer de :", showIf: { id: "ashes_scattering", equals: "yes" } },
  { id: "forest_of_memory_ceremony", label: "Cérémonie dans une forêt du souvenir :", showIf: cremationYes },
  { id: "scattering_stick_option", label: "Option : bâton de dispersion :", showIf: cremationYes },
  { id: "other_ashes_destination", label: "Autre :", showIf: cremationYes },
  { id: "allow_ashes_division", label: "J’autorise ma famille à séparer mes cendres pour un reliquaire, un bijou funéraire, une division en plusieurs urnes.", type: "yesno", showIf: cremationYes },
  { id: "refuse_ashes_division", label: "Je refuse que mes cendres soient séparées.", type: "yesno", showIf: cremationYes }
];

export default function CremationChoice({ token }) {
  return (
    <QuestionPage
      pageId="cremation-choice"
      title="Incinération | Destination des cendres"
      questions={questions}
      token={token}
    />
  );
}
