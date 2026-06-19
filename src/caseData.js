import {
  Banknote,
  CalendarDays,
  Camera,
  Compass,
  Contact,
  FileText,
  Mail,
  MapPinned,
  MessageCircle,
  Settings,
  ShieldQuestion
} from "lucide-react";

export const CASE = {
  id: "last-platform",
  title: "The Last Platform",
  owner: "Lena Ortiz",
  relationship: "friend",
  date: "Friday, 22:47",
  objective: "Find out where Lena went after her phone was found near Riverton Central.",
  briefing: {
    situation:
      "Lena Ortiz vanished tonight after cancelling dinner with her mother. Her phone was found on a wet bench at Riverton Central with 12% battery, airplane mode enabled, and a deleted photo still recoverable from the device.",
    goal:
      "Work out whether Lena was taken, ran away, or arranged to disappear. Rebuild her final hour, identify who lured her to Platform 6, and determine where she went after the phone was abandoned.",
    startingLead:
      "The lock screen shows a birthday reminder. Once inside, start by comparing Messages, Contacts, and the Case board."
  },
  passcode: "2604",
  startingScore: 100,
  hintCost: 10,
  requiredClues: ["message-unknown", "photo-scarf", "bank-atm", "calendar-platform", "browser-train", "maps-platform"],
  timelineOptions: [
    { id: "calendar-platform", label: "21:30 meeting with N. is set" },
    { id: "bank-atm", label: "21:53 cash withdrawal" },
    { id: "photo-scarf", label: "22:04 scarf photo at the platform" },
    { id: "browser-train", label: "22:18 Platform 6 train confirmed" }
  ],
  solution: "platform-six-train",
  verdict:
    "Lena was not abducted from Riverton Central. She arranged a meeting with Noah K., used the red scarf as a signal, collected cash and the envelope, then boarded the 22:18 eastbound train from Platform 6. Rowan looks suspicious at first, but the timeline clears him from the station sequence.",
  lockClue: "Lena's lock screen shows her birthday reminder: 26 April."
};

export const APPS = [
  {
    id: "messages",
    label: "Messages",
    icon: MessageCircle,
    tone: "green"
  },
  {
    id: "photos",
    label: "Photos",
    icon: Camera,
    tone: "rose"
  },
  {
    id: "notes",
    label: "Notes",
    icon: FileText,
    tone: "yellow"
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
    tone: "red"
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Banknote,
    tone: "emerald"
  },
  {
    id: "mail",
    label: "Mail",
    icon: Mail,
    tone: "blue"
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: Contact,
    tone: "indigo"
  },
  {
    id: "browser",
    label: "Browser",
    icon: Compass,
    tone: "cyan"
  },
  {
    id: "maps",
    label: "Maps",
    icon: MapPinned,
    tone: "lime"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    tone: "gray"
  },
  {
    id: "case",
    label: "Case",
    icon: ShieldQuestion,
    tone: "violet"
  }
];

export const CLUES = {
  "message-unknown": {
    app: "Messages",
    title: "Anonymous Platform Message",
    detail: "The anonymous sender is Noah K., saved elsewhere as N. He told Lena: red scarf, Platform 6, 22:10, and no police.",
    locked: "Identify who N. is by comparing messages, contacts, and mail."
  },
  "message-mom": {
    app: "Messages",
    title: "Cancelled Dinner",
    detail: "Lena cancelled family dinner with almost no explanation, which was unusual for her.",
    locked: "Read the family thread closely."
  },
  "photo-scarf": {
    app: "Photos",
    title: "Station Scarf Photo",
    detail: "A hidden deleted photo shows a red scarf tied to a railing beside a backpack at Platform 6.",
    locked: "Unlock the hidden photo album using the code made from locker and platform numbers."
  },
  "note-locker": {
    app: "Notes",
    title: "Locker 18 Note",
    detail: "Lena wrote: locker 18, red scarf, and don't trust Rowan with the spare key.",
    locked: "Unlock Lena's panic note with the recovery answer."
  },
  "calendar-platform": {
    app: "Calendar",
    title: "Platform Six Calendar Entry",
    detail: "The 21:30 hidden event says 'N. / Platform 6 / bring envelope'.",
    locked: "Match the hidden initial in Calendar to a saved contact."
  },
  "bank-atm": {
    app: "Wallet",
    title: "Station ATM Withdrawal",
    detail: "Lena withdrew 120 credits from the Riverton Central ATM at 21:53.",
    locked: "Verify which Wallet record proves she had cash at the station."
  },
  "mail-ticket": {
    app: "Mail",
    title: "Forwarded Train Receipt",
    detail: "A restored draft mail mentions a 22:18 night train and locker collection.",
    locked: "Restore the unsent receipt draft with its departure time."
  },
  "browser-train": {
    app: "Browser",
    title: "Night Train Search",
    detail: "Lena searched for the last eastbound service from Platform 6: departure 22:18.",
    locked: "Repeat the useful train search from the browser clues."
  },
  "maps-platform": {
    app: "Maps",
    title: "Recent Route",
    detail: "Maps shows Lena moving from the cafe to Riverton Central, ending at Platform 6.",
    locked: "Reconstruct Lena's route from location timestamps."
  }
};

export const HINTS = [
  "The lock screen gives a date, and Lena writes dates in day-month order.",
  "N. is not just a letter. Compare Contacts, Calendar, and the anonymous thread.",
  "The hidden album code combines the locker number from Notes with the meeting platform number.",
  "For the route and final deduction, order matters more than any single clue.",
  "If Rowan looks guilty, test that idea against the route, cash withdrawal, and train departure time."
];

export const THREADS = [
  {
    id: "unknown",
    name: "No Caller ID",
    preview: "Red scarf. Platform 6. 22:10.",
    messages: [
      { from: "them", time: "20:48", text: "You still have the envelope?" },
      { from: "lena", time: "20:49", text: "I said I would bring it. Then this is over." },
      {
        from: "them",
        time: "21:07",
        text: "Red scarf. Platform 6. 22:10. No police. No Rowan.",
        clueId: "message-unknown"
      },
      { from: "lena", time: "21:08", text: "If this is another threat, I swear-" },
      { from: "them", time: "21:09", text: "Then be early." }
    ]
  },
  {
    id: "mom",
    name: "Mom",
    preview: "Are you still coming for dinner?",
    messages: [
      { from: "them", time: "18:31", text: "Are you still coming for dinner? I made your favorite." },
      { from: "lena", time: "18:34", text: "Can't tonight. Emergency shift thing." },
      { from: "them", time: "18:35", text: "You hate emergency shift things. Call me?" },
      { from: "lena", time: "18:37", text: "Tomorrow. Promise.", clueId: "message-mom" }
    ]
  },
  {
    id: "rowan",
    name: "Rowan",
    preview: "Please do not go alone.",
    messages: [
      { from: "them", time: "19:22", text: "Lena, please do not go alone." },
      { from: "lena", time: "19:24", text: "You said the spare key was safe." },
      { from: "them", time: "19:27", text: "It was. I don't know how they got it." },
      { from: "lena", time: "19:29", text: "Then I fix it myself." }
    ]
  },
  {
    id: "max",
    name: "Max",
    preview: "Your battery is at 12%.",
    messages: [
      { from: "them", time: "21:58", text: "Your battery is at 12%. Answer me." },
      { from: "them", time: "22:11", text: "Lena?" },
      { from: "them", time: "22:14", text: "I am coming to the station." }
    ]
  }
];

export const PHOTOS = [
  {
    id: "photo-scarf",
    title: "IMG_4821",
    time: "Tonight, 22:04",
    src: "/assets/last-platform-photo.png",
    caption: "Riverton Central platform railing"
  },
  {
    id: "photo-envelope",
    title: "IMG_4818",
    time: "Tonight, 20:52",
    generated: "receipt",
    caption: "A sealed envelope marked '18'"
  },
  {
    id: "photo-family",
    title: "IMG_4760",
    time: "Yesterday",
    generated: "family",
    caption: "Dinner table, two plates, one untouched"
  }
];

export const NOTES = [
  {
    id: "note-locker",
    title: "If I panic",
    body: "Locker 18. Red scarf visible. Spare key not with Rowan anymore. If the envelope is real, N. knows who emptied the charity account.",
    date: "Edited 21:41",
    clueId: "note-locker"
  },
  {
    id: "note-birthday",
    title: "Stuff I forget",
    body: "Mum birthday: 03/19. Mine: 26/04. Max hates olives. Buy new charger.",
    date: "Edited yesterday"
  }
];

export const CALENDAR = [
  {
    time: "18:00",
    title: "Dinner with Mum",
    meta: "Cancelled at 18:34"
  },
  {
    time: "21:30",
    title: "N. / Platform 6 / bring envelope",
    meta: "No alerts, hidden calendar",
    clueId: "calendar-platform"
  },
  {
    time: "23:45",
    title: "Night shift cover",
    meta: "Rowan asked to swap"
  }
];

export const TRANSACTIONS = [
  {
    id: "tx-coffee",
    merchant: "Platform Coffee",
    amount: "-4.80",
    time: "21:37",
    location: "Riverton Central"
  },
  {
    id: "bank-atm",
    merchant: "Riverton Central ATM",
    amount: "-120.00",
    time: "21:53",
    location: "Concourse B",
    clueId: "bank-atm"
  },
  {
    id: "tx-ticket",
    merchant: "MetroLink Ticket",
    amount: "-8.40",
    time: "22:02",
    location: "Mobile purchase"
  }
];

export const MAILS = [
  {
    id: "mail-ticket",
    from: "MetroLink Receipts",
    subject: "Draft: forward receipt",
    body: "Ticket reserved for the 22:18 eastbound service. Locker collection before boarding. Do not reply to this automated receipt.",
    clueId: "mail-ticket"
  },
  {
    id: "mail-work",
    from: "Riverton Archive",
    subject: "Shift swap approved",
    body: "Your request to move tonight's closing shift to Rowan Vale has been approved."
  }
];

export const CONTACTS = [
  { name: "Mom", detail: "Emergency contact. Missed call at 22:16." },
  { name: "Max Ortiz", detail: "Sibling. Sent three messages after 21:58." },
  { name: "Rowan Vale", detail: "Coworker. Last call: 19:31, duration 04:12." },
  { name: "Noah K.", detail: "Saved as N. Old classmate. No recent calls." }
];

export const HISTORY = [
  { query: "how to disable location sharing on phone", time: "20:55" },
  { query: "last eastbound train platform 6 riverton", time: "21:12", clueId: "browser-train" },
  { query: "anonymous bank transfer charity account", time: "21:18" },
  { query: "can police recover deleted messages", time: "21:25" }
];

export const ROUTE = [
  { place: "Crescent Cafe", time: "21:24" },
  { place: "Platform Coffee", time: "21:37" },
  { place: "Riverton Central ATM", time: "21:53" },
  { place: "Riverton Central Platform 6", time: "22:06", clueId: "maps-platform" }
];

export const DEDUCTIONS = [
  {
    id: "rowan-abduction",
    title: "Rowan abducted Lena after work.",
    detail: "Rowan looks suspicious, but the phone data shows Lena continued alone to the station after their call."
  },
  {
    id: "bank-branch",
    title: "Lena disappeared at the bank branch.",
    detail: "There was an ATM withdrawal, but later evidence places her at the platform."
  },
  {
    id: "platform-six-train",
    title: "Lena boarded the 22:18 train from Platform 6.",
    detail: "This matches the unknown message, the train search, the map route, the photo, and her cash withdrawal."
  },
  {
    id: "mom-house",
    title: "Lena went to her mother's house.",
    detail: "She cancelled dinner and never took a route toward her mother's address."
  }
];
