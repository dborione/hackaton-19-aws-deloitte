import QuestionPage from "../questionPage";

const easyQuestions = [
  "Do I have life insurance?",
  "Should life insurance be mentioned for funeral planning?",
  "Do I know which company manages it?"
];

const difficultQuestions = [
  "What is the life insurance company?",
  "What is the policy number?",
  "Who is the broker or contact person?",
  "What is the broker's address?",
  "Who are the beneficiaries?",
  "Can this insurance be used for funeral expenses?"
];

export default function LifeInsurance() {
  return (
    <QuestionPage
      title="Life Insurance"
      easyQuestions={easyQuestions}
      difficultQuestions={difficultQuestions}
    />
  );
}
