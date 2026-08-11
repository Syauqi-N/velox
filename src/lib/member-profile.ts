export const INVESTMENT_STYLES = [
  { value: "VALUE", label: "Value Investing" },
  { value: "GROWTH", label: "Growth" },
  { value: "MOMENTUM", label: "Momentum" },
  { value: "DIVIDEND", label: "Dividend" },
  { value: "TRADER", label: "Trader" },
] as const;

export type InvestmentStyleValue = (typeof INVESTMENT_STYLES)[number]["value"];

export const SECTOR_OPTIONS = [
  { value: "BANKING", label: "Perbankan" },
  { value: "TECHNOLOGY", label: "Teknologi" },
  { value: "ENERGY", label: "Energi" },
  { value: "CONSUMER", label: "Konsumer" },
  { value: "INFRASTRUCTURE", label: "Infrastruktur" },
  { value: "PROPERTY", label: "Properti" },
  { value: "HEALTHCARE", label: "Kesehatan" },
  { value: "BASIC_MATERIALS", label: "Bahan Baku" },
  { value: "INDUSTRIALS", label: "Industrial" },
] as const;

export type SectorValue = (typeof SECTOR_OPTIONS)[number]["value"];

export function investmentStyleLabel(value: string | null | undefined) {
  return INVESTMENT_STYLES.find((option) => option.value === value)?.label ?? null;
}

export function sectorLabel(value: string) {
  return SECTOR_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function memberAvatarUrl(id: string, mimeType: string | null, updatedAt: Date | string) {
  return mimeType ? `/api/members/${id}/avatar?v=${new Date(updatedAt).getTime()}` : null;
}
