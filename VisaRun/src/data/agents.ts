import type { Agent } from '../types';

export const agents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Vietnam Visa Pro',
    rating: 4.8,
    reviewCount: 234,
    services: ['Approval Letter', 'E-Visa assistance', 'Express processing'],
    priceFrom: 15,
    reviews: [
      { author: 'Alex K.', text: 'Got approval letter in 2 hours. Smooth border crossing at Moc Bai.', rating: 5 },
      { author: 'Maria S.', text: 'Responsive on Telegram, fair prices.', rating: 5 },
    ],
  },
  {
    id: 'agent-2',
    name: 'Border VIP Saigon',
    rating: 4.5,
    reviewCount: 89,
    services: ['VIP fast-track', 'Airport pickup', 'Moc Bai escort'],
    priceFrom: 80,
    reviews: [
      { author: 'John D.', text: 'Skipped the queue at Tan Son Nhat — worth it during peak season.', rating: 5 },
      { author: 'Pavel R.', text: 'Expensive but professional service.', rating: 4 },
    ],
  },
  {
    id: 'agent-3',
    name: 'Da Nang Visa Helper',
    rating: 4.6,
    reviewCount: 56,
    services: ['Approval Letter', 'Lao Bao visa run package', 'Translation'],
    priceFrom: 20,
    reviews: [
      { author: 'Elena V.', text: 'Organized full Lao Bao run from Da Nang. No surprises.', rating: 5 },
    ],
  },
];
