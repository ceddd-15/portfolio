/**
 * Curriculum Vitae Data (Strict Verbatim Preservation)
 */

export const CV_DATA = {
  fullName: 'JOSH CEDRICK M. CORPUZ',
  displayName: 'Josh Cedrick M. Corpuz',
  handle: 'ceddd-15',
  program: 'Bachelor of Computer Science',
  contact: {
    email: 'josh.corpuz@ciit.edu.ph',
    phone: '+63 950 244 618',
    address: 'Phase 2, Knights of Columbus, Antipolo City',
    githubUrl: 'https://github.com/ceddd-15',
    githubLabel: 'github.com/ceddd-15',
  },
  summary:
    'Intermediate web and application developer with 2 years of experience; intermediate experience with full-stack development. Proficient in C++, HTML, CSS, and Dart, as well as MySQL and Firebase for database management.',
  education: [
    {
      institution: 'CIIT College of Innovation and Integrated Technology',
      program: 'Bachelor of Computer Science',
      metric: 'Cumulative GPA: 3.28/4.00',
      period: '2024 - Present',
      cvPeriod: '2024 - Present',
      accent: true,
    },
    {
      institution: 'Sumulong Memorial High School',
      program: 'Science, Technology, Engineering, and Mathematics - STEM',
      metric: 'Cumulative GWA: 95/100',
      period: '2022 - 2024',
      cvPeriod: '2022-2024',
      accent: false,
    },
  ],
  experience: [
    {
      role: 'Work Immersion',
      organization: 'Sumulong Memorial High School',
      period: 'January - April, 2024',
      bullets: [
        "Worked on scale model of improved version of our school's open space",
        'Designed the model using SketchUp',
      ],
    },
  ],
  skills: [
    {
      category: 'Programming Languages',
      level: 'Intermediate',
      accentLevel: true,
      items: ['C++', 'HTML', 'CSS', 'JavaScript', 'PHP', 'Kotlin', 'Dart'],
    },
    {
      category: 'Database Management',
      level: 'Intermediate',
      accentLevel: true,
      items: ['MySQL', 'SQLite', 'Firebase'],
    },
    {
      category: 'Hardware',
      level: 'Beginner',
      accentLevel: false,
      items: ['Soldering'],
    },
  ],
};
