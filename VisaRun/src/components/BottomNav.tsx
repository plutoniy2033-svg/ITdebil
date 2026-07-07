import { NavLink } from 'react-router-dom';
import { navItems } from '../config/navConfig';
import { useLanguage } from '../context/LanguageContext';
import { NavIcon } from './NavIcon';

export function BottomNav() {
  const { t } = useLanguage();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `bottom-nav__link${isActive ? ' bottom-nav__link--active' : ''}`
          }
        >
          <span className="bottom-nav__icon">
            <NavIcon name={item.icon} />
          </span>
          <span className="bottom-nav__label">{t(item.labelRu, item.labelEn)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
