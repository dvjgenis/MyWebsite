export type TileTone = "about" | "initiatives" | "contact" | "ink";

export interface ColorTileData {
  title: string;
  href: string;
  description?: string;
  tone: TileTone;
  bg?: string;
  fg?: string;
  image?: string;
  external?: boolean;
}

export const tileTones: Record<TileTone, { bg: string; fg: string }> = {
  about: { bg: "#1f4d3a", fg: "#e7f3ea" },
  initiatives: { bg: "#c45c26", fg: "#fff3e8" },
  contact: { bg: "#1c2740", fg: "#e7eef8" },
  ink: { bg: "#2d2a26", fg: "#faf7f2" },
};

export const homeTiles: ColorTileData[] = [
  {
    title: "About Me",
    href: "/about/",
    description: "Background, education, involvements, and the resources that shaped me.",
    tone: "about",
  },
  {
    title: "Initiatives",
    href: "/initiatives/",
    description: "Work, projects, speaking, leadership, study abroad, and awards.",
    tone: "initiatives",
  },
  {
    title: "Contact",
    href: "/contact/",
    description: "LinkedIn, resume, and other ways to reach me.",
    tone: "contact",
  },
];

export const aboutTiles: ColorTileData[] = [
  {
    title: "Background",
    href: "/about/background/",
    description: "Growing up in the Philippines and adapting to life in the United States.",
    tone: "about",
    bg: "#2a5a44",
  },
  {
    title: "Education",
    href: "/about/education/",
    description: "From grade school through my current college experience.",
    tone: "about",
    bg: "#3d6b4f",
  },
  {
    title: "Hobbies & Involvements",
    href: "/about/hobbies/",
    description: "Where I put both my professional skillset and personal passions to work.",
    tone: "about",
    bg: "#164a3d",
  },
  {
    title: "Resources I Love",
    href: "/about/resources/",
    description: "Tools and references that have been instrumental along the way.",
    tone: "about",
    bg: "#4f6b3a",
  },
];

export const initiativesTiles: ColorTileData[] = [
  {
    title: "Work Experience",
    href: "/initiatives/work/",
    description: "A varied professional background across research and industry.",
    tone: "initiatives",
    bg: "#a34b1d",
  },
  {
    title: "Volunteerism & Projects",
    href: "/initiatives/projects/",
    description: "Community organizing and technical projects.",
    tone: "initiatives",
    bg: "#c45c26",
  },
  {
    title: "Speaking Engagements",
    href: "/initiatives/speaking/",
    description: "Talks, workshops, and panels.",
    tone: "initiatives",
    bg: "#d97830",
  },
  {
    title: "Leadership Certification",
    href: "/initiatives/leadership/",
    description: "Milestones on the path to certified leadership.",
    tone: "initiatives",
    bg: "#8b3d1a",
  },
  {
    title: "Study Abroad",
    href: "/initiatives/abroad/",
    description: "A learning venture in Granada, Spain.",
    tone: "initiatives",
    bg: "#b85a22",
  },
  {
    title: "Scholarships & Awards",
    href: "/initiatives/awards/",
    description: "Recent recognitions, awards, and scholarships.",
    tone: "initiatives",
    bg: "#9a4418",
    image: "/images/initiatives/awards/15cff78094ca36f796696c92fca9cc03.jpg",
  },
];

export const leadershipTiles: ColorTileData[] = [
  {
    title: "Personal Development Plan",
    href: "/initiatives/leadership/personal-development-plan/",
    description: "How I define leadership and the competencies I’m building.",
    tone: "initiatives",
    bg: "#8b3d1a",
  },
  {
    title: "Trainings & Workshops",
    href: "/initiatives/leadership/trainings/",
    description: "Retreats, institutes, and facilitated leadership labs.",
    tone: "initiatives",
    bg: "#a34b1d",
  },
  {
    title: "I-Programs",
    href: "/initiatives/leadership/i-programs/",
    description: "Illinois Leadership Center I-Programs and certificates.",
    tone: "initiatives",
    bg: "#c45c26",
  },
  {
    title: "Team Experiences",
    href: "/initiatives/leadership/team-experiences/",
    description: "Projects where I practiced leading with a group.",
    tone: "initiatives",
    bg: "#d97830",
  },
  {
    title: "Leadership Coursework",
    href: "/initiatives/leadership/coursework/",
    description: "Classes that shaped how I think about people and systems.",
    tone: "initiatives",
    bg: "#b85a22",
  },
  {
    title: "Leadership Certificate Coach",
    href: "/initiatives/leadership/certificate-coach/",
    description: "Mentorship from my Illinois Leadership Center coach.",
    tone: "initiatives",
    bg: "#9a4418",
  },
  {
    title: "Cumulative Reflection",
    href: "/initiatives/leadership/cumulative-reflection/",
    description: "What this certification path has changed in my practice.",
    tone: "initiatives",
    bg: "#7a3416",
  },
];
