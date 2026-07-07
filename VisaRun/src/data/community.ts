import type { CompanionPost, BorderReport } from '../types';

export const companionPosts: CompanionPost[] = [
  {
    id: 'cp-1',
    author: 'Dmitry',
    route: 'Nha Trang → Moc Bai',
    date: 'Friday, 10 Jul',
    seatsNeeded: 2,
    message: 'Driving my car, looking for 2 people to split fuel. Leave 5 AM, back by evening.',
    transport: 'Private car',
  },
  {
    id: 'cp-2',
    author: 'Anna',
    route: 'HCMC → Moc Bai',
    date: 'Saturday, 11 Jul',
    seatsNeeded: 3,
    message: 'Booking a minivan, 3 seats available. ~800k VND per person round trip.',
    transport: 'Minivan',
  },
  {
    id: 'cp-3',
    author: 'Mike',
    route: 'Da Nang → Lao Bao',
    date: 'Sunday, 12 Jul',
    seatsNeeded: 1,
    message: 'Taking sleeping bus, one spare seat. Can help with Laos visa on arrival.',
    transport: 'Sleeping bus',
  },
];

export const borderReports: BorderReport[] = [
  {
    id: 'br-1',
    checkpointId: 'moc-bai',
    author: 'Sergey',
    time: '2 hours ago',
    message: 'Queue on Vietnam side ~2.5 hours. Cambodia stamp took 20 min. Helpers asking 500k on Laos side.',
  },
  {
    id: 'br-2',
    checkpointId: 'moc-bai',
    author: 'Lisa',
    time: '5 hours ago',
    message: 'Surprisingly fast today — total 45 min both ways. Go before 8 AM.',
  },
  {
    id: 'br-3',
    checkpointId: 'lao-bao',
    author: 'Tom',
    time: '1 hour ago',
    message: 'Laos side very slow. Bring water and snacks. USD only for visa.',
  },
  {
    id: 'br-4',
    checkpointId: 'tan-son-nhat',
    author: 'Kate',
    time: '30 min ago',
    message: 'Immigration line at T2 about 1 hour. Pre-arrival QR checked at gate.',
  },
  {
    id: 'br-5',
    checkpointId: 'cau-treo',
    author: 'Ivan',
    time: '3 hours ago',
    message: 'Quiet border, no queues. But ATM on Laos side was broken — bring cash.',
  },
];
