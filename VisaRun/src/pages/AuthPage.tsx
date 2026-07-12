import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CloudBackground } from '../components/CloudBackground';

type AuthMode = 'login' | 'register';

function mapAuthError(message: string, t: (ru: string, en: string, vi?: string) => string) {
  const map: Record<string, string> = {
    'Invalid email or password': t('Неверный email или пароль', 'Invalid email or password', 'Email hoặc mật khẩu không đúng'),
    'Email already registered': t('Email уже зарегистрирован', 'Email already registered', 'Email đã được đăng ký'),
    'Password must be at least 6 characters': t('Пароль минимум 6 символов', 'Password must be at least 6 characters', 'Mật khẩu tối thiểu 6 ký tự'),
    'Full name is required': t('Укажите имя', 'Full name is required', 'Vui lòng nhập họ tên'),
    'Invalid email': t('Некорректный email', 'Invalid email', 'Email không hợp lệ'),
  };
  return map[message] ?? message;
}

export function AuthPage() {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      setError(mapAuthError(raw, t) || t('Ошибка входа', 'Login failed', 'Đăng nhập thất bại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CloudBackground />
      <div className="auth-page">
        <div className="auth-page__card card">
        <img src="/logo.svg" alt="VisaRun" className="auth-page__logo" />
        <h1>{t('Вход в VisaRun', 'Sign in to VisaRun', 'Đăng nhập VisaRun')}</h1>
        <p className="auth-page__subtitle">
          {t(
            'Создайте аккаунт, чтобы сохранять план визарана и настройки.',
            'Create an account to save your visa-run plan and settings.',
            'Tạo tài khoản để lưu kế hoạch visa run và cài đặt.',
          )}
        </p>

        <div className="auth-page__tabs">
          <button
            type="button"
            className={`auth-page__tab${mode === 'login' ? ' auth-page__tab--active' : ''}`}
            onClick={() => setMode('login')}
          >
            {t('Вход', 'Login', 'Đăng nhập')}
          </button>
          <button
            type="button"
            className={`auth-page__tab${mode === 'register' ? ' auth-page__tab--active' : ''}`}
            onClick={() => setMode('register')}
          >
            {t('Регистрация', 'Register', 'Đăng ký')}
          </button>
        </div>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-name">{t('Имя', 'Full name', 'Họ tên')}</label>
              <input
                id="auth-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('Иван Иванов', 'John Doe', 'Nguyen Van A')}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">{t('Пароль', 'Password', 'Mật khẩu')}</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <p className="auth-page__error">{error}</p>}

          <button type="submit" className="btn btn--primary auth-page__submit" disabled={loading}>
            {loading
              ? t('Загрузка...', 'Loading...', 'Đang tải...')
              : mode === 'login'
                ? t('Войти', 'Sign in', 'Đăng nhập')
                : t('Создать аккаунт', 'Create account', 'Tạo tài khoản')}
          </button>
        </form>
        </div>
      </div>
    </>
  );
}
