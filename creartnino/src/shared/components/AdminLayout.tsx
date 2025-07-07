// src/layouts/AdminLayout.tsx
// src/layouts/AdminLayout.tsx
import type { ReactNode } from 'react';
import Sidebar from './siderbar';

type Props = {
  children: ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: 250, padding: '2rem', width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
