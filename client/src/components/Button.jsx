import { btnPrimary, btnSecondary, btnDanger, btnGhost, btnSm, btnLg } from "../utils/design";

const variants = {
  primary: btnPrimary,
  secondary: btnSecondary,
  danger: btnDanger,
  ghost: btnGhost,
};

const sizes = { sm: btnSm, md: "", lg: btnLg };

export default function Button({ variant, size, children, className, ...props }) {
  const classes = [variants[variant] || btnPrimary, sizes[size] || "", className || ""].filter(Boolean).join(" ");
  return <button className={classes} {...props}>{children}</button>;
}
