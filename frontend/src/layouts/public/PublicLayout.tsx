import { Outlet } from 'react-router-dom';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';

export default function PublicLayout() {
  return (
    <div>
      {/* Navbar menetap di atas */}
      <LandingNavbar />
      
      {/* Konten halaman yang berubah sesuai rute */}
      <main>
        <Outlet />
      </main>
      
      {/* Footer menetap di bawah */}
      <LandingFooter />
    </div>
  );
}
