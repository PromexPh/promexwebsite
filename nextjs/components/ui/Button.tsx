import Link from 'next/link';

export type ButtonVariant = 'primary' | 'accent' | 'outline';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label:         string;
  variant?:      ButtonVariant;
  size?:         ButtonSize;
  /** Internal Next.js route */
  href?:         string;
  /** Anchor fragment appended to href, e.g. "employers" → href + "#employers" */
  fragment?:     string;
  /** External URL — opens in new tab */
  externalHref?: string;
  icon?:         string;        // Font Awesome class e.g. "fa-solid fa-arrow-right"
  iconPosition?: 'left' | 'right';
  fullWidth?:    boolean;
  disabled?:     boolean;
  type?:         'button' | 'submit' | 'reset';
  onClick?:      () => void;
  className?:    string;
}

/**
 * Polymorphic button — renders <Link>, <a>, or <button> depending on props.
 * Styles come entirely from the global .btn system in globals.css.
 */
export default function Button({
  label,
  variant      = 'primary',
  size         = 'md',
  href,
  fragment,
  externalHref,
  icon,
  iconPosition = 'left',
  fullWidth    = false,
  disabled     = false,
  type         = 'button',
  onClick,
  className    = '',
}: ButtonProps) {
  const sizeClass    = size === 'md' ? '' : size === 'sm' ? 'btn-sm' : 'btn-lg';
  const widthClass   = fullWidth ? 'btn-full' : '';
  const classes      = ['btn', `btn-${variant}`, sizeClass, widthClass, className]
    .filter(Boolean)
    .join(' ');

  const iconLeft  = icon && iconPosition === 'left'  && <i className={icon} aria-hidden="true" />;
  const iconRight = icon && iconPosition === 'right' && <i className={icon} aria-hidden="true" />;
  const content   = <>{iconLeft}{label}{iconRight}</>;

  // Internal Next.js link
  if (href) {
    const to = fragment ? `${href}#${fragment}` : href;
    return (
      <Link
        href={to}
        className={classes}
        aria-disabled={disabled || undefined}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  // External link
  if (externalHref) {
    return (
      <a
        href={externalHref}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={disabled || undefined}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  // Plain button
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
