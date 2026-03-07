import type { Locale } from '@/lib/i18n/translations';

export type I18n<T = string> = Record<Locale, T>;

export interface Founder {
  slug: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  bio: I18n;
  skills: string[];
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export interface TimelineEvent {
  date: string;
  title: I18n;
  description: I18n;
}

export const founders: Founder[] = [
  {
    slug: 'bruno-jorba',
    name: 'Bruno Jorba',
    role: 'CEO & Co-Founder',
    location: 'Montevideo, Uruguay',
    avatar: '/images/founders/bruno-jorba.webp',
    bio: {
      en: 'Bruno drives the vision behind Oriental Labs and focuses on turning ideas into real products. He is passionate about building simple, useful, and well-crafted digital solutions, paying close attention to both product and experience. He constantly explores new ideas, technologies, and better ways to improve what already exists.',
      es: 'Bruno impulsa la visión detrás de Oriental Labs y se enfoca en transformar ideas en productos reales. Le interesa construir soluciones digitales simples, útiles y bien pensadas, cuidando cada detalle del producto y la experiencia. Constantemente explora nuevas ideas, tecnologías y formas de mejorar lo que ya existe.',
    },
    skills: [],
    linkedin: 'https://www.linkedin.com/in/bruno-jorba-cabrera-a93760173/',
    github: 'https://github.com/Brunito06',
  },
  {
    slug: 'emiliano-rodriguez',
    name: 'Emiliano Rodriguez',
    role: 'CTO & Co-Founder',
    location: 'Montevideo, Uruguay',
    avatar: '/images/founders/emiliano-rodriguez.webp',
    bio: {
      en: 'Emiliano leads the architecture and technical development of projects at Oriental Labs. He focuses on designing solid, scalable, and well-structured systems, ensuring that every product runs efficiently and reliably. He enjoys solving complex problems, optimizing processes, and turning ideas into well-engineered technological solutions.',
      es: 'Emiliano lidera la arquitectura y el desarrollo técnico de los proyectos en Oriental Labs. Se enfoca en diseñar sistemas sólidos, escalables y bien estructurados, asegurando que cada producto funcione de forma eficiente y confiable. Le apasiona resolver problemas complejos, optimizar procesos y convertir ideas en soluciones tecnológicas bien construidas.',
    },
    skills: [],
    github: 'https://github.com/emirod1955',
  },
];

export const timeline: TimelineEvent[] = [
  {
    date: 'Early 2023',
    title: {
      en: 'Started building together',
      es: 'Comenzaron a construir juntos',
    },
    description: {
      en: 'Bruno and Emiliano met during a university hackathon. They kept building together after — side projects, late nights, lots of iterations.',
      es: 'Bruno y Emiliano se conocieron en un hackathon universitario. Siguieron construyendo juntos — proyectos paralelos, noches largas, muchas iteraciones.',
    },
  },
  {
    date: 'Mid 2023',
    title: {
      en: 'First client, first product',
      es: 'Primer cliente, primer producto',
    },
    description: {
      en: 'Landed their first paid client — a local startup needing a redesign and an AI chatbot. Shipped in three weeks.',
      es: 'Consiguieron su primer cliente pago — una startup local que necesitaba un rediseño y un chatbot de AI. Entregado en tres semanas.',
    },
  },
  {
    date: 'Early 2024',
    title: {
      en: 'Oriental Labs is born',
      es: 'Nace Oriental Labs',
    },
    description: {
      en: 'After multiple successful projects, they made it official. Oriental Labs launched as a Uruguayan software & AI studio.',
      es: 'Tras múltiples proyectos exitosos, lo hicieron oficial. Oriental Labs se lanzó como un estudio de software y AI uruguayo.',
    },
  },
  {
    date: 'Late 2024',
    title: {
      en: 'Growing & expanding',
      es: 'Creciendo y expandiéndose',
    },
    description: {
      en: 'Expanded to serve clients internationally, with a focus on Latin American startups and global SaaS companies.',
      es: 'Se expandieron para atender clientes internacionales, con foco en startups latinoamericanas y empresas SaaS globales.',
    },
  },
];
