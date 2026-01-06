import React from 'react';
export default function MapView({ markers = [], height = '280px' }) {
  return (
    <div style={{ minHeight: height }}>
      <div
        style={{
          width: '100%',
          height,
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.06)',
          background:
            'linear-gradient(135deg, rgba(14,165,233,0.03), rgba(99,102,241,0.02))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden="true"
      >
        <div style={{ textAlign: 'center', color: '#334155' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Map disabled</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Google Maps removed. Use the address / lat-lng fields instead.
          </div>
        </div>
      </div>

      {markers && markers.length > 0 && (
        <ul style={{ marginTop: 10, paddingLeft: 16 }}>
          {markers.map((m, i) => (
            <li key={i} style={{ fontSize: 13, color: '#0f172a' }}>
              {m.label || `Marker ${i + 1}`} — {m.city || m.location || `${m.lat}, ${m.lng}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}