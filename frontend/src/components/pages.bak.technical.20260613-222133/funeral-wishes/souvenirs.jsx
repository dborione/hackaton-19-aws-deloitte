import QuestionPage from "../questionPage";

export const questions = [
  { id: "souvenir_card", label: "Memorial card, with quote and possible photos to attach", type: "yesno", category: "documents" },
  { id: "candle", label: "Candle", type: "yesno", category: "easy" },
  { id: "memories_biography", label: "Memories / biography", type: "yesno", category: "documents" },
  { id: "bookmark", label: "Bookmark", type: "yesno", category: "easy" },
  { id: "flower_seeds", label: "Flower seeds", type: "yesno", category: "easy" },
  { id: "personalized_bottle", label: "Personalized bottle", type: "yesno", category: "easy" },
  { id: "tea", label: "Herbal tea / tea", type: "yesno", category: "easy" },
  { id: "souvenir_other", label: "Other:", category: "easy" }
];

export default function Souvenirs({ token }) {
  return (
    <QuestionPage
      pageId="souvenirs"
      title="Keepsakes"
      questions={questions}
      token={token}
    />
  );
}
