import { NavLink } from 'react-router-dom';
import { navItems } from '../config/navConfig';
import { useLanguage } from '../context/LanguageContext';
import { useSidebar } from '../context/SidebarContext';
import { NavIcon } from './NavIcon';
export function Sidebar() {
  const { t } = useLanguage();
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <button
          type="button"
          className="sidebar__toggle"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t('Развернуть панель', 'Expand sidebar') : t('Свернуть панель', 'Collapse sidebar')}
          title={collapsed ? t('Развернуть панель', 'Expand sidebar') : t('Свернуть панель', 'Collapse sidebar')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            {collapsed ? (
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
            title={collapsed ? t(item.labelRu, item.labelEn) : undefined}
          >
            <span className="sidebar__icon">
              <NavIcon name={item.icon} />
            </span>
            {!collapsed && <span className="sidebar__label">{t(item.labelRu, item.labelEn)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
