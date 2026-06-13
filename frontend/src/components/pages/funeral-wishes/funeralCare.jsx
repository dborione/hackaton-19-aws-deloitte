import QuestionPage from "../questionPage";

export const questions = [
  { id: "ag_funeral_take_care", label: "I would like A&G Funeral to take care of me", type: "yesno", category: "easy" },
  { id: "presentation_care", label: "Presentation care", type: "yesno", showIf: { id: "ag_funeral_take_care", equals: "yes", category: "technical" }, category: "easy" },
  { id: "conservation_care", label: "Preservation care", type: "yesno", showIf: { id: "ag_funeral_take_care", equals: "yes", category: "technical" }, category: "technical" },
  { id: "specific_outfit_choice", label: "Choice of a specific outfit or clothing style:", showIf: { id: "ag_funeral_take_care", equals: "yes", category: "easy" }, category: "easy" },
  { id: "clothes_location", label: "These clothes are located at:", showIf: { id: "ag_funeral_take_care", equals: "yes", category: "technical" }, category: "easy" },
  { id: "no_funeral_care", label: "I do not want funeral care", type: "yesno", hideIf: { id: "ag_funeral_take_care", equals: "yes", category: "easy" }, category: "easy" },
  { id: "family_chooses_care", label: "I let my family choose", type: "yesno", hideIf: { id: "ag_funeral_take_care", equals: "yes", category: "easy" }, category: "easy" }
];

export default function FuneralCare({ token }) {
  return (
    <QuestionPage
      pageId="funeral-care"
      title="Care and Presentation"
      questions={questions}
      token={token}
    />
  );
}
