import { Link, useLocation } from 'react-router-dom';
import { FiDollarSign, FiPackage, FiUsers, FiCalendar, FiSettings } from 'react-icons/fi';
import { MdOutlineDashboard } from 'react-icons/md';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

const MobileNavbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: <MdOutlineDashboard size={22} />, label: "Tableau de bord" },
    { path: "/transactions", icon: <FiDollarSign size={22} />, label: "Transactions" },
    { path: "/products", icon: <FiPackage size={22} />, label: "Stock" },
    { path: "/employees", icon: <FiUsers size={22} />, label: "Employés" },
    { path: "/absences", icon: <FiCalendar size={22} />, label: "Absences" },
    { path: "/settings", icon: <FiSettings size={22} />, label: "Paramètres" },
  ];

  return (
    <Nav 
      fixed="bottom" 
      className="d-md-none bg-white shadow-sm border-top py-2 z-3"
      style={{ height: '70px' }}
    >
      <Container fluid className="h-100">
        <div className="d-flex justify-content-around align-items-center h-100">
          {navItems.map((item) => (
            <Nav.Link 
              key={item.path}
              as={Link}
              to={item.path}
              className={`d-flex flex-column align-items-center justify-content-center text-decoration-none p-1 ${
                location.pathname === item.path 
                  ? 'text-primary' 
                  : 'text-secondary'
              }`}
              style={{ flex: '1' }}
            >
              <div className={`p-2 rounded-circle ${
                location.pathname === item.path ? 'bg-primary bg-opacity-10' : ''
              }`}>
                {item.icon}
              </div>
              <span className="fs-tiny mt-1 fw-medium">{item.label}</span>
            </Nav.Link>
          ))}
        </div>
      </Container>
    </Nav>
  );
};

export default MobileNavbar;