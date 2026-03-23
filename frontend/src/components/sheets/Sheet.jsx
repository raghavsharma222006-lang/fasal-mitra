export default function Sheet({ title, icon, onClose, children }) {
  return (
    <div
      className="sheet-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sheet">
        {/* Sticky header */}
        <div className="sheet-header">
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
            {icon} {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#374151',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
