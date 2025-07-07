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
      <main >{children}</main>
      <Footer />
    </>
  );
};

export default PublicLayout;
