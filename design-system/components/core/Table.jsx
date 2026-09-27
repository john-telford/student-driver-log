import React from 'react';

export function Table({ columns = [], rows = [], zebra = true, dense = false }) {
  const pad = dense ? '8px 16px' : '12px 16px';
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr style={{ background: 'color-mix(in oklab, var(--muted) 40%, transparent)', borderBottom: '1px solid var(--border)' }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  padding: pad, textAlign: c.align || 'left',
                  fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)', color: 'var(--muted-foreground)', whiteSpace: 'nowrap',
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid var(--border)',
                background: zebra && i % 2 === 1 ? 'color-mix(in oklab, var(--muted) 20%, transparent)' : 'transparent',
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: pad, textAlign: c.align || 'left', color: 'var(--foreground)',
                    fontVariantNumeric: c.numeric ? 'tabular-nums' : 'normal',
                  }}
                >
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
