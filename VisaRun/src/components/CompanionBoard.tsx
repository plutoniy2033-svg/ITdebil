import { useEffect, useState } from 'react';
import type { CompanionPost } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { createCompanionPost, fetchCompanionPosts } from '../api/community';

interface CompanionBoardProps {
  initialPosts: CompanionPost[];
}

const STORAGE_KEY = 'visarun-companion-posts';

function loadLocalPosts(fallback: CompanionPost[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompanionPost[]) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalPosts(posts: CompanionPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function CompanionBoard({ initialPosts }: CompanionBoardProps) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<CompanionPost[]>(initialPosts);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchCompanionPosts();
        if (!active) return;
        setPosts(result.posts);
        setIsLocalMode(false);
      } catch {
        if (!active) return;
        setPosts(loadLocalPosts(initialPosts));
        setIsLocalMode(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [initialPosts]);

  useEffect(() => {
    if (isLocalMode) {
      saveLocalPosts(posts);
    }
  }, [posts, isLocalMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedRoute = route.trim();
    const normalizedMessage = message.trim();
    if (!normalizedRoute || normalizedMessage.length < 8) {
      setError(
        t(
          'Заполните маршрут и сообщение (минимум 8 символов).',
          'Fill route and message (minimum 8 characters).',
          'Hãy nhập tuyến đường và tin nhắn (tối thiểu 8 ký tự).',
        ),
      );
      return;
    }
    setError('');

    const payload = {
      route: normalizedRoute,
      date: date || t('Скоро', 'Soon', 'Sớm'),
      seatsNeeded: seats,
      message: normalizedMessage,
      transport: t('Не указано', 'Not specified', 'Chưa chỉ định'),
    };

    if (isLocalMode) {
      const newPost: CompanionPost = {
        id: `cp-${Date.now()}`,
        author: t('Вы', 'You', 'Bạn'),
        ...payload,
      };
      setPosts([newPost, ...posts]);
    } else {
      try {
        const result = await createCompanionPost(payload);
        setPosts(result.posts);
      } catch {
        setIsLocalMode(true);
        const newPost: CompanionPost = {
          id: `cp-${Date.now()}`,
          author: t('Вы', 'You', 'Bạn'),
          ...payload,
        };
        setPosts([newPost, ...posts]);
      }
    }

    setRoute('');
    setDate('');
    setMessage('');
    setSeats(1);
  };

  return (
    <div className="companion-board">
      {isLocalMode && (
        <p className="community-local-hint">
          {t(
            'Посты сохраняются локально. При подключении сервера они синхронизируются для всех пользователей.',
            'Posts are saved locally. When the server is connected, they sync for all users.',
            'Bài đăng lưu cục bộ. Khi máy chủ kết nối, chúng đồng bộ cho mọi người.',
          )}
        </p>
      )}

      <form className="companion-form card" onSubmit={handleSubmit}>
        <h3>{t('Найти попутчиков', 'Find companions', 'Tìm bạn đồng hành')}</h3>
        <div className="form-group">
          <label>{t('Маршрут', 'Route', 'Tuyến đường')}</label>
          <input
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder={t('Нячанг → Мокбай', 'Nha Trang → Moc Bai', 'Nha Trang → Moc Bai')}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>{t('Дата', 'Date', 'Ngày')}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t('Мест', 'Seats', 'Chỗ')}</label>
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
          <label>{t('Сообщение', 'Message', 'Tin nhắn')}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t(
              'Еду на авто, ищу 2 человек, скинемся на бензин',
              'Driving, looking for 2 people to split fuel',
              'Đi ô tô, tìm 2 người chia tiền xăng',
            )}
            rows={3}
          />
        </div>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {t('Опубликовать', 'Post', 'Đăng')}
        </button>
        {error && <p className="form-hint">{error}</p>}
      </form>

      <div className="companion-list">
        {loading ? (
          <p className="text-muted">{t('Загрузка...', 'Loading...', 'Đang tải...')}</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="companion-post card">
              <div className="companion-post__header">
                <strong>{post.author}</strong>
                <span className="text-muted">{post.date}</span>
              </div>
              <div className="companion-post__route">{post.route}</div>
              <p className="companion-post__message">{post.message}</p>
              <div className="companion-post__meta">
                <span className="tag">{post.transport}</span>
                <span>
                  {t(
                    `Ищу ${post.seatsNeeded} чел.`,
                    `Need ${post.seatsNeeded} people`,
                    `Cần ${post.seatsNeeded} người`,
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
