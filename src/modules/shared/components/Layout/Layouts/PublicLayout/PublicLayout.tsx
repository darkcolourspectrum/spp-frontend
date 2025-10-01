/**
 * PublicLayout - для публичных страниц (Login, Register)
 * Без Header и Footer - чистая страница
 */

import { ReactNode } from 'react';
import './publicLayout.css';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="public-layout">
      {children}
    </div>
  );
};

export default PublicLayout;