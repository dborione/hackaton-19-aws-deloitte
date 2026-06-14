import QuestionPage from "../questionPage";

const allowPrinted = { id: "no_printed_material", equals: "no", category: "easy" };

export const questions = [
  { id: "no_printed_material", label: "I do not want any printed material", type: "yesno", category: "easy" },
  { id: "family_chooses_printed_material", label: "I let my family choose", type: "yesno", showIf: allowPrinted, category: "easy" },
  { id: "press_necrology", label: "Obituary in the press, with text to attach", type: "yesno", showIf: allowPrinted, category: "technical" },
  { id: "newspapers_choice", label: "Choice of newspaper(s):", showIf: { id: "press_necrology", equals: "yes", category: "technical" }, category: "technical" },
  { id: "announcement_card", label: "Announcement card, with text/photos to attach", type: "yesno", showIf: allowPrinted, category: "technical" },
  { id: "digital_announcements", label: "Online digital announcements, website or social media", type: "yesno", showIf: allowPrinted, category: "easy" },
  { id: "coffin_photo_enlargement", label: "Enlarged photo on the coffin, with photo to attach", type: "yesno", showIf: allowPrinted, category: "technical" },
  { id: "photo_formats", label: "Formats: A4 / A2 / A1 / A0 / other:", showIf: { id: "coffin_photo_enlargement", equals: "yes", category: "technical" }, category: "easy" },
  { id: "photos_location", label: "The photo(s) are located at:", showIf: { id: "coffin_photo_enlargement", equals: "yes", category: "technical" }, category: "technical" },
  { id: "obiit", label: "Obit, family coat of arms", type: "yesno", showIf: allowPrinted, category: "technical" },
  { id: "funeral_board", label: "Funeral board, collage, easel, artwork, etc.", type: "yesno", showIf: allowPrinted, category: "technical" },
  { id: "thanks", label: "Thank-you cards, with text/photos to attach", type: "yesno", showIf: allowPrinted, category: "technical" },
  { id: "printed_other", label: "Other printed material:", showIf: allowPrinted, category: "technical" }
];

export default function PrintedMaterials({ token }) {
  return (
    <QuestionPage
      pageId="printed-materials"
      title="Printed Materials"
      questions={questions}
      token={token}
    />
  );
}
