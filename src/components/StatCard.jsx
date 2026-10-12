import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/** One number with a label. With `to`, the whole card is a link. */
function StatCard({ label, value, detail, icon: Icon, color, to }) {
  const content = (
    <>
      <div className="stat-top">
        <div className={`stat-icon ${color}`}>
          <Icon size={19} />
        </div>

        {to && <ArrowUpRight size={17} className="stat-arrow" />}
      </div>

      <p className="stat-label">{label}</p>
      <h3>{value}</h3>
      <span className="stat-detail">{detail}</span>
    </>
  );

  return to ? (
    <Link className="stat-card link" to={to}>
      {content}
    </Link>
  ) : (
    <article className="stat-card">{content}</article>
  );
}

export default StatCard;
