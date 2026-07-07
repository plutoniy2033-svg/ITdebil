import type { Tour } from '../types';

export const tours: Tour[] = [
  {
    id: 'tour-1',
    from: 'Ho Chi Minh City',
    to: 'Moc Bai',
    checkpointId: 'moc-bai',
    departure: '06:00 daily',
    priceUsd: 35,
    seatsLeft: 3,
    vehicle: '9-seat minivan',
  },
  {
    id: 'tour-2',
    from: 'Ho Chi Minh City',
    to: 'Moc Bai',
    checkpointId: 'moc-bai',
    departure: '07:30 daily',
    priceUsd: 30,
    seatsLeft: 6,
    vehicle: '16-seat van',
  },
  {
    id: 'tour-3',
    from: 'Da Nang',
    to: 'Lao Bao',
    checkpointId: 'lao-bao',
    departure: '20:00 (sleeping bus)',
    priceUsd: 45,
    seatsLeft: 2,
    vehicle: 'Sleeping bus',
  },
  {
    id: 'tour-4',
    from: 'Hanoi',
    to: 'Cau Treo',
    checkpointId: 'cau-treo',
    departure: '05:00 daily',
    priceUsd: 50,
    seatsLeft: 4,
    vehicle: '9-seat minivan',
  },
];
