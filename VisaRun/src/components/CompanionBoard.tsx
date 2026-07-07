import { useState } from 'react';
import type { CompanionPost } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CompanionBoardProps {
  initialPosts: CompanionPost[];
}

export function CompanionBoard({ initialPosts }: CompanionBoardProps) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState(initialPosts);
  const [route, setRoute] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [seats, setSeats] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!route || !message) return;

    const newPost: CompanionPost = {
      id: `cp-${Date.now()}`,
      author: t('Вы', 'You'),
      route,
      date: date || t('Скоро', 'Soon'),
      seatsNeeded: seats,
      message,
      transport: t('Не указано', 'Not specified'),
    };
    setPosts([newPost, ...posts]);
    setRoute('');
    setDate('');
    setMessage('');
    setSeats(1);
  };

  return (
    <div className="companion-board">
      <form className="companion-form card" onSubmit={handleSubmit}>
        <h3>{t('Найти попутчиков', 'Find companions')}</h3>
        <div className="form-group">
          <label>{t('Маршрут', 'Route')}</label>
          <input
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder={t('Нячанг → Мокбай', 'Nha Trang → Moc Bai')}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>{t('Дата', 'Date')}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t('Мест', 'Seats')}</label>
            <input
              type="number"
              min={1}
              max={10}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="form-group">
          <label>{t('Сообщение', 'Message')}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t(
              'Еду на авто, ищу 2 человек, скинемся на бензин',
              'Driving, looking for 2 people to split fuel',
            )}
            rows={3}
          />
        </div>
        <button type="submit" className="btn btn--primary">
          {t('Опубликовать', 'Post')}
        </button>
      </form>

      <div className="companion-list">
        {posts.map((post) => (
          <div key={post.id} className="companion-post card">
            <div className="companion-post__header">
              <strong>{post.author}</strong>
              <span className="text-muted">{post.date}</span>
            </div>
            <div className="companion-post__route">{post.route}</div>
            <p className="companion-post__message">{post.message}</p>
            <div className="companion-post__meta">
              <span className="tag">{post.transport}</span>
              <span>{t(`Ищу ${post.seatsNeeded} чел.`, `Need ${post.seatsNeeded} people`)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
