import { Link, NavLink, useLocation } from 'react-router-dom';

export function LinkWithQuery({ children, to, ...props }) {
  let { search } = useLocation();
  return (
    <Link to={to + search} {...props}>
      {children}
    </Link>
  );
};

export function NavLinkWithQuery({ children, to, ...props }) {
  let { search } = useLocation();
  return (
    <NavLink to={to + search} {...props}>
      {children}
    </NavLink>
  );
};
