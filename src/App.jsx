import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BatteryMedium,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  Home,
  KeyRound,
  Landmark,
  Lock,
  Minus,
  Play,
  Search,
  Signal,
  Sparkles,
  Wifi,
  X
} from "lucide-react";
import {
  APPS,
  CALENDAR,
  CASE,
  CASE_LIBRARY,
  CLUES,
  CONTACTS,
  DEDUCTIONS,
  HINTS,
  HISTORY,
  MAILS,
  NOTES,
  PHOTOS,
  ROUTE,
  THREADS,
  TRANSACTIONS
} from "./caseData.js";

const STORAGE_KEY = "mystery-phone-progress-v2";
const ROUTE_SOLUTION = ["Crescent Cafe", "Platform Coffee", "Riverton Central ATM", "Riverton Central Platform 6"];
const TIMELINE_SOLUTION = ["calendar-platform", "bank-atm", "photo-scarf", "browser-train"];

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.caseId === CASE.id) return saved;
  } catch {
    return null;
  }
  return null;
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function clean(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  function navigate(nextPath) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (path !== "/play") return <LandingPage onPlay={() => navigate("/play")} />;
  return <GameApp onLanding={() => navigate("/")} />;
}

function LandingPage({ onPlay }) {
  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Browser mystery game</p>
          <h1>Mystery Phone</h1>
          <p>
            Search a missing person's phone, cross-reference apps, unlock hidden evidence, rebuild timelines,
            and solve what really happened.
          </p>
          <div className="landing-actions">
            <button type="button" className="landing-play" onClick={onPlay}>
              <Play size={19} />
              Play case one
            </button>
            <a href="#how-it-works">How it works</a>
          </div>
        </div>
        <div className="landing-phone" aria-hidden="true">
          <div className="mini-phone">
            <div className="mini-island" />
            <div className="mini-screen">
              <span>Case 001</span>
              <strong>{CASE.title}</strong>
              <p>Situation, evidence, route, deduction.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="how-it-works">
        <h2>How It Works</h2>
        <div className="landing-steps">
          <article>
            <Search size={22} />
            <h3>Investigate Apps</h3>
            <p>Messages, photos, notes, wallet records, maps, browser history, and mail all contain partial truths.</p>
          </article>
          <article>
            <KeyRound size={22} />
            <h3>Solve Puzzles</h3>
            <p>Use names, times, locations, and codes from one app to unlock evidence in another.</p>
          </article>
          <article>
            <Landmark size={22} />
            <h3>Make The Case</h3>
            <p>Rebuild the final timeline, test theories against evidence, and submit the final deduction.</p>
          </article>
        </div>
      </section>

      <section className="landing-section case-library-preview">
        <h2>Case Library</h2>
        <div className="case-library-grid">
          {CASE_LIBRARY.map((item) => (
            <article className="library-card" key={item.id}>
              <div className="library-card-top">
                <span>{item.status}</span>
                <b>{"●".repeat(item.difficultyLevel)}</b>
              </div>
              <h3>{item.title}</h3>
              <p>{item.hook}</p>
              <div className="library-meta">
                <span>{item.difficulty}</span>
                <span>{item.solvedBy.toLocaleString()} solved</span>
                <span>{item.time}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function GameApp({ onLanding }) {
  const saved = useMemo(loadProgress, []);
  const [unlocked, setUnlocked] = useState(saved?.unlocked ?? false);
  const [passcode, setPasscode] = useState("");
  const [activeApp, setActiveApp] = useState(saved?.activeApp ?? "home");
  const [view, setView] = useState(saved?.view ?? null);
  const [clues, setClues] = useState(new Set(saved?.clues ?? []));
  const [puzzles, setPuzzles] = useState(saved?.puzzles ?? {});
  const [hintsUsed, setHintsUsed] = useState(saved?.hintsUsed ?? 0);
  const [showHints, setShowHints] = useState(false);
  const [deduction, setDeduction] = useState(saved?.deduction ?? null);
  const [mistakes, setMistakes] = useState(saved?.mistakes ?? 0);
  const [toast, setToast] = useState("");

  const score = Math.max(0, CASE.startingScore - hintsUsed * CASE.hintCost - mistakes * 6);
  const requiredFound = CASE.requiredClues.filter((id) => clues.has(id)).length;
  const puzzleCount = ["sender", "familyLie", "panicNote", "hiddenAlbum", "calendar", "wallet", "mail", "browser", "route", "timeline"].filter(
    (id) => puzzles[id]
  ).length;
  const solved = deduction === CASE.solution;

  function persist(next = {}) {
    saveProgress({
      caseId: CASE.id,
      unlocked,
      activeApp,
      view,
      clues: Array.from(clues),
      puzzles,
      hintsUsed,
      deduction,
      mistakes,
      ...next
    });
  }

  function flash(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function recordEvidence(ids, message) {
    const nextClues = new Set(clues);
    ids.filter(Boolean).forEach((id) => nextClues.add(id));
    setClues(nextClues);
    persist({ clues: Array.from(nextClues) });
    flash(message ?? "Evidence added");
  }

  function solvePuzzle(id, ids = [], message = "Puzzle solved") {
    if (puzzles[id]) return;
    const nextPuzzles = { ...puzzles, [id]: true };
    const nextClues = new Set(clues);
    ids.filter(Boolean).forEach((clueId) => nextClues.add(clueId));
    setPuzzles(nextPuzzles);
    setClues(nextClues);
    persist({ puzzles: nextPuzzles, clues: Array.from(nextClues) });
    flash(message);
  }

  function miss(message = "That does not fit the evidence") {
    const nextMistakes = mistakes + 1;
    setMistakes(nextMistakes);
    persist({ mistakes: nextMistakes });
    flash(message);
  }

  function openApp(id) {
    setActiveApp(id);
    setView(null);
    persist({ activeApp: id, view: null });
  }

  function goHome() {
    setActiveApp("home");
    setView(null);
    persist({ activeApp: "home", view: null });
  }

  function useHint() {
    if (hintsUsed >= HINTS.length) return;
    const next = hintsUsed + 1;
    setHintsUsed(next);
    setShowHints(true);
    persist({ hintsUsed: next });
  }

  function tryUnlock(value) {
    const next = (passcode + value).slice(0, 4);
    setPasscode(next);
    if (next === CASE.passcode) {
      setUnlocked(true);
      setPasscode("");
      flash("Unlocked");
      persist({ unlocked: true });
    } else if (next.length === 4) {
      miss("Wrong passcode");
      window.setTimeout(() => setPasscode(""), 260);
    }
  }

  function chooseDeduction(id) {
    if (!puzzles.timeline || requiredFound < CASE.requiredClues.length) {
      miss("Build the timeline and collect the key evidence first");
      return;
    }
    setDeduction(id);
    persist({ deduction: id });
    if (id === CASE.solution) flash("Case solved");
    else miss("That conclusion leaves contradictions");
  }

  return (
    <main className="stage">
      <section className="briefing" aria-label="Case briefing">
        <div>
          <p className="eyebrow">Case 001</p>
          <h1>{CASE.title}</h1>
          <p>{CASE.objective}</p>
        </div>
        <CaseInstruction compact />
        <div className="briefing-grid">
          <Metric label="Owner" value={CASE.owner} />
          <Metric label="Score" value={`${score}`} />
          <Metric label="Evidence" value={`${clues.size}/${Object.keys(CLUES).length}`} />
          <Metric label="Puzzles" value={`${puzzleCount}/10`} />
        </div>
        <div className="briefing-actions">
          <button className="hint-button secondary" type="button" onClick={onLanding}>
            <Home size={18} />
            Landing
          </button>
          <button className="hint-button" type="button" onClick={() => setShowHints(true)}>
            <CircleHelp size={18} />
            Hints
          </button>
          <button className="hint-button secondary" type="button" onClick={() => openApp("case")}>
            <Eye size={18} />
            Case Board
          </button>
        </div>
      </section>

      <section className="phone" aria-label={`${CASE.owner}'s phone`}>
        <div className="island" />
        <StatusBar />
        {!unlocked ? (
          <LockScreen passcode={passcode} onDigit={tryUnlock} />
        ) : (
          <PhoneScreen
            activeApp={activeApp}
            view={view}
            setView={(next) => {
              setView(next);
              persist({ view: next });
            }}
            openApp={openApp}
            goHome={goHome}
            recordEvidence={recordEvidence}
            solvePuzzle={solvePuzzle}
            miss={miss}
            clues={clues}
            puzzles={puzzles}
            score={score}
            requiredFound={requiredFound}
            chooseDeduction={chooseDeduction}
            deduction={deduction}
            solved={solved}
          />
        )}
        {toast && <div className="toast">{toast}</div>}
      </section>

      {showHints && (
        <HintPanel hintsUsed={hintsUsed} useHint={useHint} close={() => setShowHints(false)} score={score} />
      )}
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="status-bar">
      <span>{CASE.date}</span>
      <div className="status-icons">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryMedium size={17} />
      </div>
    </div>
  );
}

function LockScreen({ passcode, onDigit }) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];
  return (
    <div className="lock-screen">
      <div className="lock-copy">
        <Lock size={30} />
        <p className="phone-time">22:47</p>
        <p className="phone-date">Friday, June 19</p>
      </div>
      <div className="lock-card">
        <p>Enter Passcode</p>
        <div className="dots" aria-label={`${passcode.length} digits entered`}>
          {[0, 1, 2, 3].map((slot) => (
            <span key={slot} className={slot < passcode.length ? "filled" : ""} />
          ))}
        </div>
        <p className="tiny">{CASE.lockClue}</p>
      </div>
      <div className="keypad">
        {digits.map((digit, index) =>
          digit ? (
            <button
              key={digit}
              className="key"
              type="button"
              onClick={() => (digit === "back" ? null : onDigit(digit))}
              aria-label={digit === "back" ? "Backspace" : `Digit ${digit}`}
              disabled={digit === "back"}
            >
              {digit === "back" ? <Minus size={20} /> : digit}
            </button>
          ) : (
            <span key={`blank-${index}`} />
          )
        )}
      </div>
    </div>
  );
}

function PhoneScreen(props) {
  if (props.activeApp === "home") return <HomeScreen openApp={props.openApp} clues={props.clues} puzzles={props.puzzles} />;
  return <AppWindow {...props} />;
}

function HomeScreen({ openApp, clues, puzzles }) {
  const leads = getActiveLeads(puzzles, clues);
  return (
    <div className="home-screen">
      <div className="home-top">
        <div>
          <p className="owner">{CASE.owner}</p>
          <p className="mission">{Object.keys(puzzles).length} puzzles solved · {clues.size} evidence items</p>
        </div>
      </div>
      <section className="phone-alerts">
        <div className="phone-alerts-title">
          <span>Active leads</span>
          <button type="button" onClick={() => openApp("library")}>Library</button>
        </div>
        {leads.map((lead) => (
          <button type="button" className="phone-alert" key={lead.title} onClick={() => openApp(lead.app)}>
            <strong>{lead.title}</strong>
            <span>{lead.detail}</span>
          </button>
        ))}
      </section>
      <div className="app-grid">
        {APPS.map((app) => {
          const Icon = app.icon;
          return (
            <button className="app-icon" type="button" key={app.id} onClick={() => openApp(app.id)}>
              <span className={cx("icon-tile", app.tone)}>
                <Icon size={25} strokeWidth={2.2} />
              </span>
              <span>{app.label}</span>
            </button>
          );
        })}
      </div>
      <div className="dock">
        {["messages", "browser", "maps", "case"].map((id) => {
          const app = APPS.find((item) => item.id === id);
          const Icon = app.icon;
          return (
            <button type="button" key={id} onClick={() => openApp(id)} aria-label={app.label}>
              <Icon size={22} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppWindow(props) {
  const { activeApp, view, setView, goHome } = props;
  const app = APPS.find((item) => item.id === activeApp);
  const title = app?.label ?? "App";
  return (
    <div className="app-window">
      <div className="app-header">
        <button type="button" className="nav-button" onClick={view ? () => setView(null) : goHome} aria-label={view ? "Back" : "Home"}>
          {view ? <ArrowLeft size={19} /> : <Home size={18} />}
        </button>
        <strong>{title}</strong>
        <button type="button" className="nav-button" onClick={goHome} aria-label="Home">
          <Home size={18} />
        </button>
      </div>
      <div className="app-content">
        {activeApp === "messages" && <Messages {...props} />}
        {activeApp === "library" && <CaseLibraryApp openApp={props.openApp} />}
        {activeApp === "photos" && <Photos {...props} />}
        {activeApp === "notes" && <Notes {...props} />}
        {activeApp === "calendar" && <Calendar {...props} />}
        {activeApp === "wallet" && <Wallet {...props} />}
        {activeApp === "mail" && <MailApp {...props} />}
        {activeApp === "contacts" && <Contacts />}
        {activeApp === "browser" && <Browser {...props} />}
        {activeApp === "maps" && <Maps {...props} />}
        {activeApp === "settings" && <SettingsApp />}
        {activeApp === "case" && <CaseApp {...props} />}
      </div>
    </div>
  );
}

function getActiveLeads(puzzles, clues) {
  if (!puzzles.sender) {
    return [
      { app: "messages", title: "Unknown sender", detail: "Find who N. is before trusting the Platform 6 message." },
      { app: "contacts", title: "Contact cross-check", detail: "One saved contact explains the hidden initial." }
    ];
  }
  if (!puzzles.panicNote) {
    return [
      { app: "notes", title: "Locked note", detail: "The recovery answer is hidden in a conversation." },
      { app: "messages", title: "Trust conflict", detail: "Rowan's thread explains why Lena changed plans." }
    ];
  }
  if (!puzzles.hiddenAlbum) {
    return [
      { app: "photos", title: "Recently Deleted", detail: "Combine locker and platform numbers to open the album." },
      { app: "calendar", title: "Hidden meeting", detail: "Decode the private appointment before finalizing the route." }
    ];
  }
  if (!puzzles.route || !puzzles.timeline) {
    return [
      { app: "maps", title: "Route reconstruction", detail: "Put Lena's last stops in timestamp order." },
      { app: "case", title: "Timeline board", detail: `${clues.size} evidence items logged. Test the order before accusing anyone.` }
    ];
  }
  return [
    { app: "case", title: "Ready for deduction", detail: "The contradictions are on the board. Choose what happened." }
  ];
}

function CaseLibraryApp({ openApp }) {
  return (
    <div className="library-app">
      <div className="library-intro">
        <span>Case archive</span>
        <strong>{CASE_LIBRARY.length} investigations</strong>
        <p>Pick a case, compare difficulty, and preview the investigation gimmicks before playing.</p>
      </div>
      {CASE_LIBRARY.map((item) => (
        <article className="library-card phone-card" key={item.id}>
          <div className="library-card-top">
            <span>{item.status}</span>
            <b>{"●".repeat(item.difficultyLevel)}</b>
          </div>
          <h3>{item.title}</h3>
          <p>{item.hook}</p>
          <div className="library-meta">
            <span>{item.difficulty}</span>
            <span>{item.solvedBy.toLocaleString()} solved</span>
            <span>{item.time}</span>
          </div>
          <div className="mechanic-tags">
            {item.mechanics.map((mechanic) => (
              <span key={mechanic}>{mechanic}</span>
            ))}
          </div>
          <p className="inspiration-note">{item.inspiration}</p>
          {item.status === "Playable" ? (
            <button type="button" className="full-button" onClick={() => openApp("case")}>
              Open case board
            </button>
          ) : (
            <button type="button" className="full-button muted" disabled>
              Prototype case
            </button>
          )}
        </article>
      ))}
    </div>
  );
}

function EvidencePill({ found }) {
  return <span className={cx("evidence-pill", found && "found")}>{found ? "Evidence logged" : "Unverified"}</span>;
}

function PuzzleCard({ title, children, solved }) {
  return (
    <section className={cx("puzzle-card", solved && "solved")}>
      <div className="puzzle-title">
        <KeyRound size={17} />
        <strong>{title}</strong>
        {solved && <Check size={17} />}
      </div>
      {children}
    </section>
  );
}

function Messages({ view, setView, solvePuzzle, miss, clues, puzzles }) {
  const [query, setQuery] = useState("");
  const [sender, setSender] = useState("");
  const [momAnswer, setMomAnswer] = useState("");
  const term = clean(query);
  const visibleThreads = THREADS.filter((thread) => {
    if (!term) return true;
    return clean(`${thread.name} ${thread.preview} ${thread.messages.map((message) => message.text).join(" ")}`).includes(term);
  });

  if (!view) {
    return (
      <div className="stack">
        <label className="input-row">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages: scarf, rowan, n..." />
        </label>
        <div className="list">
          {visibleThreads.map((thread) => (
            <button className="row" type="button" key={thread.id} onClick={() => setView(thread.id)}>
              <div className="avatar">{thread.name.slice(0, 1)}</div>
              <div>
                <strong>{thread.name}</strong>
                <span>{thread.preview}</span>
              </div>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const thread = THREADS.find((item) => item.id === view);
  return (
    <div className="thread">
      <p className="thread-title">{thread.name}</p>
      {thread.messages.map((message, index) => (
        <div key={`${thread.id}-${index}`} className={cx("bubble", message.from)}>
          <span>{message.text}</span>
          <small>{message.time}</small>
        </div>
      ))}
      {thread.id === "unknown" && (
        <PuzzleCard title="Identify the sender" solved={puzzles.sender}>
          <p>Cross-reference "N." with Contacts and Mail. Who is the anonymous sender?</p>
          <div className="answer-row">
            <input value={sender} onChange={(event) => setSender(event.target.value)} placeholder="Name" />
            <button
              type="button"
              onClick={() =>
                clean(sender).includes("noah")
                  ? solvePuzzle("sender", ["message-unknown"], "Sender identified: Noah K.")
                  : miss("That name does not match the N. references")
              }
            >
              Check
            </button>
          </div>
          <EvidencePill found={clues.has("message-unknown")} />
        </PuzzleCard>
      )}
      {thread.id === "mom" && (
        <PuzzleCard title="Spot the lie" solved={puzzles.familyLie}>
          <p>Lena cancelled dinner with a fake reason. What excuse did she give?</p>
          <div className="answer-row">
            <input value={momAnswer} onChange={(event) => setMomAnswer(event.target.value)} placeholder="Excuse" />
            <button
              type="button"
              onClick={() =>
                clean(momAnswer).includes("shift")
                  ? solvePuzzle("familyLie", ["message-mom"], "Cancelled dinner logged")
                  : miss("That is not the excuse in the family thread")
              }
            >
              Check
            </button>
          </div>
          <EvidencePill found={clues.has("message-mom")} />
        </PuzzleCard>
      )}
    </div>
  );
}

function Photos({ solvePuzzle, miss, clues, puzzles }) {
  const [albumCode, setAlbumCode] = useState("");
  const hiddenUnlocked = puzzles.hiddenAlbum;
  return (
    <div className="stack">
      <PuzzleCard title="Unlock Recently Deleted" solved={hiddenUnlocked}>
        <p>The hidden album asks for a 4-digit code. Lena wrote a locker number and the meeting platform elsewhere.</p>
        <div className="answer-row">
          <input value={albumCode} onChange={(event) => setAlbumCode(event.target.value)} inputMode="numeric" placeholder="Code" />
          <button
            type="button"
            onClick={() =>
              clean(albumCode) === "1806"
                ? solvePuzzle("hiddenAlbum", ["photo-scarf"], "Hidden album unlocked")
                : miss("The album code stays locked")
            }
          >
            Unlock
          </button>
        </div>
      </PuzzleCard>
      <div className="photo-grid">
        {PHOTOS.map((photo) => {
          const locked = photo.id === "photo-scarf" && !hiddenUnlocked;
          return (
            <article className={cx("photo-card", locked && "locked-photo")} key={photo.id}>
              {photo.src && !locked ? (
                <img src={photo.src} alt={photo.caption} />
              ) : (
                <div className={cx("generated-photo", photo.generated, locked && "blurred")}>
                  {locked ? <Lock size={24} /> : <Sparkles size={22} />}
                </div>
              )}
              <div>
                <strong>{locked ? "Recently Deleted" : photo.title}</strong>
                <span>{photo.time}</span>
                <p>{locked ? "Locked image. The thumbnail shows station lights and a red shape." : photo.caption}</p>
                {photo.id === "photo-scarf" && hiddenUnlocked && (
                  <div className="metadata-strip">
                    <span>EXIF 22:04</span>
                    <span>GPS: Platform 6</span>
                    <span>Flash off</span>
                  </div>
                )}
                {photo.id === "photo-scarf" && <EvidencePill found={clues.has("photo-scarf")} />}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Notes({ solvePuzzle, miss, clues, puzzles }) {
  const [answer, setAnswer] = useState("");
  return (
    <div className="stack">
      <PuzzleCard title="Open locked note" solved={puzzles.panicNote}>
        <p>The locked note uses the name of the person Lena no longer trusts as its recovery answer.</p>
        <div className="answer-row">
          <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Recovery answer" />
          <button
            type="button"
            onClick={() =>
              clean(answer).includes("rowan")
                ? solvePuzzle("panicNote", ["note-locker"], "Panic note unlocked")
                : miss("The note does not unlock")
            }
          >
            Open
          </button>
        </div>
      </PuzzleCard>
      <div className="list">
        {NOTES.map((note) => {
          const locked = note.id === "note-locker" && !puzzles.panicNote;
          return (
            <article className="note" key={note.id}>
              <span>{note.date}</span>
              <h3>{locked ? "Locked Note" : note.title}</h3>
              <p>{locked ? "Recovery answer required. Hint: read Rowan's conversation." : note.body}</p>
              {note.clueId && <EvidencePill found={clues.has(note.clueId)} />}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Calendar({ solvePuzzle, miss, clues, puzzles }) {
  const [choice, setChoice] = useState("");
  return (
    <div className="stack">
      <PuzzleCard title="Decode hidden calendar entry" solved={puzzles.calendar}>
        <p>The 21:30 event is hidden under an initial. Choose which contact the initial points to.</p>
        <div className="choice-grid">
          {["Rowan Vale", "Noah K.", "Max Ortiz"].map((name) => (
            <button
              type="button"
              className={cx(choice === name && "selected")}
              key={name}
              onClick={() => setChoice(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          className="full-button"
          type="button"
          onClick={() =>
            choice === "Noah K."
              ? solvePuzzle("calendar", ["calendar-platform"], "Calendar entry decoded")
              : miss("That contact does not explain the N. entry")
          }
        >
          Confirm match
        </button>
      </PuzzleCard>
      <div className="timeline">
        {CALENDAR.map((event) => {
          const hidden = event.clueId && !puzzles.calendar;
          return (
            <article className="event" key={`${event.time}-${event.title}`}>
              <time>{event.time}</time>
              <div>
                <strong>{hidden ? "Private appointment" : event.title}</strong>
                <span>{hidden ? "Title hidden until contact is matched" : event.meta}</span>
                {event.clueId && <EvidencePill found={clues.has(event.clueId)} />}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Wallet({ solvePuzzle, miss, clues, puzzles }) {
  const [selected, setSelected] = useState("");
  return (
    <div className="wallet">
      <div className="balance">
        <span>Available</span>
        <strong>42.60</strong>
      </div>
      <PuzzleCard title="Find the transaction that changes the timeline" solved={puzzles.wallet}>
        <p>Select the record proving Lena had cash after reaching Riverton Central.</p>
        <div className="transaction-picks">
          {TRANSACTIONS.map((tx) => (
            <button className={cx(selected === tx.id && "selected")} type="button" key={tx.id} onClick={() => setSelected(tx.id)}>
              {tx.time} · {tx.merchant}
            </button>
          ))}
        </div>
        <button
          className="full-button"
          type="button"
          onClick={() =>
            selected === "bank-atm"
              ? solvePuzzle("wallet", ["bank-atm"], "ATM withdrawal verified")
              : miss("That transaction does not prove the station cash withdrawal")
          }
        >
          Verify transaction
        </button>
      </PuzzleCard>
      {TRANSACTIONS.map((tx) => (
        <article className="transaction" key={tx.id}>
          <div>
            <strong>{tx.merchant}</strong>
            <span>{tx.time} · {tx.location}</span>
            {tx.clueId && <EvidencePill found={clues.has(tx.clueId)} />}
          </div>
          <b>{tx.amount}</b>
        </article>
      ))}
    </div>
  );
}

function MailApp({ solvePuzzle, miss, clues, puzzles }) {
  const [departure, setDeparture] = useState("");
  return (
    <div className="stack">
      <PuzzleCard title="Recover unsent draft" solved={puzzles.mail}>
        <p>The draft only restores if you enter the departure time mentioned in the receipt.</p>
        <div className="answer-row">
          <input value={departure} onChange={(event) => setDeparture(event.target.value)} placeholder="HH:MM" />
          <button
            type="button"
            onClick={() =>
              clean(departure) === "2218"
                ? solvePuzzle("mail", ["mail-ticket"], "Train receipt restored")
                : miss("No restored draft for that time")
            }
          >
            Restore
          </button>
        </div>
      </PuzzleCard>
      <div className="list">
        {MAILS.map((mail) => {
          const locked = mail.id === "mail-ticket" && !puzzles.mail;
          return (
            <article className="mail" key={mail.id}>
              <span>{mail.from}</span>
              <h3>{locked ? "Draft: forward receipt" : mail.subject}</h3>
              <p>{locked ? "Draft body unavailable. Receipt metadata shows only '22:18'." : mail.body}</p>
              {mail.clueId && <EvidencePill found={clues.has(mail.clueId)} />}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Contacts() {
  return (
    <div className="list">
      {CONTACTS.map((contact) => (
        <article className="contact-card" key={contact.name}>
          <div className="avatar">{contact.name.slice(0, 1)}</div>
          <div>
            <strong>{contact.name}</strong>
            <span>{contact.detail}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function Browser({ solvePuzzle, miss, clues, puzzles }) {
  const [query, setQuery] = useState("");
  const queryMatches = clean(query).includes("platform6") && clean(query).includes("train");
  return (
    <div className="browser stack">
      <label className="input-row">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the web from Lena's history" />
      </label>
      <PuzzleCard title="Repeat Lena's useful search" solved={puzzles.browser}>
        <p>Search for the travel query that would explain why Platform 6 mattered.</p>
        {queryMatches && (
          <div className="search-result">
            <strong>MetroLink last eastbound train</strong>
            <span>Platform 6 · Departs 22:18 · Night service</span>
          </div>
        )}
        <button
          className="full-button"
          type="button"
          onClick={() =>
            queryMatches
              ? solvePuzzle("browser", ["browser-train"], "Travel search confirmed")
              : miss("Try combining the platform and train clue")
          }
        >
          Log result
        </button>
      </PuzzleCard>
      <div className="list">
        {HISTORY.map((item) => (
          <article className="history" key={`${item.query}-${item.time}`}>
            <strong>{item.query}</strong>
            <span>{item.time}</span>
            {item.clueId && <EvidencePill found={clues.has(item.clueId)} />}
          </article>
        ))}
      </div>
    </div>
  );
}

function Maps({ solvePuzzle, miss, clues, puzzles }) {
  const [route, setRoute] = useState([]);
  const remaining = ROUTE.filter((stop) => !route.includes(stop.place));

  function checkRoute() {
    const correct = route.length === ROUTE_SOLUTION.length && route.every((place, index) => place === ROUTE_SOLUTION[index]);
    if (correct) solvePuzzle("route", ["maps-platform"], "Route reconstructed");
    else miss("The route order conflicts with the timestamps");
  }

  return (
    <div className="maps stack">
      <div className="map-canvas">
        <span className="route-point a" />
        <span className="route-point b" />
        <span className="route-point c" />
        <span className="route-point d" />
      </div>
      <PuzzleCard title="Rebuild the location route" solved={puzzles.route}>
        <p>Tap the places in the order Lena visited them.</p>
        <div className="route-build">
          {route.map((place, index) => (
            <button type="button" key={place} onClick={() => setRoute(route.filter((item) => item !== place))}>
              {index + 1}. {place}
            </button>
          ))}
          {!route.length && <span>No stops selected</span>}
        </div>
        <div className="choice-grid">
          {remaining.map((stop) => (
            <button type="button" key={stop.place} onClick={() => setRoute([...route, stop.place])}>
              {stop.place}
            </button>
          ))}
        </div>
        <button className="full-button" type="button" onClick={checkRoute}>
          Check route
        </button>
        <EvidencePill found={clues.has("maps-platform")} />
      </PuzzleCard>
      <div className="timeline compact">
        {ROUTE.map((stop) => (
          <article className="event" key={stop.place}>
            <time>{stop.time}</time>
            <div>
              <strong>{stop.place}</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SettingsApp() {
  return (
    <div className="settings-list">
      <Setting label="Airplane Mode" value="On" />
      <Setting label="Location Sharing" value="Paused 20:56" />
      <Setting label="Battery" value="12%" />
      <Setting label="Emergency SOS" value="Not triggered" />
      <Setting label="Device Name" value="Lena's Phone" />
      <Setting label="Focus" value="Do Not Disturb at 21:02" />
    </div>
  );
}

function Setting({ label, value }) {
  return (
    <div className="setting">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CaseInstruction({ compact = false }) {
  return (
    <section className={cx("case-instruction", compact && "compact")} aria-label="Case instructions">
      <div>
        <span>Situation</span>
        <p>{CASE.briefing.situation}</p>
      </div>
      <div>
        <span>Goal</span>
        <p>{CASE.briefing.goal}</p>
      </div>
      {!compact && (
        <div>
          <span>Starting lead</span>
          <p>{CASE.briefing.startingLead}</p>
        </div>
      )}
    </section>
  );
}

function TheoryLab({ clues }) {
  const [theory, setTheory] = useState("rowan");
  const theories = {
    rowan: {
      label: "Rowan took Lena",
      support: clues.has("note-locker") ? "Lena did not trust Rowan with the spare key." : "A locked note may explain Rowan's role.",
      contradiction:
        clues.has("maps-platform") && clues.has("bank-atm")
          ? "The route and ATM timestamp place Lena alone at Riverton Central after Rowan's last known contact."
          : "Needs route and wallet evidence before this can be tested."
    },
    noah: {
      label: "Noah lured Lena",
      support: clues.has("message-unknown") ? "Noah matches N. and the anonymous Platform 6 message." : "Identify N. before testing this theory.",
      contradiction:
        clues.has("browser-train") && clues.has("photo-scarf")
          ? "The train and scarf evidence suggest a planned exchange, not a random abduction."
          : "Needs photo and train evidence."
    },
    runaway: {
      label: "Lena left voluntarily",
      support:
        clues.has("browser-train") && clues.has("bank-atm")
          ? "She searched the train, withdrew cash, and disabled location sharing."
          : "Needs browser and wallet evidence.",
      contradiction:
        clues.has("message-unknown")
          ? "The threats and 'no police' instruction mean the departure was pressured, not carefree."
          : "Needs the anonymous thread."
    }
  };
  const active = theories[theory];

  return (
    <section className="theory-lab">
      <div className="puzzle-title">
        <Eye size={17} />
        <strong>Theory lab</strong>
        <span />
      </div>
      <div className="choice-grid">
        {Object.entries(theories).map(([id, item]) => (
          <button type="button" className={cx(theory === id && "selected")} key={id} onClick={() => setTheory(id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="theory-result">
        <span>Supports</span>
        <p>{active.support}</p>
        <span>Contradiction</span>
        <p>{active.contradiction}</p>
      </div>
    </section>
  );
}

function CaseApp({ clues, puzzles, score, requiredFound, solvePuzzle, miss, chooseDeduction, deduction, solved }) {
  const [timeline, setTimeline] = useState([]);
  const evidenceOptions = CASE.timelineOptions;
  const remaining = evidenceOptions.filter((item) => !timeline.includes(item.id));
  const ready = puzzles.timeline && requiredFound >= CASE.requiredClues.length;

  function checkTimeline() {
    const correct = timeline.length === TIMELINE_SOLUTION.length && timeline.every((id, index) => id === TIMELINE_SOLUTION[index]);
    if (correct) solvePuzzle("timeline", [], "Timeline locked");
    else miss("The order still has a contradiction");
  }

  return (
    <div className="case-app">
      <CaseInstruction />
      <div className="case-summary">
        <span>Current score</span>
        <strong>{score}</strong>
        <p>{requiredFound}/{CASE.requiredClues.length} key evidence items · {puzzles.timeline ? "timeline solved" : "timeline open"}</p>
      </div>

      <PuzzleCard title="Build the final timeline" solved={puzzles.timeline}>
        <p>Use evidence from different apps. Put the events in the order that explains Lena's last hour.</p>
        <div className="route-build timeline-build">
          {timeline.map((id, index) => {
            const item = evidenceOptions.find((option) => option.id === id);
            return (
              <button type="button" key={id} onClick={() => setTimeline(timeline.filter((entry) => entry !== id))}>
                {index + 1}. {item.label}
              </button>
            );
          })}
          {!timeline.length && <span>No events selected</span>}
        </div>
        <div className="choice-grid">
          {remaining.map((item) => (
            <button type="button" key={item.id} disabled={!clues.has(item.id)} onClick={() => setTimeline([...timeline, item.id])}>
              {clues.has(item.id) ? item.label : "Evidence missing"}
            </button>
          ))}
        </div>
        <button className="full-button" type="button" onClick={checkTimeline}>
          Check timeline
        </button>
      </PuzzleCard>

      <TheoryLab clues={clues} />

      {solved ? (
        <div className="verdict success">
          <Check size={24} />
          <h3>Case Solved</h3>
          <p>{CASE.verdict}</p>
        </div>
      ) : (
        <div className={cx("deductions", !ready && "disabled-block")}>
          <p className="section-label">Make a deduction</p>
          {!ready && <p className="gate-copy">Collect all key evidence and solve the timeline before the final answer counts.</p>}
          {DEDUCTIONS.map((item) => (
            <button
              type="button"
              className={cx("deduction", deduction === item.id && "selected", item.id === CASE.solution && deduction === item.id && "correct")}
              key={item.id}
              onClick={() => chooseDeduction(item.id)}
            >
              <strong>{item.title}</strong>
              {deduction === item.id && <span>{item.detail}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="clue-log">
        <p className="section-label">Evidence board</p>
        {Object.entries(CLUES).map(([id, clue]) => (
          <article className={cx("clue-entry", clues.has(id) && "found")} key={id}>
            <strong>{clues.has(id) ? clue.title : "Undiscovered evidence"}</strong>
            <span>{clues.has(id) ? `${clue.app}: ${clue.detail}` : clue.locked}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function HintPanel({ hintsUsed, useHint, close, score }) {
  return (
    <div className="overlay" role="dialog" aria-label="Hints">
      <div className="hint-panel">
        <button className="close-button" type="button" onClick={close}>
          <X size={17} />
        </button>
        <h2>Hints</h2>
        <p>Each hint costs {CASE.hintCost} points. Current score: {score}.</p>
        <div className="hint-list">
          {HINTS.slice(0, hintsUsed).map((hint, index) => (
            <article className="hint" key={hint}>
              <span>Hint {index + 1}</span>
              <p>{hint}</p>
            </article>
          ))}
        </div>
        {hintsUsed < HINTS.length ? (
          <button className="primary" type="button" onClick={useHint}>
            Reveal hint
          </button>
        ) : (
          <p className="tiny">No more hints available for this case.</p>
        )}
      </div>
    </div>
  );
}
