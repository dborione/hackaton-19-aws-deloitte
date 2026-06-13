import QuestionPage from "../questionPage";

export const questions = [
  { id: "civil_ceremony", label: "Civil ceremony:", type: "yesno", category: "easy" },
  { id: "ag_funeral_ceremony_room", label: "A&G Funeral ceremony room:", showIf: { id: "civil_ceremony", equals: "yes" }, category: "documents" },
  { id: "civil_crematorium_room", label: "Crematorium room in:", showIf: { id: "civil_ceremony", equals: "yes" }, category: "documents" },
  { id: "civil_other_place", label: "Other place:", showIf: { id: "civil_ceremony", equals: "yes" }, category: "documents" },
  { id: "religious_ceremony", label: "Religious ceremony:", type: "yesno", category: "easy" },
  { id: "blessing", label: "Blessing", type: "yesno", showIf: { id: "religious_ceremony", equals: "yes" }, category: "easy" },
  { id: "mass", label: "Mass", type: "yesno", showIf: { id: "religious_ceremony", equals: "yes" }, category: "easy" },
  { id: "religious_other", label: "Other:", showIf: { id: "religious_ceremony", equals: "yes" }, category: "easy" },
  { id: "place_of_worship", label: "Place of worship:", showIf: { id: "religious_ceremony", equals: "yes" }, category: "documents" },
  { id: "religious_crematorium_room", label: "Crematorium room in:", showIf: { id: "religious_ceremony", equals: "yes" }, category: "documents" },
  { id: "religious_other_place", label: "Other place:", showIf: { id: "religious_ceremony", equals: "yes" }, category: "documents" },
  { id: "theme_clothing", label: "Theme detail or clothing for my relatives, for example wearing specific colors:", type: "textarea", category: "easy" },
  { id: "everyone_present", label: "In the presence of everyone who wishes to attend", type: "yesno", category: "easy" },
  { id: "privacy", label: "In private", type: "yesno", category: "easy" },
  { id: "let_relatives_choose", label: "I let my relatives choose", type: "yesno", category: "easy" }
];

export default function CeremonyType({ token }) {
  return (
    <QuestionPage
      pageId="ceremony-type"
      title="Ceremony Type"
      questions={questions}
      token={token}
    />
  );
}
