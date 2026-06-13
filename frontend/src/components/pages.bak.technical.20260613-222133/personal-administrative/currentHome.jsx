import QuestionPage from "../questionPage";

export const questions = [
  { id: "address", label: "Address:", category: "easy" },
  { id: "postal_code", label: "Postal code:", category: "easy" },
  { id: "locality", label: "Locality:", category: "easy" },
  { id: "phone", label: "Phone / mobile:", category: "easy" },
  { id: "email", label: "Email:", category: "easy" }
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
