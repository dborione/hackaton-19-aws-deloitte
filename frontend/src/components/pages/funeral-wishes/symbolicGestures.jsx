import QuestionPage from "../questionPage";

const questions = [
  { id: "religious_rites", label: "Rites religieux", type: "yesno" },
  { id: "butterfly_release", label: "Envol de papillons", type: "yesno" },
  { id: "origamis", label: "Origamis", type: "yesno" },
  { id: "feathers", label: "Plumes", type: "yesno" },
  { id: "light_rite", label: "Rite de la lumière", type: "yesno" },
  { id: "word_tree", label: "Arbre à mots", type: "yesno" },
  { id: "message_box", label: "Boîte à messages", type: "yesno" },
  { id: "memory_flowers", label: "Fleurs du souvenir", type: "yesno" },
  { id: "biodegradable_balloons", label: "Ballons biodégradables", type: "yesno" },
  { id: "plant_tree", label: "Planter un arbre", type: "yesno" }
];

export default function SymbolicGestures({ token }) {
  return (
    <QuestionPage
      pageId="symbolic-gestures"
      title="Décoration et gestes symboliques"
      questions={questions}
      token={token}
    />
  );
}
