export type TimelineTone = "gold" | "green" | "warm" | "navy";

export interface TimelineEra {
  id: string;
  kind: "era";
  title: string;
  years: string;
  dek?: string;
  tone: TimelineTone;
  /** ISO date; the marker sits just above the event at this moment. */
  at: string;
}

export interface TimelineEvent {
  id: string;
  kind: "event";
  /** ISO date for a moment, or the start of a range. */
  at: string;
  /** ISO date for the end of a range. Omit for a single point. */
  until?: string;
  year: number;
  date: string;
  untilDate?: string;
  place: string;
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
  image?: string;
  imageAlt?: string;
  tone: TimelineTone;
  featured?: boolean;
  live?: boolean;
  /** Distinguishes overlapping duration ribbons. */
  spanKind?: "school" | "role";
  spanColor?: string;
}

export type TimelineItem = TimelineEra | TimelineEvent;

export const timelineItems: TimelineItem[] = [
  {
    id: "era-philippines",
    kind: "era",
    title: "Philippines",
    years: "2004 — 2013",
    dek: "A collectivist childhood on the Visayas and in Mindanao.",
    tone: "gold",
    at: "2004-03-24",
  },
  {
    id: "born",
    kind: "event",
    at: "2004-03-24",
    year: 2004,
    date: "March 24, 2004",
    place: "Bacolod City, Negros Occidental",
    title: "Born in Bacolod City",
    body: "The first chapter opens on the Visayas Islands — a family of singers, a collectivist world, and a faith that would travel with me.",
    href: "/about/background/",
    hrefLabel: "Background",
    image: "/images/about/background/0c53e2d6a76de026e71c072c1c3a5c44.jpg",
    imageAlt: "Framed portrait of Dulf as a young child with his parents",
    tone: "gold",
    featured: true,
  },
  {
    id: "butuan",
    kind: "event",
    at: "2007-03-24",
    year: 2007,
    date: "March 2007",
    place: "Butuan City, Mindanao",
    title: "Raised in Butuan City",
    body: "From age three, Mindanao became home. Close-knit streets, church, and a lower-middle-class upbringing that taught me how to belong.",
    href: "/about/background/",
    hrefLabel: "Background",
    image: "/images/about/background/eb510ed977bef4702c1bee97b19b16d8.jpg",
    imageAlt: "Children gathered together outdoors in the Philippines",
    tone: "gold",
  },
  {
    id: "good-shepherd",
    kind: "event",
    at: "2009-08-15",
    until: "2013-05-20",
    year: 2009,
    date: "August 2009",
    untilDate: "May 2013",
    place: "Butuan City",
    title: "Good Shepherd Christian Academy",
    body: "A faith-based classroom where character was taught as seriously as the lesson. Self-discipline became a kind of inheritance.",
    href: "/about/education/",
    hrefLabel: "Education",
    image: "/images/about/background/6ac116e063841468080a127dfa241bc1.jpg",
    imageAlt: "Dulf as a schoolboy in uniform, smiling from a wooden pew",
    tone: "gold",
    spanKind: "school",
    spanColor: "#c4a15d",
  },
  {
    id: "violin",
    kind: "event",
    at: "2011-03-24",
    year: 2011,
    date: "Around 2011",
    place: "Butuan City",
    title: "The violin finds me",
    body: "Piano first, then the violin at seven — following my grandfather’s lead. Music was already the family language.",
    href: "/about/hobbies/",
    hrefLabel: "Hobbies",
    image: "/images/about/background/65badc1547c8533e67216f27d6ed7078.jpg",
    imageAlt: "Dulf seated with a violin in an orchestra",
    tone: "gold",
  },
  {
    id: "era-illinois",
    kind: "era",
    title: "New roots",
    years: "2013 — 2022",
    dek: "Nine years old in a new country — then a public voice.",
    tone: "green",
    at: "2013-07-01",
  },
  {
    id: "immigration",
    kind: "event",
    at: "2013-07-01",
    year: 2013,
    date: "2013",
    place: "O’Hare → Des Plaines, Illinois",
    title: "Nine years old, a new country",
    body: "Pink hair on the escalator. New languages in the concourse. Curiosity instead of fear — and a grandmother’s long work finally coming through.",
    href: "/about/background/",
    hrefLabel: "Background",
    tone: "green",
    featured: true,
  },
  {
    id: "forest",
    kind: "event",
    at: "2013-08-15",
    until: "2015-05-20",
    year: 2013,
    date: "August 2013",
    untilDate: "May 2015",
    place: "Des Plaines, Illinois",
    title: "Forest Elementary School",
    body: "First American classrooms. I learned the building, then the people, then how to speak up in a room that did not already know me.",
    href: "/about/education/",
    hrefLabel: "Education",
    tone: "green",
    spanKind: "school",
    spanColor: "#2f6f4e",
  },
  {
    id: "algonquin",
    kind: "event",
    at: "2015-08-15",
    until: "2018-05-20",
    year: 2015,
    date: "August 2015",
    untilDate: "May 2018",
    place: "Des Plaines, Illinois",
    title: "Algonquin Middle School",
    body: "A wider world of clubs, teams, and the slow work of becoming bilingual in culture as well as language.",
    href: "/about/education/",
    hrefLabel: "Education",
    tone: "green",
    spanKind: "school",
    spanColor: "#6b8f71",
  },
  {
    id: "maine-west",
    kind: "event",
    at: "2018-08-15",
    until: "2022-05-20",
    year: 2018,
    date: "August 2018",
    untilDate: "May 2022",
    place: "Des Plaines, Illinois",
    title: "Maine West High School",
    body: "Chorus, AP World History, and a growing public voice. The years that taught me history is not behind us — it is the room we are standing in.",
    href: "/about/education/",
    hrefLabel: "Education",
    tone: "green",
    spanKind: "school",
    spanColor: "#1d4e3c",
  },
  {
    id: "community",
    kind: "event",
    at: "2021-06-01",
    until: "2022-08-15",
    year: 2021,
    date: "June 2021",
    untilDate: "August 2022",
    place: "Des Plaines, Illinois",
    title: "Community, strings, and city hall",
    body: "Violin lessons, SPEAK Des Plaines, and a Community Development Liaison role at District 207. Service stopped being an assignment and started being a practice.",
    href: "/initiatives/work/",
    hrefLabel: "Work",
    tone: "green",
    spanKind: "role",
    spanColor: "#c4922a",
  },
  {
    id: "graduation",
    kind: "event",
    at: "2022-06-12",
    year: 2022,
    date: "June 2022",
    place: "Maine West High School",
    title: "Closing address, Class of 2022",
    body: "I spoke last at graduation — after a junior year in lockdown and a senior year spent finding our feet. Arion Award. Illinois State Scholar. Then, outward.",
    href: "/initiatives/speaking/",
    hrefLabel: "Speaking",
    image: "/images/about/education/ce1dd9354c0954fc9e8332c171a2d532.jpg",
    imageAlt: "Dulf delivering a speech at a podium on stage",
    tone: "green",
    featured: true,
  },
  {
    id: "era-illinois-u",
    kind: "era",
    title: "University of Illinois",
    years: "2022 — now",
    dek: "Undeclared first. Then the iSchool, from Spain.",
    tone: "warm",
    at: "2022-08-22",
  },
  {
    id: "dgs",
    kind: "event",
    at: "2022-08-22",
    until: "2024-01-15",
    year: 2022,
    date: "August 2022",
    untilDate: "January 2024",
    place: "Urbana-Champaign",
    title: "Division of General Studies",
    body: "I arrived undeclared — General Studies, the Exploratory Studies home for not knowing yet. A land-grant campus first; the college would come later.",
    href: "/about/education/",
    hrefLabel: "Education",
    tone: "warm",
    spanKind: "school",
    spanColor: "#c4893a",
  },
  {
    id: "seaquist",
    kind: "event",
    at: "2022-11-01",
    until: "2023-05-15",
    year: 2022,
    date: "November 2022",
    untilDate: "May 2023",
    place: "Office of Civic Life",
    title: "Barbara Seaquist Williams Fellow",
    body: "Service Saturdays, a donation drive, and the first formal proof that campus leadership could be civic, not just extracurricular.",
    href: "/initiatives/work/",
    hrefLabel: "Work",
    tone: "warm",
    spanKind: "role",
    spanColor: "#7a3e8c",
  },
  {
    id: "ameren",
    kind: "event",
    at: "2023-05-01",
    until: "2025-05-15",
    year: 2023,
    date: "May 2023",
    untilDate: "May 2025",
    place: "Research Park",
    title: "Ameren Innovation Center",
    body: "Project manager, operations intern, data scientist. Two years of building inside a utility’s innovation lab — and taking that team out into the community.",
    href: "/initiatives/work/",
    hrefLabel: "Work",
    tone: "warm",
    spanKind: "role",
    spanColor: "#1d5fa0",
  },
  {
    id: "granada",
    kind: "event",
    at: "2024-01-12",
    until: "2024-05-20",
    year: 2024,
    date: "January 2024",
    untilDate: "May 2024",
    place: "Granada, Spain",
    title: "Study abroad in Granada",
    body: "Spanish Studies, a host family, local friends, and a Wednesday classroom of teenagers. Mid-semester, still finishing the minor, word came that the iSchool had said yes.",
    href: "/initiatives/abroad/",
    hrefLabel: "Study Abroad",
    image: "/images/initiatives/abroad/51a6cc264bd0396584a83dbe6ac23121.png",
    imageAlt: "Study abroad cohort at sunset overlooking Granada",
    tone: "warm",
    featured: true,
    spanKind: "school",
    spanColor: "#b4413c",
  },
  {
    id: "ischool",
    kind: "event",
    at: "2024-01-18",
    until: "2026-05-15",
    year: 2024,
    date: "January 2024",
    untilDate: "May 2026",
    place: "Admitted from Granada",
    title: "Accepted into the iSchool",
    body: "Information Sciences — and later Data Science — while I was still in Spain finishing the Spanish minor. The undeclared years had found their college.",
    href: "/about/education/",
    hrefLabel: "Education",
    image: "/images/about/education/dd5d8856b3b2ee73d5cc2c5a67427d0c.jpg",
    imageAlt: "Dulf in Illinois graduation attire, seated on the Memorial Stadium turf",
    tone: "warm",
    featured: true,
    spanKind: "school",
    spanColor: "#c45c26",
  },
  {
    id: "globe",
    kind: "event",
    at: "2024-08-01",
    until: "2025-08-01",
    year: 2024,
    date: "August 2024",
    untilDate: "August 2025",
    place: "International Education at Illinois",
    title: "First GLOBE Ambassador",
    body: "Mentoring, cultural programs, and the dashboards that made a global community visible to itself.",
    href: "/initiatives/work/",
    hrefLabel: "Work",
    tone: "warm",
    spanKind: "role",
    spanColor: "#0e7c7b",
  },
  {
    id: "citl",
    kind: "event",
    at: "2024-10-01",
    until: "2025-08-01",
    year: 2024,
    date: "October 2024",
    untilDate: "August 2025",
    place: "Center for Innovation in Teaching & Learning",
    title: "Student voices, on the record",
    body: "Interviews, focus groups, and stories about learning with generative AI — made so campus leadership could hear students in their own words.",
    href: "/initiatives/speaking/citl/",
    hrefLabel: "CITL series",
    tone: "warm",
    spanKind: "role",
    spanColor: "#5c4d7a",
  },
  {
    id: "cuba",
    kind: "event",
    at: "2025-03-15",
    year: 2025,
    date: "March 2025",
    place: "Cuba",
    title: "Filter of Hope — Cuba",
    body: "House by house: water filters, prayer, and the kind of week that rearranges what a spring break is for.",
    href: "/initiatives/projects/",
    hrefLabel: "Projects",
    tone: "warm",
  },
  {
    id: "data-intern",
    kind: "event",
    at: "2025-08-01",
    until: "2026-05-15",
    year: 2025,
    date: "August 2025",
    untilDate: "May 2026",
    place: "Student Success, Inclusion & Belonging",
    title: "Data Innovation Intern",
    body: "Predictive models, Tableau, and pipelines built so the university can notice students before they disappear from the record.",
    href: "/initiatives/work/",
    hrefLabel: "Work",
    image: "/images/initiatives/work/8f7cfe0b73e78d462676208dc7fe57d0.jpg",
    imageAlt: "Dulf on stage during a GLOBE data dashboard presentation",
    tone: "warm",
    featured: true,
    spanKind: "role",
    spanColor: "#3d5a80",
  },
  {
    id: "costa-rica",
    kind: "event",
    at: "2026-03-13",
    year: 2026,
    date: "March 2026",
    place: "Liberia, Costa Rica",
    title: "Filter of Hope — Costa Rica",
    body: "Another spring, another set of doorways. Clean water for a decade, and evenings of debrief under a different sky.",
    href: "/initiatives/projects/",
    hrefLabel: "Projects",
    tone: "warm",
  },
  {
    id: "harmonyforge",
    kind: "event",
    at: "2026-04-15",
    year: 2026,
    date: "April 2026",
    place: "iSchool + Undergraduate Research Symposium",
    title: "HarmonyForge",
    body: "A glass-box SATB co-creative system — music, constraints, and the argument that AI should show its work.",
    href: "/initiatives/projects/",
    hrefLabel: "Projects",
    tone: "warm",
  },
  {
    id: "era-now",
    kind: "era",
    title: "This moment",
    years: "2026",
    dek: "Twenty-two years, still being written.",
    tone: "navy",
    at: "2026-09-18",
  },
  {
    id: "now",
    kind: "event",
    at: "2026-09-18",
    year: 2026,
    date: "September 2026",
    place: "Urbana-Champaign",
    title: "Still becoming",
    body: "Twenty-two years from Bacolod City to here. Dual degrees underway, a life split across two flags, and the next chapter still being written.",
    href: "/contact/",
    hrefLabel: "Contact",
    image: "/images/contact/contact-portrait.jpg",
    imageAlt: "Dulf wearing a Philippine flag sash",
    tone: "navy",
    featured: true,
    live: true,
  },
];

export const TIMELINE_START = "2004-03-24";
export const TIMELINE_END = "2026-09-18";

const MS_YEAR = 1000 * 60 * 60 * 24 * 365.25;

function ms(iso: string) {
  return Date.parse(`${iso}T12:00:00`);
}

function yearsBetween(fromIso: string, toIso: string) {
  return Math.max(0, (ms(toIso) - ms(fromIso)) / MS_YEAR);
}

function yearMarks(fromIso: string, toIso: string) {
  const from = ms(fromIso);
  const to = ms(toIso);
  const span = to - from;
  if (span <= 0) return [];
  const marks: { year: number; pct: number }[] = [];
  const start = new Date(`${fromIso}T12:00:00`);
  let year = start.getFullYear() + 1;
  const endYear = new Date(`${toIso}T12:00:00`).getFullYear();
  while (year <= endYear) {
    const tick = Date.parse(`${year}-01-01T12:00:00`);
    if (tick > from && tick < to) {
      marks.push({ year, pct: ((tick - from) / span) * 100 });
    }
    year += 1;
  }
  return marks;
}

export type TimelineGap = {
  kind: "gap";
  years: number;
  marks: { year: number; pct: number }[];
  era?: TimelineEra;
  tail?: boolean;
};

export type TimelineEventRow = {
  kind: "event";
  event: TimelineEvent;
  side: "left" | "right";
  role: "point" | "start" | "end";
};

export type TimelineRow = TimelineGap | TimelineEventRow | { kind: "era"; era: TimelineEra };

export type TimelineSpan = {
  id: string;
  title: string;
  tone: TimelineTone;
  kind: "school" | "role";
  color: string;
  lane: number;
  laneX: number;
};

const TONE_SPAN_COLOR: Record<TimelineTone, string> = {
  gold: "#c4a15d",
  green: "#2f6f4e",
  warm: "#c45c26",
  navy: "#3d5a80",
};

function laneX(lane: number) {
  const step = 20;
  const slot = Math.floor(lane / 2) + 1;
  const dir = lane % 2 === 0 ? 1 : -1;
  return dir * slot * step;
}

type Point = {
  at: string;
  role: "point" | "start" | "end";
  event: TimelineEvent;
};

function roleWeight(role: Point["role"]) {
  if (role === "end") return -1;
  if (role === "start") return 1;
  return 0;
}

function collectPoints(events: TimelineEvent[]): Point[] {
  const points: Point[] = [];
  for (const event of events) {
    if (event.until) {
      points.push({ at: event.at, role: "start", event });
      points.push({ at: event.until, role: "end", event });
    } else {
      points.push({ at: event.at, role: "point", event });
    }
  }
  points.sort((a, b) => ms(a.at) - ms(b.at) || roleWeight(a.role) - roleWeight(b.role));
  return points;
}

function assignLanes(events: TimelineEvent[]): Map<string, number> {
  const ranges = events
    .filter((event) => event.until)
    .map((event) => ({ id: event.id, start: ms(event.at), end: ms(event.until ?? event.at) }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const laneEnds: number[] = [];
  const lanes = new Map<string, number>();
  for (const range of ranges) {
    let lane = laneEnds.findIndex((end) => range.start >= end);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(range.end);
    } else {
      laneEnds[lane] = range.end;
    }
    lanes.set(range.id, lane);
  }
  return lanes;
}

export function getTimelineModel(): { rows: TimelineRow[]; spans: TimelineSpan[]; eras: TimelineEra[] } {
  const events = timelineItems.filter((item): item is TimelineEvent => item.kind === "event");
  const eras = timelineItems.filter((item): item is TimelineEra => item.kind === "era");
  const eraByAt = new Map(eras.map((era) => [era.at, era]));
  const points = collectPoints(events);
  const lanes = assignLanes(events);
  const sideById = new Map<string, "left" | "right">();
  let startIndex = 0;
  const rows: TimelineRow[] = [];
  const firstEra = eras[0];
  if (firstEra) rows.push({ kind: "era", era: firstEra });

  points.forEach((point, index) => {
    if (point.role !== "end" && !sideById.has(point.event.id)) {
      sideById.set(point.event.id, startIndex % 2 === 0 ? "left" : "right");
      startIndex += 1;
    }
    if (index > 0) {
      const prev = points[index - 1];
      const era = point.role !== "end" ? eraByAt.get(point.at) : undefined;
      rows.push({
        kind: "gap",
        years: yearsBetween(prev.at, point.at),
        marks: yearMarks(prev.at, point.at),
        era: era && era !== firstEra ? era : undefined,
      });
    }
    const startSide = sideById.get(point.event.id) ?? "left";
    rows.push({
      kind: "event",
      event: point.event,
      role: point.role,
      side: point.role === "end" ? (startSide === "left" ? "right" : "left") : startSide,
    });
  });

  rows.push({ kind: "gap", years: 0.35, marks: [], tail: true });

  const spans: TimelineSpan[] = events
    .filter((event) => event.until)
    .map((event) => {
      const lane = lanes.get(event.id) ?? 0;
      return {
        id: event.id,
        title: event.title,
        tone: event.tone,
        kind: event.spanKind ?? "role",
        color: event.spanColor ?? TONE_SPAN_COLOR[event.tone],
        lane,
        laneX: laneX(lane),
      };
    });

  return { rows, spans, eras };
}
