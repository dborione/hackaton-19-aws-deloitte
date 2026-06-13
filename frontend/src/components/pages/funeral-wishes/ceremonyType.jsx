import QuestionPage from "../questionPage";

const questions = [
  { id: "civil_ceremony", label: "Civiles :", type: "yesno" },
  { id: "ag_funeral_ceremony_room", label: "Salle de cérémonie d’A&G Funeral :", showIf: { id: "civil_ceremony", equals: "yes" } },
  { id: "civil_crematorium_room", label: "Salle du crématorium de :", showIf: { id: "civil_ceremony", equals: "yes" } },
  { id: "civil_other_place", label: "Autre lieu :", showIf: { id: "civil_ceremony", equals: "yes" } },
  { id: "religious_ceremony", label: "Religieuses :", type: "yesno" },
  { id: "blessing", label: "Bénédiction", type: "yesno", showIf: { id: "religious_ceremony", equals: "yes" } },
  { id: "mass", label: "Messe", type: "yesno", showIf: { id: "religious_ceremony", equals: "yes" } },
  { id: "religious_other", label: "Autre :", showIf: { id: "religious_ceremony", equals: "yes" } },
  { id: "place_of_worship", label: "Lieu de culte :", showIf: { id: "religious_ceremony", equals: "yes" } },
  { id: "religious_crematorium_room", label: "Salle du crématorium de :", showIf: { id: "religious_ceremony", equals: "yes" } },
  { id: "religious_other_place", label: "Autre lieu :", showIf: { id: "religious_ceremony", equals: "yes" } },
  { id: "theme_clothing", label: "Touche ou tenue thématique pour mes proches (ex : porter des couleurs) :", type: "textarea" },
  { id: "everyone_present", label: "En présence de tous ceux qui le souhaitent", type: "yesno" },
  { id: "privacy", label: "Dans l’intimité", type: "yesno" },
  { id: "let_relatives_choose", label: "Je laisse mes proches choisir", type: "yesno" }
];

export default function CeremonyType({ token }) {
  return (
    <QuestionPage
      pageId="ceremony-type"
      title="Type de cérémonie"
      questions={questions}
      token={token}
    />
  );
}
