/* ──────────────────────────────────────────────
   SupportNow · Portfolio Shell — the app registry.
   One entry per portfolio app. This is the only file that
   changes when an app is added, renamed, or retired.

   Per app:
     desc     one line, used in the footer identity column
     links    the nav links, first one renders active
     cta      the nav button
     footCta  the footer's primary call to action
     shareUrl what the footer's share field hands out
   ────────────────────────────────────────────── */

window.PF_APPS = [
  {
    key: 'grants',
    name: 'Grants',
    icon: 'fa-hand-holding-dollar',
    desc: 'Funding built for small nonprofits, without the grant writer.',
    home: '#',
    shareUrl: 'https://supportnow.org/grants',
    links: [
      { label: 'Find Grants',  href: '#' },
      { label: 'How it Works', href: '#' },
      { label: 'About',        href: '#' }
    ],
    cta: { label: 'Start Now', href: '#' },
    footCta: {
      head: 'Ready to find funding?',
      desc: 'Tell us about your work once and we will match you to grants you can actually win.',
      label: 'Start Now', href: '#'
    }
  },
  {
    key: 'fundingcoach',
    name: 'FundingCoach',
    icon: 'fa-compass',
    desc: 'Free one-on-one coaching through the whole fundraising journey.',
    home: '#',
    shareUrl: 'https://supportnow.org/fundingcoach',
    links: [
      { label: 'About',    href: '#' },
      { label: 'Families', href: '#' },
      { label: 'Grants',   href: '#' }
    ],
    cta: { label: 'Start Now', href: '#' },
    footCta: {
      head: 'Ready to fund what your child needs?',
      desc: 'Tell us your situation once and we will match you with a coach who has funded it before.',
      label: 'Start Now', href: '#'
    }
  },
  {
    key: 'podcast',
    name: 'Podcast',
    icon: 'fa-microphone-lines',
    desc: 'Conversations with families and the people who help them.',
    home: '#',
    shareUrl: 'https://supportnow.org/podcast',
    links: [
      { label: 'Episodes', href: '#' },
      { label: 'Guests',   href: '#' },
      { label: 'About',    href: '#' }
    ],
    cta: { label: 'Listen Now', href: '#' },
    footCta: {
      head: 'Never miss an episode',
      desc: 'New conversations every other week, wherever you already listen.',
      label: 'Listen Now', href: '#'
    }
  },
  {
    key: 'advocacy',
    name: 'Advocacy',
    icon: 'fa-people-roof',
    desc: 'Advocates who have been exactly where you are.',
    home: '#',
    shareUrl: 'https://supportnow.org/advocacy',
    links: [
      { label: 'Find an Advocate', href: '#' },
      { label: 'How it Works',     href: '#' },
      { label: 'For Advocates',    href: '#' }
    ],
    cta: { label: 'Get Matched', href: '#' },
    footCta: {
      head: 'Find your advocate',
      desc: 'Tell us what you are navigating and we will match you with someone who has been there.',
      label: 'Get Matched', href: '#'
    }
  },
  {
    key: 'emergency',
    name: 'Emergency Contact',
    icon: 'fa-shield-heart',
    desc: 'One page on your fridge with everything anyone caring for your kids needs to know.',
    home: 'index.html',
    shareUrl: 'https://supportnow.org/emergency',
    links: [
      { label: 'How It Works',   href: 'index.html#how' },
      { label: 'Emergency Card', href: 'questionnaire.html' },
      { label: 'Safety Score',   href: 'safety-score.html' }
    ],
    /* The product's call to action. shell-app.js swaps this for the campaign's
       while EC.PROMO.active, so the registry stays about the product. */
    cta: { label: 'Create My Emergency Card', href: 'questionnaire.html' },
    footCta: {
      head: 'Ready to make yours?',
      desc: 'Answer the questionnaire once and print one page for the fridge, with a code for each child.',
      label: 'Create My Emergency Card', href: 'questionnaire.html'
    }
  },
  {
    key: 'giving',
    name: 'Giving',
    icon: 'fa-hand-holding-heart',
    desc: 'Invite your community into something that matters.',
    home: '#',
    shareUrl: 'https://supportnow.org/giving',
    links: [
      { label: 'How it Works',   href: '#' },
      { label: 'Family Stories', href: '#' },
      { label: 'Questions',      href: '#' }
    ],
    cta: { label: 'Start a Fund', href: '#' },
    footCta: {
      head: 'Start your fund',
      desc: 'Give the people around you a clear way to show up for your family.',
      label: 'Start a Fund', href: '#'
    }
  },
  {
    key: 'meals',
    name: 'Meals',
    icon: 'fa-utensils',
    desc: 'A full calendar of dinners, coordinated for you.',
    home: '#',
    shareUrl: 'https://supportnow.org/meals',
    links: [
      { label: 'How it Works',   href: '#' },
      { label: 'For Organizers', href: '#' },
      { label: 'Questions',      href: '#' }
    ],
    cta: { label: 'Start a Meal Train', href: '#' },
    footCta: {
      head: 'Fill your calendar',
      desc: 'Set it up once and let people claim the nights that work for them.',
      label: 'Start a Meal Train', href: '#'
    }
  },
  {
    key: 'todos',
    name: 'Todos',
    icon: 'fa-list-check',
    desc: 'Say what you need once, then let people claim it.',
    home: '#',
    shareUrl: 'https://supportnow.org/todos',
    links: [
      { label: 'How it Works', href: '#' },
      { label: 'For Helpers',  href: '#' },
      { label: 'Questions',    href: '#' }
    ],
    cta: { label: 'Create a List', href: '#' },
    footCta: {
      head: 'Ask for what you need',
      desc: 'Write the list once. People claim what they can, with no back and forth.',
      label: 'Create a List', href: '#'
    }
  },
  {
    key: 'updates',
    name: 'Updates',
    icon: 'fa-tower-broadcast',
    desc: 'Tell everyone once, on your own terms.',
    home: '#',
    shareUrl: 'https://supportnow.org/updates',
    links: [
      { label: 'How it Works', href: '#' },
      { label: 'Who Can See',  href: '#' },
      { label: 'Questions',    href: '#' }
    ],
    cta: { label: 'Post an Update', href: '#' },
    footCta: {
      head: 'Share your first update',
      desc: 'Tell everyone at once, and choose exactly who gets to see it.',
      label: 'Post an Update', href: '#'
    }
  }
];

/* Shown in the lower footer, the same for every app. */
window.PF_SOCIAL = [
  { label: 'Instagram', icon: 'fa-instagram', href: '#' },
  { label: 'Facebook',  icon: 'fa-facebook-f', href: '#' },
  { label: 'LinkedIn',  icon: 'fa-linkedin-in', href: '#' },
  { label: 'YouTube',   icon: 'fa-youtube', href: '#' }
];
