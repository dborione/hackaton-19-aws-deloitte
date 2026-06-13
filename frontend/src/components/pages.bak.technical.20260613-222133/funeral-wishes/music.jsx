import QuestionPage from "../questionPage";

const chooseMusic = [
  { id: "no_music", equals: "no" },
  { id: "relatives_choose_music", equals: "no" }
];

export const questions = [
  { id: "no_music", label: "I would prefer there to be no music", type: "yesno", category: "easy" },
  { id: "relatives_choose_music", label: "I let my relatives choose", type: "yesno", showIf: { id: "no_music", equals: "no" }, category: "easy" },
  { id: "desired_music_accompaniment", label: "I would like the following musical accompaniment:", type: "textarea", showIf: chooseMusic, category: "easy" },
  { id: "choir_musicians_soloist", label: "I would like a choir, several musicians, or a soloist:", type: "textarea", showIf: chooseMusic, category: "documents" }
];

export default function Music({ token }) {
  return (
    <QuestionPage
      pageId="music"
      title="Musical Accompaniment"
      questions={questions}
      token={token}
    />
  );
}
