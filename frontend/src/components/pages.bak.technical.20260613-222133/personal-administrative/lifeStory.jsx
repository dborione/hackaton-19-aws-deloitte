import QuestionPage from "../questionPage";

export const questions = [
  { id: "family_story", label: "My family story:", category: "easy" },
  { id: "professional_path", label: "My professional path:", category: "easy" },
  { id: "honorary_distinctions", label: "Honorary distinction(s):", category: "documents" },
  { id: "passions_hobbies_interests", label: "My passions, hobbies, and interests:", category: "easy" },
  { id: "life_motto", label: "My motto in life:", category: "easy" },
  { id: "beautiful_memory", label: "A beautiful memory or good moments:", category: "easy" }
];

export default function LifeStory({ token }) {
  return (
    <QuestionPage
      pageId="life-story"
      title="Life Story | Personalization"
      questions={questions}
      token={token}
    />
  );
}
