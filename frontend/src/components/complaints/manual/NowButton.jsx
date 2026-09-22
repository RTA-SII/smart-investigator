import { useT } from "@/i18n"

/** The "NOW" shortcut SMC puts above its timestamp fields. */
export function NowButton({ onClick }) {
  const t = useT()
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[10px] font-semibold tracking-[0.5px] text-[var(--primary)] uppercase hover:underline"
    >
      {t("Now")}
    </button>
  )
}
