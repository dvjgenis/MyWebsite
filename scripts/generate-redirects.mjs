#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const legacyHtml = {
  "Home.html": "/",
  "About Me.html": "/about/",
  "Background.html": "/about/background/",
  "Education.html": "/about/education/",
  "Hobbies  Involvements.html": "/about/hobbies/",
  "Resources I Love.html": "/about/resources/",
  "Initiatives.html": "/initiatives/",
  "Work Experience.html": "/initiatives/work/",
  "Volunteerism  Projects.html": "/initiatives/projects/",
  "Technical Projects.html": "/initiatives/projects/",
  "Speaking Engagements.html": "/initiatives/speaking/",
  "CITL Student Quick Takes series.html": "/initiatives/speaking/citl/",
  "Leadership Certification.html": "/initiatives/leadership/",
  "Personal Development Plan.html": "/initiatives/leadership/personal-development-plan/",
  "Trainings  Workshops.html": "/initiatives/leadership/trainings/",
  "I-Programs.html": "/initiatives/leadership/i-programs/",
  "Team Experiences.html": "/initiatives/leadership/team-experiences/",
  "Leadership Coursework.html": "/initiatives/leadership/coursework/",
  "Leadership Certificate Coach.html": "/initiatives/leadership/certificate-coach/",
  "Community Development Liaison.html": "/initiatives/leadership/",
  "Cumulative Reflection.html": "/initiatives/leadership/cumulative-reflection/",
  "Technology Commercialization Certification.html": "/initiatives/leadership/",
  "Study Abroad.html": "/initiatives/abroad/",
  "Abroad Resources.html": "/initiatives/abroad/resources/",
  "Scholarships  Awards.html": "/initiatives/awards/",
  "Contact.html": "/contact/",
};

const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

function writeRedirect(filename, to) {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${to}"><title>Redirecting…</title></head><body><p><a href="${to}">Continue</a></p></body></html>`;
  fs.writeFileSync(path.join(PUBLIC, filename), html);
}

for (const [from, to] of Object.entries(legacyHtml)) {
  writeRedirect(from, to);
  const encoded = from.replace(/ /g, "%20");
  if (encoded !== from) writeRedirect(encoded, to);
}

console.log("Legacy redirect HTML files written to public/");
