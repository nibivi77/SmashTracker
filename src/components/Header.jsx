import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <nav>
        <Link to="/new">New Match</Link>
        {' '}
        <Link to="/matches">Matches</Link>
      </nav>
    </header>
  );
}