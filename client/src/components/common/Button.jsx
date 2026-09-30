/**
 * client/src/components/common/Button.jsx
 */
export default function Button({
  children,
  variant = 'primary',   // primary | accent | outline | ghost
  size    = 'md',        // sm | md | lg | xl
  className = '',
  icon,
  loading = false,
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    accent:  'btn-accent',
    outline: 'btn-outline',
    ghost:   'btn-ghost',
  }[variant] ?? 'btn-primary';

  const sizeClass = { sm: 'btn-sm', md: '', lg: 'btn-lg', xl: 'btn-xl' }[size] ?? '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
        : icon
      }
      {children}
    </button>
  );
}
