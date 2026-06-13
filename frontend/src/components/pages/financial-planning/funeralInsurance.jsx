import QuestionPage from "../questionPage";

const easyQuestions = [
  "Do I have funeral insurance?",
  "Do I want to subscribe to funeral insurance?",
  "Do I want my funeral costs to be covered by insurance?"
];

const difficultQuestions = [
  "What is the insurance company?",
  "What is the policy number?",
  "Who is the broker or contact person?",
  "What is the broker's address?",
  "What does the contract actually cover?",
  "Is the premium still being paid?",
  "What is the insured capital?",
  "Are there waiting periods or exclusions?"
];

export default function FuneralInsurance() {
  return (
    <QuestionPage
      title="Funeral Insurance"
      easyQuestions={easyQuestions}
      difficultQuestions={difficultQuestions}
    />
  );
}
