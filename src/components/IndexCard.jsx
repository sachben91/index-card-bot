export default function IndexCard({
  card,
  loading,
  isAdmin,
  editing,
  editText,
  onEditChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) {
  return (
    <>
      <div className="index-card">
        {loading ? (
          <span className="card-text loading">—</span>
        ) : !card ? (
          <span className="card-text empty">No cards yet.</span>
        ) : editing ? (
          <textarea
            className="card-textarea"
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            autoFocus
          />
        ) : (
          <p className="card-text">{card.text}</p>
        )}
      </div>

      {isAdmin && card && !loading && (
        <div className="card-admin-bar">
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={onSave}>Save</button>
              <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={onEdit}>Edit</button>
              <button className="btn btn-danger" onClick={onDelete}>Delete</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
