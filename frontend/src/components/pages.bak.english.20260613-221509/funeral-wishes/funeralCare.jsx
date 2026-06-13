import QuestionPage from "../questionPage";

export const questions = [
  { id: "ag_funeral_take_care", label: "Je souhaite qu’A&G Funeral prenne soin de moi :", type: "yesno" },
  { id: "presentation_care", label: "Soins de présentation :", type: "yesno", showIf: { id: "ag_funeral_take_care", equals: "yes" } },
  { id: "conservation_care", label: "Soins de conservation", type: "yesno", showIf: { id: "ag_funeral_take_care", equals: "yes" } },
  { id: "specific_outfit_choice", label: "Choix d’une tenue particulière (style de vêtements) :", showIf: { id: "ag_funeral_take_care", equals: "yes" } },
  { id: "clothes_location", label: "Ces vêtements se trouvent :", showIf: { id: "ag_funeral_take_care", equals: "yes" } },
  { id: "no_funeral_care", label: "Je ne souhaite pas de soins funéraires", type: "yesno", hideIf: { id: "ag_funeral_take_care", equals: "yes" } },
  { id: "family_chooses_care", label: "Je laisse ma famille choisir", type: "yesno", hideIf: { id: "ag_funeral_take_care", equals: "yes" } }
];

export default function FuneralCare({ token }) {
  return (
    <QuestionPage
      pageId="funeral-care"
      title="Soins & présentation"
      questions={questions}
      token={token}
    />
  );
}
