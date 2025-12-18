import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Левая часть - copyright */}
          <div className="footer-left">
            <span className="footer-logo">SPP</span>
            <span className="footer-copyright">
              © {currentYear} Schedule Platform Plus.
            </span>
          </div>
          
          {/* Правая часть - ссылки */}
          <div className="footer-links">
            <Link to="/privacy-policy" className="footer-link">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="footer-link">
              Условия использования
            </Link>
            <Link to="/contact" className="footer-link">
              Контакты
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;