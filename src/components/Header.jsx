import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <nav>
        <Link to="/new">New Record</Link>
        {' '}
        <Link to="/records">Records</Link>
      </nav>
    </header>
  );
}