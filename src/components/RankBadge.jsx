// Shared by RecordCard and CharacterCard so both accordion-style cards show
// the same podium image (top 3) or plain "#N" badge for everything else.
export default function RankBadge({ rank }) {
  if (rank === null || rank === undefined) {
    return null;
  }

  if (rank === 1) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}first.png`}
        alt="1st place"
        className="team-rank-image-inline"
      />
    );
  }

  if (rank === 2) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}second.png`}
        alt="2nd place"
        className="team-rank-image-inline"
      />
    );
  }

  if (rank === 3) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}third.png`}
        alt="3rd place"
        className="team-rank-image-inline"
      />
    );
  }

  return <span className="team-rank-badge-inline">#{rank}</span>;
}
