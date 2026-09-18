export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const site = {
  name: "Dulf Vincent Genis",
  tagline: "Transforming complex data into ethical, human-centered insights.",
  description:
    "In these pages, I highlight my technical engineering projects, global volunteer initiatives, and leadership experiences alongside my speaking engagements.",
  url: "https://dulfvincent.com",
  resume:
    "https://drive.google.com/file/d/1A7A7vCX-RCuU4M4-kiMEhtevwqRHaQ6O/view?usp=sharing",
  social: {
    instagram: "https://instagram.com/dv.gen14",
    linkedin: "https://linkedin.com/in/dvgenis",
    snapchat: "https://t.snapchat.com/k7zOTQvX",
    blinq: "https://blinq.me/NYe3XvCtUDzP",
  },
} as const;

/** Ensure trailing slash for Astro static routes (except home). */
export function withSlash(href: string): string {
  if (href === "/" || href.endsWith("/")) return href;
  return `${href}/`;
}

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Me",
    href: "/about/",
    children: [
      { label: "Background", href: "/about/background/" },
      { label: "Education", href: "/about/education/" },
      { label: "Hobbies & Involvements", href: "/about/hobbies/" },
      { label: "Resources I Love", href: "/about/resources/" },
    ],
  },
  {
    label: "Initiatives",
    href: "/initiatives/",
    children: [
      { label: "Work Experience", href: "/initiatives/work/" },
      { label: "Volunteerism & Projects", href: "/initiatives/projects/" },
      {
        label: "Speaking Engagements",
        href: "/initiatives/speaking/",
        children: [{ label: "CITL Student Quick Takes series", href: "/initiatives/speaking/citl/" }],
      },
      {
        label: "Leadership Certification",
        href: "/initiatives/leadership/",
        children: [
          { label: "Personal Development Plan", href: "/initiatives/leadership/personal-development-plan/" },
          { label: "Trainings & Workshops", href: "/initiatives/leadership/trainings/" },
          { label: "I-Programs", href: "/initiatives/leadership/i-programs/" },
          { label: "Team Experiences", href: "/initiatives/leadership/team-experiences/" },
          { label: "Leadership Coursework", href: "/initiatives/leadership/coursework/" },
          { label: "Leadership Certificate Coach", href: "/initiatives/leadership/certificate-coach/" },
          { label: "Cumulative Reflection", href: "/initiatives/leadership/cumulative-reflection/" },
        ],
      },
      {
        label: "Study Abroad",
        href: "/initiatives/abroad/",
        children: [{ label: "Abroad Resources", href: "/initiatives/abroad/resources/" }],
      },
      { label: "Scholarships & Awards", href: "/initiatives/awards/" },
    ],
  },
  { label: "Contact", href: "/contact/" },
];

export const aboutHubCards = [
  {
    slug: "about/background",
    title: "Background",
    desc: "Spotlighting the first half of my life in the Philippines and adapting to life in the United States as an immigrant.",
  },
  {
    slug: "about/education",
    title: "Education",
    desc: "Traversing my educational journey, spanning from grade school to my current college experience.",
  },
  {
    slug: "about/hobbies",
    title: "Hobbies & Involvements",
    desc: "Showcasing the various avenues where I express both my professional skillset and personal passions.",
  },
  {
    slug: "about/resources",
    title: "Resources I Love",
    desc: "An outlet to showcase and share resources that have been instrumental in various facets of my pursuits.",
  },
];

export const initiativesHubCards = [
  {
    slug: "initiatives/work",
    title: "Work Experience",
    desc: "Showcasing my varied professional background",
  },
  {
    slug: "initiatives/projects",
    title: "Volunteerism & Projects",
    desc: "Highlighting my contributions to volunteerism and community organizing.",
  },
  {
    slug: "initiatives/speaking",
    title: "Speaking Engagements",
    desc: "Demonstrating proficiency in public speaking and opportunities",
  },
  {
    slug: "initiatives/leadership",
    title: "Leadership Certification",
    desc: "Outlining the milestones on my path to certified leadership",
  },
  {
    slug: "initiatives/abroad",
    title: "Study Abroad",
    desc: "Putting a Spotlight on My Learning Venture in Granada, Spain",
  },
  {
    slug: "initiatives/awards",
    title: "Scholarships & Awards",
    desc: "Exhibiting my most recent recognitions, awards, and scholarships",
  },
];

export const leadershipHubCards = [
  { slug: "initiatives/leadership/personal-development-plan", title: "Personal Development Plan" },
  { slug: "initiatives/leadership/trainings", title: "Trainings & Workshops" },
  { slug: "initiatives/leadership/i-programs", title: "I-Programs" },
  { slug: "initiatives/leadership/team-experiences", title: "Team Experiences" },
  { slug: "initiatives/leadership/coursework", title: "Leadership Coursework" },
  { slug: "initiatives/leadership/certificate-coach", title: "Leadership Certificate Coach" },
  { slug: "initiatives/leadership/cumulative-reflection", title: "Cumulative Reflection" },
];

type SiblingItem = { slug: string; title: string };

const siblingGroups: { parent: { label: string; href: string }; items: SiblingItem[] }[] = [
  { parent: { label: "About Me", href: "/about/" }, items: aboutHubCards.map(({ slug, title }) => ({ slug, title })) },
  {
    parent: { label: "Initiatives", href: "/initiatives/" },
    items: initiativesHubCards.map(({ slug, title }) => ({ slug, title })),
  },
  { parent: { label: "Leadership Certification", href: "/initiatives/leadership/" }, items: leadershipHubCards },
  {
    parent: { label: "Speaking Engagements", href: "/initiatives/speaking/" },
    items: [{ slug: "initiatives/speaking/citl", title: "CITL Student Quick Takes series" }],
  },
  {
    parent: { label: "Study Abroad", href: "/initiatives/abroad/" },
    items: [{ slug: "initiatives/abroad/resources", title: "Abroad Resources" }],
  },
];

export function getSiblings(slug: string) {
  for (const group of siblingGroups) {
    const index = group.items.findIndex((item) => item.slug === slug);
    if (index === -1) continue;
    const prev = group.items[index - 1];
    const next = group.items[index + 1];
    return {
      parent: group.parent,
      prev: prev ? { title: prev.title, href: `/${prev.slug}/` } : undefined,
      next: next ? { title: next.title, href: `/${next.slug}/` } : undefined,
    };
  }
  return {};
}

/** Flat list for search / sitemap helpers */
export const allRoutes: { title: string; href: string; section?: string }[] = [
  { title: "Home", href: "/" },
  { title: "About Me", href: "/about/", section: "About Me" },
  { title: "Background", href: "/about/background/", section: "About Me" },
  { title: "Education", href: "/about/education/", section: "About Me" },
  { title: "Hobbies & Involvements", href: "/about/hobbies/", section: "About Me" },
  { title: "Resources I Love", href: "/about/resources/", section: "About Me" },
  { title: "Initiatives", href: "/initiatives/", section: "Initiatives" },
  { title: "Work Experience", href: "/initiatives/work/", section: "Initiatives" },
  { title: "Volunteerism & Projects", href: "/initiatives/projects/", section: "Initiatives" },
  { title: "Speaking Engagements", href: "/initiatives/speaking/", section: "Initiatives" },
  { title: "CITL Student Quick Takes series", href: "/initiatives/speaking/citl/", section: "Speaking" },
  { title: "Leadership Certification", href: "/initiatives/leadership/", section: "Initiatives" },
  {
    title: "Personal Development Plan",
    href: "/initiatives/leadership/personal-development-plan/",
    section: "Leadership",
  },
  { title: "Trainings & Workshops", href: "/initiatives/leadership/trainings/", section: "Leadership" },
  { title: "I-Programs", href: "/initiatives/leadership/i-programs/", section: "Leadership" },
  { title: "Team Experiences", href: "/initiatives/leadership/team-experiences/", section: "Leadership" },
  { title: "Leadership Coursework", href: "/initiatives/leadership/coursework/", section: "Leadership" },
  {
    title: "Leadership Certificate Coach",
    href: "/initiatives/leadership/certificate-coach/",
    section: "Leadership",
  },
  {
    title: "Cumulative Reflection",
    href: "/initiatives/leadership/cumulative-reflection/",
    section: "Leadership",
  },
  { title: "Study Abroad", href: "/initiatives/abroad/", section: "Initiatives" },
  { title: "Abroad Resources", href: "/initiatives/abroad/resources/", section: "Study Abroad" },
  { title: "Scholarships & Awards", href: "/initiatives/awards/", section: "Initiatives" },
  { title: "Contact", href: "/contact/" },
];

const surpriseSkip = new Set(["/", "/about/", "/initiatives/"]);

/** Content pages Surprise Me can land on — skip Home and the About/Initiatives hubs. */
export const surpriseRoutes = allRoutes
  .filter((route) => !surpriseSkip.has(route.href))
  .map((route) => route.href);

/**
 * Google Sites hyphenated paths → rebuilt routes.
 * Include slash variants so both live URLs and trailing-slash links resolve.
 */
export const googleSitesRedirects: Record<string, string> = {
  "/home": "/",
  "/about-me": "/about/",
  "/about-me/background": "/about/background/",
  "/about-me/education": "/about/education/",
  "/about-me/hobbies-involvements": "/about/hobbies/",
  "/about-me/resources-i-love": "/about/resources/",
  "/initiatives/work-experience": "/initiatives/work/",
  "/initiatives/volunteerism-projects": "/initiatives/projects/",
  "/initiatives/speaking-engagements": "/initiatives/speaking/",
  "/initiatives/speaking-engagements/citl-student-quick-takes-series": "/initiatives/speaking/citl/",
  "/initiatives/leadership-certification": "/initiatives/leadership/",
  "/initiatives/leadership-certification/personal-development-plan":
    "/initiatives/leadership/personal-development-plan/",
  "/initiatives/leadership-certification/trainings-workshops": "/initiatives/leadership/trainings/",
  "/initiatives/leadership-certification/i-programs": "/initiatives/leadership/i-programs/",
  "/initiatives/leadership-certification/team-experiences": "/initiatives/leadership/team-experiences/",
  "/initiatives/leadership-certification/leadership-coursework": "/initiatives/leadership/coursework/",
  "/initiatives/leadership-certification/leadership-certificate-coach":
    "/initiatives/leadership/certificate-coach/",
  "/initiatives/leadership-certification/cumulative-reflection":
    "/initiatives/leadership/cumulative-reflection/",
  "/initiatives/leadership/community-development-liaison": "/initiatives/leadership/",
  "/initiatives/leadership/technology-commercialization": "/initiatives/leadership/",
  "/initiatives/leadership-certification/community-development-liaison": "/initiatives/leadership/",
  "/initiatives/leadership-certification/technology-commercialization-certification":
    "/initiatives/leadership/",
  "/initiatives/study-abroad": "/initiatives/abroad/",
  "/initiatives/study-abroad/abroad-resources": "/initiatives/abroad/resources/",
  "/initiatives/scholarships-awards": "/initiatives/awards/",
};
