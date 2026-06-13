import QuestionPage from "../questionPage";

const easyQuestions = [
  "Do I want A&G Funeral to prepare a quote?",
  "Which funeral options should be included in the quote?",
  "Do I want several quote options?"
];

const difficultQuestions = [
  "What is the detailed funeral quote?",
  "Which prices are fixed?",
  "Which costs may change?",
  "What are the municipal taxes?",
  "What is the price of the obituary publication?",
  "What are the costs of flowers, ceremony room, vehicles, staff, reception, and printed materials?"
];

export default function FuneralQuote() {
  return (
    <QuestionPage
      title="Funeral Quote"
      easyQuestions={easyQuestions}
      difficultQuestions={difficultQuestions}
    />
  );
}
