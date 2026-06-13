import QuestionPage from "../questionPage";

const chooseDetails = { id: "let_relatives_choose", equals: "no" };
const chooseUrn = { id: "let_relatives_choose_urn", equals: "no" };

export const questions = [
  { id: "let_relatives_choose", label: "I let my relatives choose", type: "yesno", category: "easy" },
  { id: "coffin_tint_light", label: "Light-colored coffin", type: "yesno", showIf: chooseDetails, category: "easy" },
  { id: "coffin_tint_dark", label: "Dark-colored coffin", type: "yesno", showIf: chooseDetails, category: "easy" },
  { id: "coffin_tint_white", label: "White coffin", type: "yesno", showIf: chooseDetails, category: "easy" },
  { id: "coffin_tint_other", label: "Other coffin color:", showIf: chooseDetails, category: "easy" },
  { id: "coffin_shape_traditional", label: "Traditional shape", type: "yesno", showIf: chooseDetails, category: "easy" },
  { id: "coffin_shape_modern", label: "Modern shape", type: "yesno", showIf: chooseDetails, category: "easy" },
  { id: "coffin_shape_other", label: "Other shape:", showIf: chooseDetails, category: "easy" },
  { id: "coffin_type_pefc", label: "PEFC-certified solid wood", type: "yesno", showIf: chooseDetails, category: "technical" },
  { id: "coffin_type_mdf", label: "Simple coffin (MDF)", type: "yesno", showIf: chooseDetails, category: "technical" },
  { id: "coffin_type_other", label: "Other coffin type:", showIf: chooseDetails, category: "easy" },
  { id: "coffin_lining", label: "Lining, with or without lace, satin, cotton, linen, color, etc.:", type: "textarea", showIf: chooseDetails, category: "easy" },
  { id: "coffin_cover_floral", label: "Floral arrangement on the coffin", type: "yesno", showIf: chooseDetails, category: "easy" },
  { id: "coffin_cover_other", label: "Other coffin covering:", showIf: chooseDetails, category: "easy" },
  { id: "philosophical_religious_symbol", label: "Religious symbol, specify which one:", showIf: chooseDetails, category: "easy" },
  { id: "philosophical_flag", label: "Flag, specify which one:", showIf: chooseDetails, category: "easy" },
  { id: "philosophical_other", label: "Other philosophical or religious sign:", showIf: chooseDetails, category: "easy" },
  { id: "let_relatives_choose_urn", label: "I let my relatives choose the urn", type: "yesno", showIf: chooseDetails, category: "easy" },
  { id: "urn_pefc", label: "PEFC-certified solid wood urn", type: "yesno", showIf: [chooseDetails, chooseUrn], category: "technical" },
  { id: "urn_biodegradable", label: "Biodegradable urn", type: "yesno", showIf: [chooseDetails, chooseUrn], category: "technical" },
  { id: "urn_porcelain_ceramic", label: "Porcelain / ceramic urn", type: "yesno", showIf: [chooseDetails, chooseUrn], category: "technical" },
  { id: "urn_metallic", label: "Metal urn", type: "yesno", showIf: [chooseDetails, chooseUrn], category: "technical" },
  { id: "urn_other", label: "Other urn type:", showIf: [chooseDetails, chooseUrn], category: "easy" },
  { id: "personalization_other_wishes", label: "Personalization and other wishes: shroud, decoration, lettering, engraving, painted mural, floral outline, etc.", type: "textarea", showIf: chooseDetails, category: "easy" }
];

export default function CoffinAndUrn({ token }) {
  return (
    <QuestionPage
      pageId="coffin-and-urn"
      title="Coffin and/or Urn Choice"
      questions={questions}
      token={token}
    />
  );
}
