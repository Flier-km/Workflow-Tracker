const STATUS_CLASSES = {
  "Draft": "badge-draft",
  "Submitted": "badge-submitted",
  "Under Review": "badge-under_review",
  "Need More Information": "badge-need_more_information",
  "Approved": "badge-approved",
  "Rejected": "badge-rejected",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_CLASSES[status] || "badge-draft"}`}>
      {status}
    </span>
  );
}
