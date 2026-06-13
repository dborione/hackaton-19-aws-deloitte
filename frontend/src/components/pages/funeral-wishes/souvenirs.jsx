import QuestionPage from "../questionPage";

const questions = [
  { id: "souvenir_card", label: "Carte (citation et photos éventuelles à annexer)", type: "yesno" },
  { id: "candle", label: "Bougie", type: "yesno" },
  { id: "memories_biography", label: "Mémoires / biographie", type: "yesno" },
  { id: "bookmark", label: "Signet", type: "yesno" },
  { id: "flower_seeds", label: "Graines de fleurs", type: "yesno" },
  { id: "personalized_bottle", label: "Flacon personnalisé", type: "yesno" },
  { id: "tea", label: "Tisane / Thé", type: "yesno" },
  { id: "souvenir_other", label: "Autre :" }
];

export default function Souvenirs({ token }) {
  return (
    <QuestionPage
      pageId="souvenirs"
      title="Souvenirs"
      questions={questions}
      token={token}
    />
  );
}
