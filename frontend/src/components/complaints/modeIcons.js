import { Bus, BusFront, Car, CarFront, CarTaxiFront, Ship } from "lucide-react"

/**
 * One vehicle per transport mode, as SMC draws them.
 *
 * The portal shows the thing itself and never a symbol standing in for it —
 * a crown for a limousine and a spanner for a rental read as status and
 * servicing, which is not what either mode means.
 *
 * Single-sourced because four views had drifted apart: three carried their
 * own copy keyed on `Limousine`, a value no complaint has ever held, so
 * limousine, rental and marine cases all fell through to the default car.
 */
export const MODE_ICON = {
  Taxi: CarTaxiFront,
  "Public Bus": Bus,
  "School Bus": BusFront,
  "Limousine and e-Hail": CarFront,
  Rental: Car,
  Marine: Ship,
}

export const modeIcon = (mode) => MODE_ICON[mode] ?? Car

/** The tile accent each mode carries on the summary strip. */
export const MODE_TONE = {
  Taxi: "var(--tone-high)",
  "Public Bus": "var(--tone-info)",
  "School Bus": "#ff8200",
  "Limousine and e-Hail": "#9b59b6",
  Rental: "#009a44",
  Marine: "#0ea5e9",
}
