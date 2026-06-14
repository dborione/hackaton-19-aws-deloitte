import React, { useCallback, useEffect, useState } from "react";
import config from "../config";
import agLogo from "../../image/AG_Logo2024-CORPORATE-main-1.png";

import AccountSharing from "./pages/accountSharing";
import SharedInvitation from "./pages/sharedInvitation";
import ReceivedSharedAnswers from "./pages/receivedSharedAnswers";
import DocumentsPage from "./DocumentsPage";
import { getProgressForGroup, getProgressForPage } from "./utils/progress";

import Identity, { questions as identityQuestions } from "./pages/personal-administrative/identity";
import CurrentHome, { questions as currentHomeQuestions } from "./pages/personal-administrative/currentHome";
import LifeStory, { questions as lifeStoryQuestions } from "./pages/personal-administrative/lifeStory";
import BodyAndOrganDonation, { questions as bodyAndOrganDonationQuestions } from "./pages/personal-administrative/bodyAndOrganDonation";
import Notes, { questions as notesQuestions } from "./pages/personal-administrative/notes";

import BurialChoice, { questions as burialChoiceQuestions } from "./pages/funeral-wishes/burialChoice";
import CremationChoice, { questions as cremationChoiceQuestions } from "./pages/funeral-wishes/cremationChoice";
import CeremonyType, { questions as ceremonyTypeQuestions } from "./pages/funeral-wishes/ceremonyType";
import CoffinAndUrn, { questions as coffinAndUrnQuestions } from "./pages/funeral-wishes/coffinAndUrn";
import FuneralCare, { questions as funeralCareQuestions } from "./pages/funeral-wishes/funeralCare";
import Viewing, { questions as viewingQuestions } from "./pages/funeral-wishes/viewing";
import PrintedMaterials, { questions as printedMaterialsQuestions } from "./pages/funeral-wishes/printedMaterials";
import Souvenirs, { questions as souvenirsQuestions } from "./pages/funeral-wishes/souvenirs";
import Flowers, { questions as flowersQuestions } from "./pages/funeral-wishes/flowers";
import SymbolicGestures, { questions as symbolicGesturesQuestions } from "./pages/funeral-wishes/symbolicGestures";
import Vehicles, { questions as vehiclesQuestions } from "./pages/funeral-wishes/vehicles";
import Staff, { questions as staffQuestions } from "./pages/funeral-wishes/staff";
import Music, { questions as musicQuestions } from "./pages/funeral-wishes/music";
import Texts, { questions as textsQuestions } from "./pages/funeral-wishes/texts";
import SlideshowReception, { questions as slideshowReceptionQuestions } from "./pages/funeral-wishes/slideshowReception";

import Financing, { questions as financingQuestions } from "./pages/financial-planning/financing";
import BankAgreement, { questions as bankAgreementQuestions } from "./pages/financial-planning/bankAgreement";
import Insurance, { questions as insuranceQuestions } from "./pages/financial-planning/insurance";
import SinglePayment, { questions as singlePaymentQuestions } from "./pages/financial-planning/singlePayment";

const styles = {
  nav: {
    background: "#fff",
    color: "#4f4f4f",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 30px 40px 0 rgba(212,217,232,.25)"
  },

  main: {
    maxWidth: 900,
    margin: "32px auto",
    padding: "0 16px"
  },

  logoButton: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },

  logo: {
    height: 46,
    width: "auto",
    display: "block"
  },

  btn: {
    background: "#fff",
    textTransform: "uppercase",
    fontFamily: '"Roboto Condensed", sans-serif',
    color: "#bd2430",
    padding: "8px 16px",
    borderRadius: 4,
    cursor: "pointer",
    border: "1px solid #bd2430",
    justifyContent: "center",
    whiteSpace: "nowrap",
  },

  header: {
    marginBottom: 24
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: 28,
    color: "#4f4f4f"
  },

  subtitle: {
    margin: 0,
    color: "#555",
    lineHeight: 1.5
  },

  sectionTitle: {
    margin: "32px 0 16px 0",
    color: "#4f4f4f"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16
  },

  card: {
    background: "#fff",
    border: "1px solid #bd2430",
    borderRadius: 8,
    padding: 20,
    cursor: "pointer"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8
  },

  cardTitle: {
    margin: 0,
    fontSize: 22,
    color: "#4f4f4f"
  },

  cardDescription: {
    margin: 0,
    color: "#555",
    lineHeight: 1.5
  },

  progressBadge: {
    background: "#4f4f4f",
    color: "#fff",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 13,
    fontWeight: "bold",
    whiteSpace: "nowrap"
  },

  progressDetails: {
    marginTop: 10,
    fontSize: 13,
    color: "#666"
  },

  backBtn: {
    background: "transparent",
    color: "#bd2430",
    border: "1px solid #bd2430",
    padding: "8px 14px",
    borderRadius: 4,
    cursor: "pointer",
    marginBottom: 24
  },

  emptyBox: {
    background: "#fff",
    border: "1px dashed #aaa",
    borderRadius: 8,
    padding: 32,
    textAlign: "center",
    color: "#666"
  }
};

const pageComponents = {
  identity: Identity,
  "current-home": CurrentHome,
  "life-story": LifeStory,
  "body-and-organ-donation": BodyAndOrganDonation,
  notes: Notes,

  "burial-choice": BurialChoice,
  "cremation-choice": CremationChoice,
  "ceremony-type": CeremonyType,
  "coffin-and-urn": CoffinAndUrn,
  "funeral-care": FuneralCare,
  viewing: Viewing,
  "printed-materials": PrintedMaterials,
  souvenirs: Souvenirs,
  flowers: Flowers,
  "symbolic-gestures": SymbolicGestures,
  vehicles: Vehicles,
  staff: Staff,
  music: Music,
  texts: Texts,
  "slideshow-reception": SlideshowReception,

  financing: Financing,
  "bank-agreement": BankAgreement,
  insurance: Insurance,
  "single-payment": SinglePayment
};

const pageQuestions = {
  identity: identityQuestions,
  "current-home": currentHomeQuestions,
  "life-story": lifeStoryQuestions,
  "body-and-organ-donation": bodyAndOrganDonationQuestions,
  notes: notesQuestions,

  "burial-choice": burialChoiceQuestions,
  "cremation-choice": cremationChoiceQuestions,
  "ceremony-type": ceremonyTypeQuestions,
  "coffin-and-urn": coffinAndUrnQuestions,
  "funeral-care": funeralCareQuestions,
  viewing: viewingQuestions,
  "printed-materials": printedMaterialsQuestions,
  souvenirs: souvenirsQuestions,
  flowers: flowersQuestions,
  "symbolic-gestures": symbolicGesturesQuestions,
  vehicles: vehiclesQuestions,
  staff: staffQuestions,
  music: musicQuestions,
  texts: textsQuestions,
  "slideshow-reception": slideshowReceptionQuestions,

  financing: financingQuestions,
  "bank-agreement": bankAgreementQuestions,
  insurance: insuranceQuestions,
  "single-payment": singlePaymentQuestions
};

const dashboardCategories = [
  {
    id: "personal-administrative",
    title: "Personal and Administrative",
    description: "Identity, contact details, life story, donation choices and general notes.",
    subcategories: [
      { id: "identity", title: "Identity", description: "Civil status, names, birth information, national register number and emergency contacts." },
      { id: "current-home", title: "Current Home", description: "Current address, postal code, locality, phone number and email." },
      { id: "life-story", title: "Life Story", description: "Family history, professional path, distinctions, passions, life motto and memories." },
      { id: "body-and-organ-donation", title: "Body and Organ Donation", description: "Body donation to science, university information, document location and organ donation." },
      { id: "notes", title: "Notes", description: "Free notes and additional wishes." }
    ]
  },

  {
    id: "funeral-wishes",
    title: "Funeral Wishes",
    description: "Choices about burial, cremation, ceremony, coffin, urn, care, visits and personalization.",
    subcategories: [
      { id: "burial-choice", title: "Burial Choice", description: "Burial choice, cemetery, concession, vault and new concession wishes." },
      { id: "cremation-choice", title: "Cremation Choice", description: "Crematorium, destination of ashes, urn burial, scattering and ashes division." },
      { id: "ceremony-type", title: "Ceremony Type", description: "Civil or religious ceremony, place, privacy and clothing theme." },
      { id: "coffin-and-urn", title: "Coffin and Urn", description: "Coffin tint, shape, type, lining, decoration, philosophical signs and urn choice." },
      { id: "funeral-care", title: "Funeral Care", description: "Presentation care, conservation care, clothing and care preferences." },
      { id: "viewing", title: "Viewing", description: "Visits, objects in or on the coffin, presentation room decoration and viewing place." },
      { id: "printed-materials", title: "Printed Materials", description: "Necrology, announcement cards, online announcements, photos, obit and thanks." },
      { id: "souvenirs", title: "Souvenirs", description: "Cards, candles, biography, bookmarks, flower seeds, personalized bottle and tea." },
      { id: "flowers", title: "Flowers", description: "Floral compositions, preferred flowers, donations and no-flowers request." },
      { id: "symbolic-gestures", title: "Symbolic Gestures", description: "Religious rites, butterflies, origami, light rite, message box and tree planting." },
      { id: "vehicles", title: "Vehicles", description: "Hearse, funeral van, other vehicle and family choice." },
      { id: "staff", title: "Staff", description: "Master of ceremony, celebrant and coffin bearers." },
      { id: "music", title: "Music", description: "Musical accompaniment, choir, musicians, soloist or no music." },
      { id: "texts", title: "Texts", description: "Significant readings and final audio or video message." },
      { id: "slideshow-reception", title: "Slideshow and Reception", description: "Photo slideshow, personal recipe, favorite treats, reception place and reception choice." }
    ]
  },

  {
    id: "financial-planning",
    title: "Financial Planning",
    description: "Registration, bank agreement, insurance and single-payment preparation.",
    subcategories: [
      { id: "financing", title: "Financing", description: "Registration of last wishes and bank agreement for funeral costs." },
      { id: "bank-agreement", title: "Bank Agreement", description: "Bank and bank agreement reference." },
      { id: "insurance", title: "Insurance", description: "Funeral insurance, life insurance, company, policy number, broker and address." },
      { id: "single-payment", title: "Single Payment", description: "Single payment under conditions and amount/payment date." }
    ]
  }
];

function getShareTokenFromUrl() {
  return new URLSearchParams(window.location.search).get("shareToken");
}

export default function Dashboard({ token, onLogout, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [answersByPage, setAnswersByPage] = useState({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isAccountSharingOpen, setIsAccountSharingOpen] = useState(false);
  const [isReceivedAnswersOpen, setIsReceivedAnswersOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [shareToken, setShareToken] = useState(getShareTokenFromUrl());
  const [selectedSharedInviteToken, setSelectedSharedInviteToken] = useState(null);
  const [sharedInvitations, setSharedInvitations] = useState([]);

  const activeSharedToken = shareToken || selectedSharedInviteToken;

  const loadProgress = useCallback(async () => {
    if (!token) return;

    setIsLoadingProgress(true);

    try {
      const res = await fetch(`${config.apiUrl}/data/answers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setAnswersByPage(data.answersByPage || {});
    } catch (err) {
      console.error(err);
      setAnswersByPage({});
    }

    setIsLoadingProgress(false);
  }, [token]);

  const loadSharedInvitations = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${config.apiUrl}/sharing/my-invitations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setSharedInvitations(data.invitations || []);
    } catch (err) {
      console.error(err);
      setSharedInvitations([]);
    }
  }, [token]);

  useEffect(() => {
    loadProgress();
    loadSharedInvitations();
  }, [loadProgress, loadSharedInvitations]);

  function clearShareTokenFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("shareToken");
    window.history.replaceState({}, "", url.toString());
    setShareToken(null);
  }

  function goHomeDashboard() {
    clearShareTokenFromUrl();
    setSelectedSharedInviteToken(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setIsAccountSharingOpen(false);
    setIsReceivedAnswersOpen(false);
    setIsDocumentsOpen(false);

    loadProgress();
    loadSharedInvitations();

    if (onNavigate) {
      onNavigate("dashboard");
    }
  }

  function openAccountSharing() {
    clearShareTokenFromUrl();
    setSelectedSharedInviteToken(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setIsReceivedAnswersOpen(false);
    setIsDocumentsOpen(false);
    setIsAccountSharingOpen(true);
  }

  function openReceivedAnswers() {
    clearShareTokenFromUrl();
    setSelectedSharedInviteToken(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setIsAccountSharingOpen(false);
    setIsDocumentsOpen(false);
    setIsReceivedAnswersOpen(true);
  }

  function openDocuments() {
    clearShareTokenFromUrl();
    setSelectedSharedInviteToken(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setIsAccountSharingOpen(false);
    setIsReceivedAnswersOpen(false);
    setIsDocumentsOpen(true);
  }

  function openSharedInvitation(inviteToken) {
    clearShareTokenFromUrl();
    setIsAccountSharingOpen(false);
    setIsReceivedAnswersOpen(false);
    setIsDocumentsOpen(false);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSharedInviteToken(inviteToken);
  }

  function openCategory(category) {
    clearShareTokenFromUrl();
    setSelectedSharedInviteToken(null);
    setIsAccountSharingOpen(false);
    setIsReceivedAnswersOpen(false);
    setIsDocumentsOpen(false);
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  }

  function openSubcategory(subcategory) {
    clearShareTokenFromUrl();
    setSelectedSharedInviteToken(null);
    setIsAccountSharingOpen(false);
    setIsReceivedAnswersOpen(false);
    setIsDocumentsOpen(false);
    setSelectedSubcategory(subcategory);
  }

  function goBack() {
    if (activeSharedToken) {
      clearShareTokenFromUrl();
      setSelectedSharedInviteToken(null);
      loadSharedInvitations();
      return;
    }

    if (isAccountSharingOpen) {
      setIsAccountSharingOpen(false);
      loadProgress();
      loadSharedInvitations();
      return;
    }

    if (isReceivedAnswersOpen) {
      setIsReceivedAnswersOpen(false);
      loadProgress();
      loadSharedInvitations();
      return;
    }

    if (isDocumentsOpen) {
      setIsDocumentsOpen(false);
      loadProgress();
      loadSharedInvitations();
      return;
    }

    if (selectedSubcategory) {
      setSelectedSubcategory(null);
      loadProgress();
      return;
    }

    if (selectedCategory) {
      setSelectedCategory(null);
      loadProgress();
    }
  }

  function getSubcategoryProgress(subcategory) {
    return getProgressForPage(
      pageQuestions[subcategory.id] || [],
      answersByPage[subcategory.id] || {}
    );
  }

  function getCategoryProgress(category) {
    return getProgressForGroup(
      category.subcategories.map((subcategory) => ({
        questions: pageQuestions[subcategory.id] || [],
        answers: answersByPage[subcategory.id] || {}
      }))
    );
  }

  function renderProgress(progress) {
    return (
      <div>
        <span className="progress-badge" style={styles.progressBadge}>
          {progress.percent}%
        </span>

        <p style={styles.progressDetails}>
          {progress.answered}/{progress.total}
        </p>
      </div>
    );
  }

  const PageComponent = selectedSubcategory
    ? pageComponents[selectedSubcategory.id]
    : null;

  return (
    <>
      <style>
        {`
          .nav-brand {
            transition: color 160ms ease;
          }

          .nav-brand:hover {
            color: #bd2430 !important;
          }

          .nav-action-btn {
            transition:
              background-color 160ms ease,
              color 160ms ease,
              border-color 160ms ease;
          }

          .nav-action-btn:hover {
            background-color: #bd2430 !important;
            color: #fff !important;
            border-color: #bd2430 !important;
          }
        `}
      </style>

      <style>
        {`
          .back-action-btn {
            transition:
              background-color 160ms ease,
              color 160ms ease,
              border-color 160ms ease;
          }

          .back-action-btn:hover {
            background-color: #bd2430 !important;
            color: #fff !important;
            border-color: #bd2430 !important;
          }

          .dashboard-card h2,
          .dashboard-card p {
            transition: color 160ms ease;
          }

          .dashboard-card:hover h2,
          .dashboard-card:hover p {
            color: #bd2430 !important;
          }

          .dashboard-card:hover .progress-badge {
            color: #fff !important;
          }
        `}
      </style>

      <nav style={styles.nav}>
        <button
          className="nav-brand"
          style={styles.logoButton}
          onClick={goHomeDashboard}
          aria-label="Go to dashboard"
        >
          <img
            src={agLogo}
            alt="A&G Funerals"
            style={styles.logo}
          />
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="nav-action-btn" style={styles.btn} onClick={openAccountSharing}>
            Account sharing
          </button>

          <button className="nav-action-btn" style={styles.btn} onClick={openReceivedAnswers}>
            Received answers
          </button>

          <button
            className="nav-action-btn"
            style={styles.btn}
            onClick={openDocuments}
          >
            Documents
          </button>

          <button className="nav-action-btn" style={styles.btn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main style={styles.main}>


        {activeSharedToken && (
          <>
            <button className="back-action-btn" style={styles.backBtn} onClick={goBack}>
              ← Back to dashboard
            </button>

            <section style={styles.header}>
              <h1 style={styles.title}>Shared Invitation</h1>
              <p style={styles.subtitle}>
                This is a separate invited instance. You only see the fields
                that were shared with you.
              </p>
            </section>

            <div style={styles.emptyBox}>
              <SharedInvitation
                token={token}
                inviteToken={activeSharedToken}
                onClose={goBack}
                onSaved={loadSharedInvitations}
              />
            </div>
          </>
        )}

        {!activeSharedToken && isReceivedAnswersOpen && (
          <>
            <button className="back-action-btn" style={styles.backBtn} onClick={goBack}>
              ← Back to dashboard
            </button>

            <section style={styles.header}>
              <h1 style={styles.title}>Received shared answers</h1>
              <p style={styles.subtitle}>
                Review the answers submitted by people you invited.
              </p>
            </section>

            <div style={styles.emptyBox}>
              <ReceivedSharedAnswers token={token} />
            </div>
          </>
        )}

        {!activeSharedToken && !isReceivedAnswersOpen && isAccountSharingOpen && (
          <>
            <button className="back-action-btn" style={styles.backBtn} onClick={goBack}>
              ← Back to dashboard
            </button>

            <section style={styles.header}>
              <h1 style={styles.title}>Account Sharing</h1>
              <p style={styles.subtitle}>
                Create a private link to let someone help fill only selected
                fields. The recipient will only see the fields you choose.
              </p>
            </section>

            <div style={styles.emptyBox}>
              <AccountSharing
                token={token}
                dashboardCategories={dashboardCategories}
                pageQuestions={pageQuestions}
              />
            </div>
          </>
        )}

        {!activeSharedToken && !isReceivedAnswersOpen && !isAccountSharingOpen && isDocumentsOpen && (
          <>
            <button className="back-action-btn" style={styles.backBtn} onClick={goBack}>
              ← Back to dashboard
            </button>

            <section style={styles.header}>
              <h1 style={styles.title}>Documents</h1>
              <p style={styles.subtitle}>
                Upload documents to extract information automatically or view processed documents.
              </p>
            </section>

            <DocumentsPage token={token} />
          </>
        )}

        {!activeSharedToken && !isReceivedAnswersOpen && !isAccountSharingOpen && !isDocumentsOpen && !selectedCategory && !selectedSubcategory && (
          <>
            <section style={styles.header}>
              <h1 style={styles.title}>A
                <span style={{ color: "#bd2430" }}>&</span>
                G Funeral Dashboard</h1>
              <p style={styles.subtitle}>
                Choose your own instance, or open an invited instance where
                someone shared fields with you.
              </p>
            </section>

            <h2 style={styles.sectionTitle}>My own final wishes</h2>

            <section style={styles.grid}>
              {dashboardCategories.map((category) => {
                const progress = getCategoryProgress(category);

                return (
                  <article
                    key={category.id}
                    className="dashboard-card"
                    style={styles.card}
                    onClick={() => openCategory(category)}
                  >
                    <div style={styles.cardHeader}>
                      <h2 style={styles.cardTitle}>{category.title}</h2>
                      {renderProgress(progress)}
                    </div>

                    <p style={styles.cardDescription}>
                      {category.description}
                    </p>
                  </article>
                );
              })}
            </section>

            <h2 style={styles.sectionTitle}>Invitations I am helping with</h2>

            {sharedInvitations.length === 0 && (
              <p style={styles.subtitle}>
                No invited instance linked to your account yet.
              </p>
            )}

            {sharedInvitations.length > 0 && (
              <section style={styles.grid}>
                {sharedInvitations.map((invitation) => (
                  <article
                    key={invitation.invitationId}
                    className="dashboard-card"
                    style={styles.card}
                    onClick={() => openSharedInvitation(invitation.inviteToken)}
                  >
                    <div style={styles.cardHeader}>
                      <h2 style={styles.cardTitle}>
                        Shared instance
                      </h2>

                      {renderProgress({
                        percent: invitation.percent,
                        answered: invitation.answered,
                        total: invitation.total
                      })}
                    </div>

                    <p style={styles.cardDescription}>
                      {invitation.recipientLabel
                        ? `Label: ${invitation.recipientLabel}`
                        : "You were invited to complete selected fields."}
                    </p>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {!activeSharedToken && !isReceivedAnswersOpen && !isAccountSharingOpen && !isDocumentsOpen && selectedCategory && !selectedSubcategory && (
          <>
            <button className="back-action-btn" style={styles.backBtn} onClick={goBack}>
              ← Back to dashboard
            </button>

            <section style={styles.header}>
              <h1 style={styles.title}>{selectedCategory.title}</h1>
              <p style={styles.subtitle}>
                {selectedCategory.description}
              </p>
            </section>

            <section style={styles.grid}>
              {selectedCategory.subcategories.map((subcategory) => {
                const progress = getSubcategoryProgress(subcategory);

                return (
                  <article
                    key={subcategory.id}
                    className="dashboard-card"
                    style={styles.card}
                    onClick={() => openSubcategory(subcategory)}
                  >
                    <div style={styles.cardHeader}>
                      <h2 style={styles.cardTitle}>{subcategory.title}</h2>
                      {renderProgress(progress)}
                    </div>

                    <p style={styles.cardDescription}>
                      {subcategory.description}
                    </p>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {!activeSharedToken && !isReceivedAnswersOpen && !isAccountSharingOpen && !isDocumentsOpen && selectedCategory && selectedSubcategory && (
          <>
            <button className="back-action-btn" style={styles.backBtn} onClick={goBack}>
              ← Back to {selectedCategory.title}
            </button>

            <section style={styles.header}>
              <h1 style={styles.title}>{selectedSubcategory.title}</h1>
              <p style={styles.subtitle}>
                {selectedSubcategory.description}
              </p>
            </section>

            <div style={styles.emptyBox}>
              {PageComponent ? (
                <PageComponent token={token} />
              ) : (
                <p>Page not found.</p>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
