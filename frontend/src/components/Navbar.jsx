import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Typography } from 'antd';
import { UserOutlined, TagOutlined, BarChartOutlined, QuestionCircleOutlined, DashboardOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { COLORS } from './colorscheme';
import { ensureAuthFreshness, scheduleAuthExpiryTimer, clearAuthSession } from '../utils/authSession';
import useUserRole from '../hooks/useUserRole';

const { Title } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAdmin, isLoading } = useUserRole();

  useEffect(() => {
    const updateLoginState = () => {
      ensureAuthFreshness();
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      scheduleAuthExpiryTimer();
    };
    updateLoginState();
    window.addEventListener('authChange', updateLoginState);
    return () => window.removeEventListener('authChange', updateLoginState);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    clearAuthSession();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <header style={{background: COLORS.gradients.header, padding: isMobile ? '0 8px' : '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: isMobile ? 52 : 64, boxShadow: '0 2px 8px #f0f1f2'}}>
      <Link to='/' style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <TagOutlined style={{fontSize: isMobile ? 18 : 24, color: COLORS.primary.main, transform: 'rotate(-20deg)'}} />
        <Title level={isMobile ? 5 : 4} style={{margin: 0, color: COLORS.neutral.white, letterSpacing: '0.5px', fontSize: isMobile ? '0.9rem' : undefined, whiteSpace: 'nowrap'}}>TicketApp</Title>
      </Link>
      <nav style={{display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24}}>
        <Link to='/' data-cy='home-link' style={{color: COLORS.neutral.white, fontWeight: '500', fontSize: isMobile ? 13 : undefined}}>Eventos</Link>
        {isLoggedIn && <Link to='/help' data-cy='help-link' style={{color: COLORS.neutral.white, fontWeight: '500', fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4}}><QuestionCircleOutlined />{!isMobile && <span>Ayuda</span>}</Link>}
        {isLoggedIn && isAdmin && !isLoading && (<><Link to='/admin' data-cy='admin-link' style={{color: COLORS.neutral.white, fontWeight: '500', fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4}}><DashboardOutlined />{!isMobile && <span>Panel de administrador</span>}</Link><Link to='/admin/statistics' data-cy='statistics-link' style={{color: COLORS.neutral.white, fontWeight: '500', fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4}}><BarChartOutlined />{!isMobile && <span>Estadísticas</span>}</Link></>)}
        {!isLoggedIn && (<><Link to='/login' data-cy='login-link' style={{color: COLORS.neutral.white, fontWeight: '500', fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4}}><LoginOutlined />{!isMobile && <span>Iniciar sesión</span>}</Link><Link to='/register' data-cy='register-link' style={{color: COLORS.neutral.white, fontWeight: '500', fontSize: isMobile ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 4}}><UserAddOutlined />{!isMobile && <span>Registrarse</span>}</Link></>)}
        {isLoggedIn && (<div ref={dropdownRef} style={{position: 'relative'}}><Avatar data-cy='user-menu' icon={<UserOutlined />} onClick={() => setDropdownOpen(!dropdownOpen)} style={{backgroundColor: COLORS.primary.main, cursor: 'pointer', width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, fontSize: isMobile ? 16 : 20}} />{dropdownOpen && (<div style={{position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08)', minWidth: '160px', zIndex: 1050, overflow: 'hidden'}}><div data-cy='profile-link' onClick={handleProfileClick} style={{padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: 'rgba(0,0,0,0.88)', borderBottom: '1px solid #f0f0f0'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Perfil</div><div data-cy='logout-button' onClick={handleLogout} style={{padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: 'rgba(0,0,0,0.88)'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Cerrar sesión</div></div>)}</div>)}
      </nav>
    </header>
  );
};

export default Navbar;
