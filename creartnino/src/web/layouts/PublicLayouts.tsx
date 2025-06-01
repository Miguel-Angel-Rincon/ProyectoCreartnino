import type { ReactNode } from 'react';
import Navbar from '..//components/Navbar';
import Footer from '../components/Footer';

type Props = {
  children: ReactNode;
};

const PublicLayout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <main className="container mt-4">{children}</main>
      <Footer />
    </>
  );
};

export default PublicLayout;
