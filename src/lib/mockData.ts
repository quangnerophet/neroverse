export type Topic = {
  id: string;
  name: string;
  parentId?: string;  // Optional: makes this a subtopic of the parent
};

export type Post = {
  id: string;
  topicId: string;
  title?: string;
  excerpt: string;
  fullContent?: string;
  tags?: string[];
  createdAt: string;
  likes?: number;
  tier?: 'free' | 'premium' | 'vip'; // content gating
};

export const initialTopics: Topic[] = [
  { id: '1', name: 'Philosophy' },
  { id: '2', name: 'Design' },
  { id: '3', name: 'Literature' },
  { id: '4', name: 'Technology' },
  // Subtopics of Design (parentId: '2')
  { id: '5', name: 'UI/UX', parentId: '2' },
  { id: '6', name: 'Branding', parentId: '2' },
  // Subtopics of Technology (parentId: '4')
  { id: '7', name: 'AI & Ethics', parentId: '4' },
  { id: '8', name: 'Open Source', parentId: '4' },
];

export const initialPosts: Post[] = [
  {
    id: '1',
    topicId: '1',
    excerpt: "**The unexamined life** is not worth living.",
    fullContent: "But what does it mean to truly examine one's life in the modern era, amidst constant **digital noise** and fleeting attention spans? Socrates' famous dictum challenges us to reflect on our values, beliefs, and actions. It suggests that ==a life lived without reflection is akin to sleepwalking through existence==. In today's fast-paced world, finding the time and *mental space* for such profound introspection is increasingly difficult, yet arguably more necessary than ever.",
    tags: ['Socrates', 'Wisdom', 'Reflection'],
    createdAt: new Date(Date.now() - 100000000).toISOString(),
  },
  {
    id: '2',
    topicId: '2',
    excerpt: "**Good design** is as little design as possible. Less, but better.",
    fullContent: "It concentrates on the essential aspects, and the products are ==not burdened with non-essentials==. Back to purity, back to simplicity. Dieter Rams' ten principles for good design emphasize that good design is *innovative, aesthetic, and long-lasting*. This philosophy involves **as little design as possible** — evident in classic Braun products and notably Apple's design language.",
    tags: ['Minimalism', 'DieterRams', 'Purity'],
    createdAt: new Date(Date.now() - 80000000).toISOString(),
  },
  {
    id: '3',
    topicId: '3',
    excerpt: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    tags: ['JaneAusten', 'Classic'],
    createdAt: new Date(Date.now() - 60000000).toISOString(),
  },
  {
    id: '4',
    topicId: '4',
    excerpt: "As we forge ahead into an era of artificial intelligence, we must ask ourselves not just what we can build, but what we should build.",
    fullContent: "The tool shapes the hand that wields it. The ethical implications of AI are vast and complex, touching upon issues of bias, privacy, autonomy, and the future of work. We must consider how these technologies might inadvertently exacerbate existing inequalities or create new ones. It is imperative that we establish robust ethical frameworks and regulatory guidelines to ensure that AI is developed and deployed responsibly, for the benefit of all humanity.",
    tags: ['AI', 'Ethics', 'Future'],
    createdAt: new Date(Date.now() - 40000000).toISOString(),
  },
  {
    id: '5',
    topicId: '1',
    excerpt: "We suffer ==more often in imagination== than in reality.",
    fullContent: "A stoic reminder that **our anxieties are frequently self-authored fictions**. Seneca's wisdom highlights the human tendency to catastrophize and worry about future events that may never come to pass. By recognizing this cognitive distortion, we can learn to focus our energy on the ==present moment== and deal with actual problems rather than imagined ones. *This practice of mindfulness is a core tenet of Stoicism.*",
    tags: ['Stoicism', 'Mindfulness', 'Seneca'],
    createdAt: new Date(Date.now() - 20000000).toISOString(),
  },
  {
    id: '6',
    topicId: '3',
    excerpt: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.",
    tags: ['Magic', 'Words', 'Dumbledore'],
    createdAt: new Date(Date.now() - 10000000).toISOString(),
  },
];
