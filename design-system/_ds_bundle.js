/* @ds-bundle: {"format":4,"namespace":"StudentDriverLogDesignSystem_97c292","components":[{"name":"BrandMark","sourcePath":"components/brand/BrandMark.jsx"},{"name":"ProgressBar","sourcePath":"components/brand/ProgressBar.jsx"},{"name":"SignCard","sourcePath":"components/brand/SignCard.jsx"},{"name":"SignPanel","sourcePath":"components/brand/SignPanel.jsx"},{"name":"StatTile","sourcePath":"components/brand/StatTile.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Dialog","sourcePath":"components/core/Dialog.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Label","sourcePath":"components/core/Label.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Table","sourcePath":"components/core/Table.jsx"},{"name":"Textarea","sourcePath":"components/core/Textarea.jsx"},{"name":"Toast","sourcePath":"components/core/Toast.jsx"},{"name":"AppHeader","sourcePath":"components/navigation/AppHeader.jsx"},{"name":"PageFooter","sourcePath":"components/navigation/PageFooter.jsx"}],"sourceHashes":{"components/brand/BrandMark.jsx":"95c4c9259454","components/brand/ProgressBar.jsx":"6d81181552df","components/brand/SignCard.jsx":"c8beaa22fee5","components/brand/SignPanel.jsx":"41e1b2fa23ea","components/brand/StatTile.jsx":"e87531801dcc","components/core/Button.jsx":"380af8392029","components/core/Card.jsx":"c689ae768d04","components/core/Dialog.jsx":"0f0ad28d3651","components/core/Input.jsx":"af0df829c9dc","components/core/Label.jsx":"099a839bb701","components/core/Select.jsx":"9142b08eb47c","components/core/Table.jsx":"40d54292153e","components/core/Textarea.jsx":"a5e733912087","components/core/Toast.jsx":"1e95213fc9c2","components/navigation/AppHeader.jsx":"ea7ae1c7ae0e","components/navigation/PageFooter.jsx":"e0f3fea6c9a9","ui_kits/ios/MobileApp.jsx":"32c5e9605cd7","ui_kits/ios/ios-frame.jsx":"24642b887be3","ui_kits/web/AboutScreen.jsx":"ff85840e6f19","ui_kits/web/App.jsx":"dc5b3a92f558","ui_kits/web/DashboardScreen.jsx":"be962d757582","ui_kits/web/LoginScreen.jsx":"6c68d188bd57","ui_kits/web/ReportScreen.jsx":"8e60619669fc","ui_kits/web/TripFormScreen.jsx":"b5d603d78327","ui_kits/web/TripsScreen.jsx":"ea0b7a1ca401","ui_kits/web/data.jsx":"01b09fce5262"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.StudentDriverLogDesignSystem_97c292 = window.StudentDriverLogDesignSystem_97c292 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/BrandMark.jsx
try { (() => {
function BrandMark({
  variant = 'wordmark',
  size = 32,
  color = 'currentColor',
  assetBase = '../../assets'
}) {
  if (variant === 'wheel') {
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 100 100",
      width: size,
      height: size,
      style: {
        color
      },
      "aria-label": "Student Driver Log"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "50",
      cy: "50",
      r: "44",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "50",
      y1: "6",
      x2: "50",
      y2: "34",
      stroke: "currentColor",
      strokeWidth: "7",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "50",
      y1: "66",
      x2: "50",
      y2: "94",
      stroke: "currentColor",
      strokeWidth: "7",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "50",
      x2: "34",
      y2: "50",
      stroke: "currentColor",
      strokeWidth: "7",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "66",
      y1: "50",
      x2: "94",
      y2: "50",
      stroke: "currentColor",
      strokeWidth: "7",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "50",
      cy: "50",
      r: "9",
      fill: "currentColor"
    }));
  }
  if (variant === 'shield') {
    return /*#__PURE__*/React.createElement("img", {
      src: assetBase + '/illinois-shield.svg',
      width: size,
      height: size,
      alt: "Illinois Route 101",
      style: {
        filter: 'drop-shadow(0 2px 3px oklch(0 0 0 / 25%))'
      }
    });
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      fontSize: size,
      lineHeight: 1.2,
      color
    }
  }, "Student Driver Log");
}
Object.assign(__ds_scope, { BrandMark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/BrandMark.jsx", error: String((e && e.message) || e) }); }

// components/brand/ProgressBar.jsx
try { (() => {
function ProgressBar({
  label,
  percent = 0,
  remaining,
  tooltip,
  tone = 'primary',
  caption
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-sans)'
    }
  }, (label || remaining) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--foreground)'
    }
  }, label), remaining && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)'
    }
  }, remaining)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16,
      width: '100%',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--muted)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: Math.max(0, Math.min(100, percent)) + '%',
      borderRadius: 'var(--radius-pill)',
      background: tone === 'accent' ? 'var(--accent)' : 'var(--primary)',
      transition: 'var(--transition-progress)'
    }
  })), tooltip && hover && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: -32,
      pointerEvents: 'none',
      background: 'var(--popover)',
      color: 'var(--popover-foreground)',
      borderRadius: 'var(--radius-control)',
      padding: '4px 8px',
      fontSize: 'var(--text-xs)',
      boxShadow: 'var(--shadow-md)',
      whiteSpace: 'nowrap'
    }
  }, tooltip)), caption && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      textAlign: 'right',
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)'
    }
  }, caption));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/brand/SignCard.jsx
try { (() => {
function SignCard({
  children,
  width = 384,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: width,
      boxSizing: 'border-box',
      padding: 6,
      background: '#fff',
      border: '3px solid #000',
      borderRadius: 'var(--radius-3xl)',
      boxShadow: 'var(--shadow-lg)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--primary)',
      borderRadius: 'var(--radius-panel)',
      padding: '28px 32px',
      color: 'var(--on-green-primary)',
      fontFamily: 'var(--font-sans)'
    }
  }, children));
}
Object.assign(__ds_scope, { SignCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SignCard.jsx", error: String((e && e.message) || e) }); }

// components/brand/SignPanel.jsx
try { (() => {
function SignPanel({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      background: 'var(--primary)',
      color: '#fff',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      letterSpacing: 'var(--tracking-sign)',
      textTransform: 'uppercase',
      border: '3px solid var(--green-rule)',
      borderRadius: 'var(--radius-chip)',
      padding: '8px 20px',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { SignPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SignPanel.jsx", error: String((e && e.message) || e) }); }

// components/brand/StatTile.jsx
try { (() => {
function StatTile({
  label,
  value,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-control)',
      padding: 16,
      textAlign: 'center',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--muted-foreground)'
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-2xl)',
      fontWeight: 900,
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--foreground)'
    }
  }, value));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const SIZES = {
  sm: {
    padding: '4px 12px',
    fontSize: 'var(--text-xs)',
    fontWeight: 900
  },
  md: {
    padding: '10px 16px',
    fontSize: 'var(--text-sm)',
    fontWeight: 700
  },
  lg: {
    padding: '10px 24px',
    fontSize: 'var(--text-sm)',
    fontWeight: 700
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    border: '1px solid transparent'
  },
  accent: {
    background: 'var(--accent)',
    color: 'var(--accent-foreground)',
    border: '1px solid transparent',
    fontWeight: 900
  },
  outline: {
    background: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid var(--border)'
  },
  destructive: {
    background: 'var(--destructive)',
    color: '#fff',
    border: '1px solid transparent'
  },
  onGreen: {
    background: 'var(--accent)',
    color: 'var(--accent-foreground)',
    border: '1px solid transparent',
    fontWeight: 900
  },
  link: {
    background: 'transparent',
    color: 'var(--primary)',
    border: '1px solid transparent',
    padding: 0,
    textDecoration: 'none'
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  as = 'button',
  href,
  onClick,
  type = 'button',
  style
}) {
  const [hover, setHover] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const filled = variant === 'primary' || variant === 'accent' || variant === 'destructive' || variant === 'onGreen';
  const css = {
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : undefined,
    textAlign: 'center',
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-widest)',
    borderRadius: 'var(--radius-control)',
    lineHeight: 1.2,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity var(--duration-base) var(--ease-default), background-color var(--duration-base) var(--ease-default)',
    ...s,
    ...v,
    opacity: disabled ? 0.5 : filled && hover ? 0.9 : 1,
    background: !filled && hover && variant === 'outline' ? 'var(--muted)' : v.background,
    textDecoration: variant === 'link' && hover ? 'underline' : v.textDecoration,
    ...style
  };
  const Tag = as === 'a' ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, {
    href: as === 'a' ? href : undefined,
    type: Tag === 'button' ? type : undefined,
    disabled: Tag === 'button' ? disabled : undefined,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: css
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  title,
  action,
  padded = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-control)',
      overflow: 'hidden',
      ...style
    }
  }, (title || action) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: padded ? '16px 24px' : '16px',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--foreground)'
    }
  }, title), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: padded ? 24 : 0
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Dialog.jsx
try { (() => {
function Dialog({
  open = true,
  title,
  description,
  children,
  footer,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'oklch(0 0 0 / 50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: 448,
      background: 'var(--popover)',
      color: 'var(--popover-foreground)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--text-base)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-relaxed)',
      color: 'var(--muted-foreground)'
    }
  }, description)), children, footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function Input({
  type = 'text',
  value,
  defaultValue,
  placeholder,
  name,
  id,
  disabled,
  invalid,
  onGreen = false,
  onChange,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  const base = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-control)',
    outline: 'none',
    transition: 'var(--transition-color)'
  };
  const skin = onGreen ? {
    background: 'oklch(1 0 0 / 10%)',
    color: '#fff',
    border: '1px solid ' + (focus ? 'var(--accent)' : 'var(--on-green-rule)'),
    boxShadow: focus ? '0 0 0 1px var(--accent)' : 'none'
  } : {
    background: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid ' + (invalid ? 'var(--destructive)' : focus ? 'var(--primary)' : 'var(--input)'),
    boxShadow: focus ? '0 0 0 1px var(--primary)' : 'none'
  };
  return /*#__PURE__*/React.createElement("input", {
    type: type,
    name: name,
    id: id,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...base,
      ...skin,
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  });
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Label.jsx
try { (() => {
function Label({
  children,
  htmlFor,
  hint,
  onGreen = false,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      display: 'block',
      fontFamily: 'var(--font-sans)',
      fontSize: onGreen ? 'var(--text-2xs)' : 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: onGreen ? 'var(--tracking-widest)' : 'var(--tracking-wider)',
      color: onGreen ? 'var(--on-green-secondary)' : 'var(--foreground)',
      marginBottom: 4,
      ...style
    }
  }, children, hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      textTransform: 'none',
      letterSpacing: 0,
      color: 'var(--muted-foreground)'
    }
  }, " ", hint));
}
Object.assign(__ds_scope, { Label });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Label.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function Select({
  options = [],
  value,
  defaultValue,
  placeholder = 'Select…',
  name,
  id,
  disabled,
  invalid,
  onGreen = false,
  onChange,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  const skin = onGreen ? {
    background: 'oklch(1 0 0 / 10%)',
    color: '#fff',
    border: '1px solid ' + (focus ? 'var(--accent)' : 'var(--on-green-rule)')
  } : {
    background: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid ' + (invalid ? 'var(--destructive)' : focus ? 'var(--primary)' : 'var(--input)')
  };
  return /*#__PURE__*/React.createElement("select", {
    name: name,
    id: id,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      padding: '8px 12px',
      borderRadius: 'var(--radius-control)',
      outline: 'none',
      opacity: disabled ? 0.5 : 1,
      ...skin,
      ...style
    }
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Table.jsx
try { (() => {
function Table({
  columns = [],
  rows = [],
  zebra = true,
  dense = false
}) {
  const pad = dense ? '8px 16px' : '12px 16px';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'color-mix(in oklab, var(--muted) 40%, transparent)',
      borderBottom: '1px solid var(--border)'
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      padding: pad,
      textAlign: c.align || 'left',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      color: 'var(--muted-foreground)',
      whiteSpace: 'nowrap'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: '1px solid var(--border)',
      background: zebra && i % 2 === 1 ? 'color-mix(in oklab, var(--muted) 20%, transparent)' : 'transparent'
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      padding: pad,
      textAlign: c.align || 'left',
      color: 'var(--foreground)',
      fontVariantNumeric: c.numeric ? 'tabular-nums' : 'normal'
    }
  }, row[c.key])))))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Table.jsx", error: String((e && e.message) || e) }); }

// components/core/Textarea.jsx
try { (() => {
function Textarea({
  rows = 3,
  value,
  defaultValue,
  placeholder,
  name,
  id,
  maxLength,
  disabled,
  invalid,
  onChange,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("textarea", {
    rows: rows,
    name: name,
    id: id,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    maxLength: maxLength,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      resize: 'none',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      padding: '8px 12px',
      borderRadius: 'var(--radius-control)',
      outline: 'none',
      background: 'transparent',
      color: 'var(--foreground)',
      border: '1px solid ' + (invalid ? 'var(--destructive)' : focus ? 'var(--primary)' : 'var(--input)'),
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  });
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/core/Toast.jsx
try { (() => {
const TONES = {
  success: {
    border: 'var(--primary)',
    bar: 'var(--primary)'
  },
  error: {
    border: 'var(--destructive)',
    bar: 'var(--destructive)'
  },
  info: {
    border: 'var(--border)',
    bar: 'var(--accent)'
  }
};
function Toast({
  title,
  description,
  tone = 'success'
}) {
  const t = TONES[tone] || TONES.success;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      minWidth: 260,
      maxWidth: 360,
      padding: '12px 14px',
      background: 'var(--popover)',
      color: 'var(--popover-foreground)',
      border: '1px solid ' + t.border,
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      alignSelf: 'stretch',
      borderRadius: 2,
      background: t.bar,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Toast.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppHeader.jsx
try { (() => {
function AppHeader({
  links = [],
  active,
  cta,
  right,
  maxWidth = 896,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: 'var(--primary)',
      borderBottom: 'var(--border-rule) solid var(--accent)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth,
      margin: '0 auto',
      padding: '0 16px',
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontWeight: 900,
      fontSize: 'var(--text-sm)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      flexShrink: 0
    }
  }, "Student Driver Log"), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flex: 1
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href || '#',
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(l);
      }
    },
    style: {
      color: active === l.label ? '#fff' : 'var(--on-green-secondary)',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      textDecoration: 'none'
    }
  }, l.label)), cta, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), right)));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageFooter.jsx
try { (() => {
function PageFooter({
  links = ['About', 'Privacy', 'Terms', 'FAQ'],
  version,
  maxWidth = 896
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid oklch(0 0 0 / 10%)',
      padding: '16px 0',
      marginTop: 16,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth,
      margin: '0 auto',
      padding: '0 16px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      fontSize: 'var(--text-micro)',
      color: 'oklch(0 0 0 / 40%)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      textDecoration: 'none'
    }
  }, l))), version && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'oklch(0 0 0 / 30%)'
    }
  }, version)));
}
Object.assign(__ds_scope, { PageFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageFooter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/MobileApp.jsx
try { (() => {
const {
  SignCard,
  BrandMark,
  Card,
  Table,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  ProgressBar,
  StatTile,
  Toast
} = window.StudentDriverLogDesignSystem_97c292;
function MobileHeader({
  route,
  onGo
}) {
  const [open, setOpen] = React.useState(false);
  const link = {
    color: '#fff',
    fontSize: 'var(--text-sm)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-widest)',
    textDecoration: 'none'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--primary)',
      borderBottom: 'var(--border-rule) solid var(--accent)',
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontWeight: 900,
      fontSize: 'var(--text-sm)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)'
    }
  }, "Student Driver Log"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    style: {
      marginLeft: 'auto',
      background: 'none',
      border: 0,
      padding: 12,
      marginRight: -12,
      cursor: 'pointer',
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: open ? '../../assets/icon-close.svg' : '../../assets/icon-menu.svg',
    width: "24",
    height: "24",
    alt: open ? 'Close' : 'Menu',
    style: {
      filter: 'brightness(0) invert(1)'
    }
  }))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'var(--primary)',
      borderBottom: 'var(--border-rule) solid var(--accent)',
      boxShadow: 'var(--shadow-lg)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, ['Dashboard', 'Trips', 'Report'].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: link,
    onClick: e => {
      e.preventDefault();
      onGo(l);
      setOpen(false);
    }
  }, l)), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "sm",
    style: {
      alignSelf: 'flex-start'
    },
    onClick: () => {
      onGo('New');
      setOpen(false);
    }
  }, "+ Log Trip"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--on-green-tertiary)',
      fontSize: 'var(--text-xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)'
    }
  }, "Student"), /*#__PURE__*/React.createElement(Select, {
    onGreen: true,
    placeholder: "",
    style: {
      width: 150,
      padding: '4px 8px',
      fontSize: 'var(--text-xs)'
    },
    options: [{
      value: 'j',
      label: 'Jimmy Telford'
    }, {
      value: 'e',
      label: 'Ellie Telford'
    }]
  })), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      ...link,
      color: 'var(--accent)',
      fontSize: 'var(--text-xs)'
    },
    onClick: e => {
      e.preventDefault();
      onGo('SignOut');
    }
  }, "Sign Out")));
}
function MobileApp() {
  const [signedIn, setSignedIn] = React.useState(false);
  const [route, setRoute] = React.useState('Dashboard');
  const [trips, setTrips] = React.useState(window.TRIPS);
  const [toast, setToast] = React.useState(null);
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);
  const go = r => {
    if (r === 'SignOut') {
      setSignedIn(false);
      return;
    }
    setSaved(false);
    setRoute(r);
  };
  const t = window.totals(trips);
  const totalPct = Math.round(t.total / 3000 * 100);
  const nightPct = Math.round(t.night / 600 * 100);
  const title = (s, sub) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, s), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, sub));
  if (!signedIn) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box'
      }
    }, /*#__PURE__*/React.createElement(SignCard, {
      width: 340
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        borderBottom: '2px solid var(--on-green-rule)',
        paddingBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(BrandMark, {
      variant: "shield",
      size: 72,
      assetBase: "../../assets"
    })), /*#__PURE__*/React.createElement(BrandMark, {
      variant: "wordmark",
      size: 20,
      color: "#fff"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--text-micro)',
        letterSpacing: 'var(--tracking-eyebrow)',
        textTransform: 'uppercase',
        color: 'var(--on-green-tertiary)'
      }
    }, "Learner Permit Hour Tracker")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
      htmlFor: "me",
      onGreen: true
    }, "Email"), /*#__PURE__*/React.createElement(Input, {
      id: "me",
      onGreen: true,
      defaultValue: "jimmy@example.com"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
      htmlFor: "mp",
      onGreen: true
    }, "Password"), /*#__PURE__*/React.createElement(Input, {
      id: "mp",
      type: "password",
      onGreen: true,
      defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "onGreen",
      fullWidth: true,
      onClick: () => {
        setSignedIn(true);
        setRoute('Dashboard');
      }
    }, "Sign In"))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(MobileHeader, {
    route: route,
    onGo: go
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px 16px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, route === 'Dashboard' && /*#__PURE__*/React.createElement(React.Fragment, null, title('Dashboard', 'Welcome back, Jimmy.'), /*#__PURE__*/React.createElement(Card, {
    title: "Progress",
    style: {}
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "Day",
    value: window.fmtHMM(t.day),
    style: {
      padding: 10
    }
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Night",
    value: window.fmtHMM(t.night),
    style: {
      padding: 10
    }
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Total",
    value: window.fmtHMM(t.total),
    style: {
      padding: 10
    }
  })), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "50-Hour",
    percent: totalPct,
    remaining: window.remaining(t.total, 3000),
    caption: totalPct + '% of 50:00'
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "10-Hour Night",
    tone: "accent",
    percent: nightPct,
    remaining: window.remaining(t.night, 600),
    caption: nightPct + '% of 10:00'
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Recent Trips",
    padded: false
  }, /*#__PURE__*/React.createElement(Table, {
    dense: true,
    zebra: true,
    columns: [{
      key: 'date',
      label: 'Date',
      numeric: true
    }, {
      key: 'location',
      label: 'Location'
    }, {
      key: 'day',
      label: 'Day',
      align: 'right',
      numeric: true
    }, {
      key: 'night',
      label: 'Night',
      align: 'right',
      numeric: true
    }],
    rows: trips.slice(0, 4).map(tr => ({
      ...tr,
      day: window.fmtShort(tr.day),
      night: window.fmtShort(tr.night)
    }))
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "md",
    fullWidth: true,
    onClick: () => go('New')
  }, "+ Log Trip")), route === 'Trips' && /*#__PURE__*/React.createElement(React.Fragment, null, title('Trips', trips.length + ' sessions logged'), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'date',
      label: 'Date',
      numeric: true
    }, {
      key: 'location',
      label: 'Location'
    }, {
      key: 'day',
      label: 'Day',
      align: 'right',
      numeric: true
    }, {
      key: 'night',
      label: 'Night',
      align: 'right',
      numeric: true
    }],
    rows: trips.map(tr => ({
      ...tr,
      day: window.fmtShort(tr.day),
      night: window.fmtShort(tr.night)
    }))
  }))), route === 'Report' && /*#__PURE__*/React.createElement(React.Fragment, null, title('Report', 'Illinois SOS DSD X 152.4'), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, "The full nine-column log is a landscape document. On phones the app hands it straight to the PDF route."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    fullWidth: true
  }, "Download PDF"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "md",
    fullWidth: true
  }, "Print")))), route === 'New' && (saved ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 36
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '8px 0 0',
      fontSize: 'var(--text-xl)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "Trip Logged"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, "The driving session has been saved.")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    fullWidth: true,
    onClick: () => go('Dashboard')
  }, "Go to Dashboard"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "md",
    fullWidth: true,
    onClick: () => setSaved(false)
  }, "Log Another Trip")) : /*#__PURE__*/React.createElement(React.Fragment, null, title('Log a Trip'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "d"
  }, "Date"), /*#__PURE__*/React.createElement(Input, {
    id: "d",
    type: "date",
    defaultValue: "2026-08-24"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "l"
  }, "Location"), /*#__PURE__*/React.createElement(Select, {
    id: "l",
    options: window.LOCATIONS
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "w"
  }, "Weather"), /*#__PURE__*/React.createElement(Select, {
    id: "w",
    options: window.WEATHER
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "dm"
  }, "Daytime (min)"), /*#__PURE__*/React.createElement(Input, {
    id: "dm",
    type: "number",
    defaultValue: "0"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "nm"
  }, "Nighttime (min)"), /*#__PURE__*/React.createElement(Input, {
    id: "nm",
    type: "number",
    defaultValue: "0"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "n",
    hint: "(optional)"
  }, "Notes"), /*#__PURE__*/React.createElement(Textarea, {
    id: "n",
    rows: 3,
    placeholder: "Any notes about the session\u2026"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    fullWidth: true,
    onClick: () => {
      setTrips([{
        id: Date.now(),
        date: '2026-08-24',
        location: 'Highway',
        weather: 'Clear',
        day: 60,
        night: 0
      }, ...trips]);
      setSaved(true);
      setToast({
        title: 'Trip Logged',
        description: 'The driving session has been saved.'
      });
    }
  }, "Log Trip"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "md",
    fullWidth: true,
    onClick: () => go('Dashboard')
  }, "Cancel"))))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      zIndex: 30
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    title: toast.title,
    description: toast.description
  })));
}
window.MobileApp = MobileApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/MobileApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ios/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return (
    /*#__PURE__*/
    // data-om-starter: inert presence marker — Claude Design's starter-usage
    // probe reads it; it renders nothing. Keep it on this root element.
    React.createElement("div", {
      "data-om-starter": "ios-frame",
      style: {
        width,
        height,
        borderRadius: 48,
        overflow: 'hidden',
        position: 'relative',
        background: dark ? '#000' : '#F2F2F7',
        boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
        fontFamily: '-apple-system, system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 11,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 126,
        height: 37,
        borderRadius: 24,
        background: '#000',
        zIndex: 50
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }
    }, /*#__PURE__*/React.createElement(IOSStatusBar, {
      dark: dark
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
      title: title,
      dark: dark
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto'
      }
    }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
      dark: dark
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        height: 34,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 8,
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 139,
        height: 5,
        borderRadius: 100,
        background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
      }
    })))
  );
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ios/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/AboutScreen.jsx
try { (() => {
function AboutScreen() {
  const p = {
    margin: 0,
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--leading-relaxed)',
    color: 'oklch(0 0 0 / 80%)'
  };
  const h2 = {
    margin: 0,
    fontSize: 'var(--text-sm)',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-widest)',
    color: 'var(--primary)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-2xl)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      color: 'var(--primary)'
    }
  }, "About"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 'var(--text-xs)',
      color: 'oklch(0 0 0 / 40%)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)'
    }
  }, "Student Driver Log")), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: p
  }, "Student Driver Log started as a personal itch. When my son was working toward his Illinois driver's license, we needed to log 50 hours of supervised driving \u2014 and the spreadsheet we were using wasn't cutting it. So I built something better."), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "There are other apps that do this. This one is mine, and now yours too if it's useful. It's free, it runs in your browser, and it installs on your phone's home screen without any app store involved.")), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "What it does"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, ['Tracks daytime and nighttime driving hours for each session', 'Supports multiple student accounts under one parent login', 'Generates a printable report matching Illinois SOS Form DSD X 152.4', 'Works as an installable app on iOS and Android home screens', 'Free — no subscriptions, no ads, no account required beyond your own login'].map(item => /*#__PURE__*/React.createElement("li", {
    key: item,
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      fontWeight: 900,
      flexShrink: 0
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: p
  }, item))))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "Feedback & issues"), /*#__PURE__*/React.createElement("p", {
    style: p
  }, "Found a bug? Have a suggestion? The project is open source. ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--primary)',
      fontWeight: 700,
      textDecoration: 'underline',
      textUnderlineOffset: 2
    }
  }, "Open an issue on GitHub"), " and I'll take a look.")));
}
window.AboutScreen = AboutScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/AboutScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/App.jsx
try { (() => {
const {
  AppHeader,
  PageFooter,
  Button,
  Select,
  Toast
} = window.StudentDriverLogDesignSystem_97c292;
function App() {
  const [signedIn, setSignedIn] = React.useState(false);
  const [route, setRoute] = React.useState('Dashboard');
  const [trips, setTrips] = React.useState(window.TRIPS);
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  if (!signedIn) return /*#__PURE__*/React.createElement(LoginScreen, {
    onSignIn: () => {
      setSignedIn(true);
      setRoute('Dashboard');
    },
    onRegister: () => setSignedIn(true)
  });
  const links = [{
    label: 'Trips'
  }, {
    label: 'Report'
  }, {
    label: 'Settings'
  }, {
    label: 'About'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    links: links,
    active: route,
    onNavigate: l => setRoute(l.label),
    cta: /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "sm",
      onClick: () => setRoute('New')
    }, "+ Log Trip"),
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Select, {
      onGreen: true,
      placeholder: "",
      style: {
        width: 132,
        padding: '4px 8px',
        fontSize: 'var(--text-xs)'
      },
      options: [{
        value: 'j',
        label: 'Jimmy Telford'
      }, {
        value: 'e',
        label: 'Ellie Telford'
      }, {
        value: 'new',
        label: '+ Add student…'
      }]
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "link",
      size: "sm",
      style: {
        color: 'var(--accent)',
        fontSize: 'var(--text-micro)'
      },
      onClick: () => setSignedIn(false)
    }, "Sign Out"))
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      width: '100%',
      maxWidth: 'var(--content-max-app)',
      margin: '0 auto',
      padding: '32px 16px',
      boxSizing: 'border-box'
    }
  }, route === 'Dashboard' && /*#__PURE__*/React.createElement(DashboardScreen, {
    trips: trips,
    onGo: setRoute
  }), route === 'Trips' && /*#__PURE__*/React.createElement(TripsScreen, {
    trips: trips,
    onGo: setRoute,
    onDelete: id => {
      setTrips(trips.filter(t => t.id !== id));
      setToast({
        title: 'Trip deleted',
        description: 'The session was removed from the log.'
      });
    }
  }), route === 'New' && /*#__PURE__*/React.createElement(TripFormScreen, {
    onGo: setRoute,
    onSave: t => {
      setTrips([{
        id: Date.now(),
        ...t
      }, ...trips]);
      setToast({
        title: 'Trip Logged',
        description: 'The driving session has been saved.'
      });
    }
  }), route === 'Report' && /*#__PURE__*/React.createElement(ReportScreen, {
    trips: trips
  }), route === 'About' && /*#__PURE__*/React.createElement(AboutScreen, null), route === 'Settings' && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 520,
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-2xl)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      color: 'var(--primary)'
    }
  }, "Settings"), /*#__PURE__*/React.createElement("section", {
    style: {
      border: '2px solid color-mix(in oklab, var(--destructive) 40%, transparent)',
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--text-lg)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--destructive)'
    }
  }, "Danger Zone"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, "Permanently deletes your account, all student accounts, and every trip record. ", /*#__PURE__*/React.createElement("strong", null, "This cannot be undone."))), /*#__PURE__*/React.createElement(Button, {
    variant: "destructive",
    size: "md",
    style: {
      alignSelf: 'flex-start'
    }
  }, "Delete Account")))), /*#__PURE__*/React.createElement(PageFooter, {
    version: "v1.4.2 \xB7 9f3c1ab"
  }), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    title: toast.title,
    description: toast.description
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/DashboardScreen.jsx
try { (() => {
const {
  Card,
  Table,
  Button,
  ProgressBar,
  StatTile
} = window.StudentDriverLogDesignSystem_97c292;
function DashboardScreen({
  trips,
  onGo
}) {
  const t = window.totals(trips);
  const totalPct = Math.round(t.total / 3000 * 100);
  const nightPct = Math.round(t.night / 600 * 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "Dashboard"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, "Welcome back, John.")), /*#__PURE__*/React.createElement(Card, {
    title: "Progress \u2014 Jimmy Telford"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "Daytime",
    value: window.fmtHMM(t.day)
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Nighttime",
    value: window.fmtHMM(t.night)
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "Total",
    value: window.fmtHMM(t.total)
  })), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "50-Hour Requirement",
    percent: totalPct,
    remaining: window.remaining(t.total, 3000),
    caption: totalPct + '% of 50:00',
    tooltip: window.fmtHMM(t.total) + ' total (' + window.fmtHMM(t.day) + ' day + ' + window.fmtHMM(t.night) + ' night)'
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "10-Hour Night Requirement",
    tone: "accent",
    percent: nightPct,
    remaining: window.remaining(t.night, 600),
    caption: nightPct + '% of 10:00',
    tooltip: window.fmtHMM(t.night) + ' nighttime'
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Recent Trips",
    padded: false,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "link",
      size: "sm",
      onClick: () => onGo('Trips')
    }, "View All")
  }, /*#__PURE__*/React.createElement(Table, {
    dense: true,
    columns: [{
      key: 'date',
      label: 'Date',
      numeric: true
    }, {
      key: 'location',
      label: 'Location'
    }, {
      key: 'day',
      label: 'Daytime',
      align: 'right',
      numeric: true
    }, {
      key: 'night',
      label: 'Nighttime',
      align: 'right',
      numeric: true
    }],
    rows: trips.slice(0, 5).map(tr => ({
      ...tr,
      day: window.fmtShort(tr.day),
      night: window.fmtShort(tr.night)
    }))
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Students",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "link",
      size: "sm"
    }, "+ Add a Student")
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, [['Jimmy Telford', 'jimmy@example.com'], ['Ellie Telford', 'ellie@example.com']].map(([n, e]) => /*#__PURE__*/React.createElement("li", {
    key: e,
    style: {
      display: 'flex',
      gap: 12,
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted-foreground)'
    }
  }, e))))));
}
window.DashboardScreen = DashboardScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/LoginScreen.jsx
try { (() => {
const {
  SignCard,
  BrandMark,
  Input,
  Label,
  Button
} = window.StudentDriverLogDesignSystem_97c292;
function LoginScreen({
  onSignIn,
  onRegister
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: '48px 16px'
    }
  }, /*#__PURE__*/React.createElement(SignCard, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      borderBottom: '2px solid var(--on-green-rule)',
      paddingBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(BrandMark, {
    variant: "shield",
    size: 80,
    assetBase: "../../assets"
  })), /*#__PURE__*/React.createElement(BrandMark, {
    variant: "wordmark",
    size: 24,
    color: "#fff"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-micro)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--on-green-tertiary)'
    }
  }, "Learner Permit Hour Tracker")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "email",
    onGreen: true
  }, "Email"), /*#__PURE__*/React.createElement(Input, {
    id: "email",
    type: "email",
    onGreen: true,
    defaultValue: "john@example.com"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "password",
    onGreen: true,
    style: {
      marginBottom: 0
    }
  }, "Password"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: 'var(--text-micro)',
      color: 'color-mix(in oklab, var(--accent) 80%, transparent)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      textDecoration: 'none'
    }
  }, "Forgot?")), /*#__PURE__*/React.createElement(Input, {
    id: "password",
    type: "password",
    onGreen: true,
    defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "onGreen",
    fullWidth: true,
    onClick: onSignIn
  }, "Sign In")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid oklch(1 0 0 / 20%)',
      paddingTop: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      textAlign: 'center',
      fontSize: 'var(--text-micro)',
      color: 'oklch(1 0 0 / 50%)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)'
    }
  }, "Need an account?", ' ', /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onRegister && onRegister();
    },
    style: {
      color: 'var(--accent)',
      fontWeight: 700,
      textDecoration: 'none'
    }
  }, "Register")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 16,
      fontSize: 'var(--text-micro)',
      color: 'var(--on-green-faint)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)'
    }
  }, ['About', 'Privacy', 'Terms', 'FAQ'].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      color: 'inherit',
      textDecoration: 'none'
    }
  }, l)))))));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/ReportScreen.jsx
try { (() => {
const {
  Button
} = window.StudentDriverLogDesignSystem_97c292;
function ReportScreen({
  trips
}) {
  let day = 0,
    night = 0;
  const rows = trips.slice().reverse().map(t => {
    day += t.day;
    night += t.night;
    return {
      ...t,
      runDay: day,
      runNight: night,
      grand: day + night
    };
  });
  const cell = {
    border: '1px solid var(--border)',
    padding: '6px 8px',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "Driving Log Report"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, "Jimmy Telford")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md"
  }, "Download PDF"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "md"
  }, "Print"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-widest)',
      color: 'var(--muted-foreground)'
    }
  }, "Illinois Secretary of State \u2014 DSD X 152.4"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-lg)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "Behind-the-Wheel Driving Log"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'flex',
      justifyContent: 'center',
      gap: 32,
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, "Student:"), " Jimmy Telford"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, "Parent/Guardian:"), " John Telford"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, "Printed:"), " August 24, 2026"))), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 'var(--text-xs)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--primary)',
      color: '#fff'
    }
  }, ['Date', 'Location of Practice', 'Weather Conditions', 'Daytime', 'Daytime Total', 'Nighttime', 'Nighttime Total', 'Grand Total', 'Initials'].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      border: '1px solid color-mix(in oklab, var(--primary) 30%, transparent)',
      padding: '8px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    style: {
      background: i % 2 === 1 ? 'color-mix(in oklab, var(--muted) 30%, transparent)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: cell
  }, r.date), /*#__PURE__*/React.createElement("td", {
    style: {
      ...cell,
      textAlign: 'left'
    }
  }, r.location), /*#__PURE__*/React.createElement("td", {
    style: {
      ...cell,
      textAlign: 'left'
    }
  }, r.weather), /*#__PURE__*/React.createElement("td", {
    style: cell
  }, window.fmtHMM(r.day)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...cell,
      fontWeight: 600
    }
  }, window.fmtHMM(r.runDay)), /*#__PURE__*/React.createElement("td", {
    style: cell
  }, window.fmtHMM(r.night)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...cell,
      fontWeight: 600
    }
  }, window.fmtHMM(r.runNight)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...cell,
      fontWeight: 700
    }
  }, window.fmtHMM(r.grand)), /*#__PURE__*/React.createElement("td", {
    style: cell
  }, "\xA0"))), /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'color-mix(in oklab, var(--primary) 10%, transparent)',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: 3,
    style: {
      ...cell,
      textAlign: 'right',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)'
    }
  }, "Totals"), /*#__PURE__*/React.createElement("td", {
    style: cell
  }, window.fmtHMM(day)), /*#__PURE__*/React.createElement("td", {
    style: cell
  }), /*#__PURE__*/React.createElement("td", {
    style: cell
  }, window.fmtHMM(night)), /*#__PURE__*/React.createElement("td", {
    style: cell
  }), /*#__PURE__*/React.createElement("td", {
    style: cell
  }, window.fmtHMM(day + night)), /*#__PURE__*/React.createElement("td", {
    style: cell
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 32,
      fontSize: 'var(--text-sm)'
    }
  }, ['Student Signature', 'Parent / Guardian Signature'].map(l => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid color-mix(in oklab, var(--foreground) 40%, transparent)',
      paddingBottom: 4
    }
  }, "\xA0"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)'
    }
  }, l))))));
}
window.ReportScreen = ReportScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/ReportScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/TripFormScreen.jsx
try { (() => {
const {
  Card,
  Button,
  Input,
  Label,
  Select,
  Textarea
} = window.StudentDriverLogDesignSystem_97c292;
function TripFormScreen({
  onSave,
  onGo
}) {
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({
    date: '2026-08-24',
    location: '',
    weather: '',
    day: '0',
    night: '0'
  });
  const set = k => e => setForm({
    ...form,
    [k]: e.target.value
  });
  if (saved) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: '16px 0'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 36
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: '8px 0 0',
        fontSize: 'var(--text-xl)',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-wide)'
      }
    }, "Trip Logged"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '8px 0 0',
        fontSize: 'var(--text-sm)',
        color: 'var(--muted-foreground)'
      }
    }, "The driving session has been saved.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      onClick: () => onGo('Dashboard')
    }, "Go to Dashboard"), /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "lg",
      onClick: () => setSaved(false)
    }, "Log Another Trip")));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "Log a Trip"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, "Jimmy Telford")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "date"
  }, "Date"), /*#__PURE__*/React.createElement(Input, {
    id: "date",
    type: "date",
    value: form.date,
    onChange: set('date')
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "loc"
  }, "Location"), /*#__PURE__*/React.createElement(Select, {
    id: "loc",
    options: window.LOCATIONS,
    value: form.location,
    onChange: set('location')
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "wx"
  }, "Weather"), /*#__PURE__*/React.createElement(Select, {
    id: "wx",
    options: window.WEATHER,
    value: form.weather,
    onChange: set('weather')
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "day"
  }, "Daytime (min)"), /*#__PURE__*/React.createElement(Input, {
    id: "day",
    type: "number",
    value: form.day,
    onChange: set('day')
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "night"
  }, "Nighttime (min)"), /*#__PURE__*/React.createElement(Input, {
    id: "night",
    type: "number",
    value: form.night,
    onChange: set('night')
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "notes",
    hint: "(optional)"
  }, "Notes"), /*#__PURE__*/React.createElement(Textarea, {
    id: "notes",
    rows: 3,
    maxLength: 500,
    placeholder: "Any notes about the session\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    style: {
      flex: 1
    },
    onClick: () => {
      onSave({
        date: form.date,
        location: form.location || 'Highway',
        weather: form.weather || 'Clear',
        day: Number(form.day),
        night: Number(form.night)
      });
      setSaved(true);
    }
  }, "Log Trip"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "md",
    onClick: () => onGo('Trips')
  }, "Cancel")))));
}
window.TripFormScreen = TripFormScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/TripFormScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/TripsScreen.jsx
try { (() => {
const {
  Card,
  Table,
  Button,
  Dialog
} = window.StudentDriverLogDesignSystem_97c292;
function TripsScreen({
  trips,
  onDelete,
  onGo
}) {
  const [target, setTarget] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "Trips"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, trips.length, " sessions logged")), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "sm",
    onClick: () => onGo('New')
  }, "+ Log Trip")), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'date',
      label: 'Date',
      numeric: true
    }, {
      key: 'location',
      label: 'Location'
    }, {
      key: 'weather',
      label: 'Weather'
    }, {
      key: 'day',
      label: 'Daytime',
      align: 'right',
      numeric: true
    }, {
      key: 'night',
      label: 'Nighttime',
      align: 'right',
      numeric: true
    }, {
      key: 'actions',
      label: 'Actions',
      align: 'right'
    }],
    rows: trips.map(tr => ({
      ...tr,
      day: window.fmtShort(tr.day),
      night: window.fmtShort(tr.night),
      actions: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "link",
        size: "sm"
      }, "Edit"), /*#__PURE__*/React.createElement(Button, {
        variant: "link",
        size: "sm",
        style: {
          color: 'var(--destructive)'
        },
        onClick: () => setTarget(tr)
      }, "Delete"))
    }))
  })), /*#__PURE__*/React.createElement(Dialog, {
    open: !!target,
    title: "Delete Trip",
    description: target ? 'Delete the ' + target.date + ' trip (' + target.location + ', ' + target.weather + ', ' + window.fmtShort(target.day + target.night) + ' total)? This cannot be undone.' : '',
    onClose: () => setTarget(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "md",
      onClick: () => setTarget(null)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "destructive",
      size: "md",
      onClick: () => {
        onDelete(target.id);
        setTarget(null);
      }
    }, "Delete"))
  }));
}
window.TripsScreen = TripsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/TripsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/data.jsx
try { (() => {
const TRIPS = [{
  id: 7,
  date: '2026-08-20',
  location: 'Highway',
  weather: 'Clear',
  day: 95,
  night: 0
}, {
  id: 6,
  date: '2026-08-17',
  location: 'Residential',
  weather: 'Rain',
  day: 45,
  night: 30
}, {
  id: 5,
  date: '2026-08-14',
  location: 'Urban',
  weather: 'Clear',
  day: 0,
  night: 75
}, {
  id: 4,
  date: '2026-08-09',
  location: 'Rural',
  weather: 'Clear',
  day: 120,
  night: 0
}, {
  id: 3,
  date: '2026-08-05',
  location: 'Parking Lot',
  weather: 'Snow',
  day: 40,
  night: 0
}, {
  id: 2,
  date: '2026-07-30',
  location: 'Residential',
  weather: 'Fog',
  day: 0,
  night: 55
}, {
  id: 1,
  date: '2026-07-26',
  location: 'Highway',
  weather: 'Clear',
  day: 110,
  night: 0
}];
const LOCATIONS = ['Highway', 'Residential', 'Rural', 'Urban', 'Parking Lot', 'Race Track'].map(l => ({
  value: l,
  label: l
}));
const WEATHER = ['Clear', 'Rain', 'Snow', 'Fog', 'Ice'].map(w => ({
  value: w,
  label: w
}));
function fmtHMM(min) {
  const h = Math.floor(min / 60);
  return h + ':' + String(min % 60).padStart(2, '0');
}
function fmtShort(min) {
  if (min === 0) return '—';
  const h = Math.floor(min / 60),
    m = min % 60;
  if (h === 0) return m + 'm';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'm';
}
function remaining(cur, req) {
  const rem = Math.max(0, req - cur);
  if (rem === 0) return 'Complete';
  const h = Math.floor(rem / 60),
    m = rem % 60;
  if (h === 0) return m + 'm left';
  if (m === 0) return h + 'h left';
  return h + 'h ' + m + 'm left';
}
function totals(trips) {
  const day = trips.reduce((a, t) => a + t.day, 0);
  const night = trips.reduce((a, t) => a + t.night, 0);
  return {
    day,
    night,
    total: day + night
  };
}
Object.assign(window, {
  TRIPS,
  LOCATIONS,
  WEATHER,
  fmtHMM,
  fmtShort,
  remaining,
  totals
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.BrandMark = __ds_scope.BrandMark;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SignCard = __ds_scope.SignCard;

__ds_ns.SignPanel = __ds_scope.SignPanel;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Label = __ds_scope.Label;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.PageFooter = __ds_scope.PageFooter;

})();
