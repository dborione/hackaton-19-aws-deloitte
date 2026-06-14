import QuestionPage from "../questionPage";

export const questions = [
  { id: "address", label: "Address:", category: "technical" },
  { id: "postal_code", label: "Postal code:", category: "technical" },
  { id: "locality", label: "Locality:", category: "technical" },
  { id: "phone", label: "Phone / mobile:", category: "technical" },
  { id: "email", label: "Email:", category: "technical" }
];

export default function CurrentHome({ token }) {
  return (
    <QuestionPage
      pageId="current-home"
      title="My Current Home"
      questions={questions}
      token={token}
    />
  );
}
