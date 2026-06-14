import QuestionPage from "../questionPage";

export const questions = [
  { id: "religious_rites", label: "Religious rites", type: "yesno", category: "easy" },
  { id: "butterfly_release", label: "Butterfly release", type: "yesno", category: "technical" },
  { id: "origamis", label: "Origami", type: "yesno", category: "easy" },
  { id: "feathers", label: "Feathers", type: "yesno", category: "easy" },
  { id: "light_rite", label: "Light ritual", type: "yesno", category: "easy" },
  { id: "word_tree", label: "Message tree", type: "yesno", category: "easy" },
  { id: "message_box", label: "Message box", type: "yesno", category: "easy" },
  { id: "memory_flowers", label: "Memorial flowers", type: "yesno", category: "easy" },
  { id: "biodegradable_balloons", label: "Biodegradable balloons", type: "yesno", category: "technical" },
  { id: "plant_tree", label: "Plant a tree", type: "yesno", category: "technical" }
];

export default function SymbolicGestures({ token }) {
  return (
    <QuestionPage
      pageId="symbolic-gestures"
      title="Decoration and Symbolic Gestures"
      questions={questions}
      token={token}
    />
  );
}
