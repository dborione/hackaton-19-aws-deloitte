import QuestionPage from "../questionPage";

const chooseReception = [
  { id: "no_reception", equals: "no" },
  { id: "relatives_choose_reception", equals: "no" }
];

export const questions = [
  { id: "photo_slideshow", label: "I would like a photo slideshow, with photos to attach to the A&G Funeral file:", type: "textarea", category: "documents" },
  { id: "no_reception", label: "I do not want a reception after the ceremony", type: "yesno", category: "easy" },
  { id: "relatives_choose_reception", label: "I let my relatives choose", type: "yesno", showIf: { id: "no_reception", equals: "no" }, category: "easy" },
  { id: "recipe_or_favorite_treats", label: "I am sharing a recipe that matters to me and/or my favorite treats, with recipe to attach:", type: "textarea", showIf: chooseReception, category: "documents" },
  { id: "chosen_place", label: "Chosen place:", showIf: chooseReception, category: "documents" }
];

export default function SlideshowReception({ token }) {
  return (
    <QuestionPage
      pageId="slideshow-reception"
      title="Slideshow | Reception | Post-Ceremony Refreshments"
      questions={questions}
      token={token}
    />
  );
}
