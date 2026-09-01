// Admins are just profiles rows with a flag — nothing else marks them as
// different from any other user. Shown wherever a user's identity is shown,
// so a disable/enable click doesn't land on a fellow admin by accident.
export function AdminBadge() {
  return (
    <span className="inline-flex rounded-full bg-[#FFB400]/20 px-2 py-0.5 text-xs font-medium text-[#7a5200] dark:text-[#FFB400]">
      Admin
    </span>
  );
}
