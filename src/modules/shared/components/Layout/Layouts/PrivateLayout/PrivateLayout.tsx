/**
 * PrivateLayout - для защищенных страниц
 * С Header и Footer
 */

import { ReactNode } from 'react';
import Header from '@/modules/shared/components/Layout/Header';
import Footer from '@/modules/shared/components/Layout/Footer';
import './privateLayout.css';

interface PrivateLayoutProps {
  children: ReactNode;
}

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  return (
    <div className="private-layout">
      <Header />
      <main className="private-layout-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PrivateLayout;