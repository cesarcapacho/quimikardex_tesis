export const GHS_PICTOGRAMS = [
  { key: 'ghs_explosivo', label: 'Explosivo', code: 'GHS01', emoji: '💥' },
  { key: 'ghs_inflamable', label: 'Inflamable', code: 'GHS02', emoji: '🔥' },
  { key: 'ghs_comburente', label: 'Comburente', code: 'GHS03', emoji: '⭕' },
  { key: 'ghs_gas_presion', label: 'Gas a presión', code: 'GHS04', emoji: '🫧' },
  { key: 'ghs_corrosivo', label: 'Corrosivo', code: 'GHS05', emoji: '⚗️' },
  { key: 'ghs_toxico', label: 'Tóxico', code: 'GHS06', emoji: '☠️' },
  { key: 'ghs_irritante', label: 'Irritante', code: 'GHS07', emoji: '⚠️' },
  { key: 'ghs_peligro_salud', label: 'Peligro salud', code: 'GHS08', emoji: '🫁' },
  { key: 'ghs_medio_ambiente', label: 'Medio ambiente', code: 'GHS09', emoji: '🌿' },
];

export function getActiveGhs(reactivo) {
  return GHS_PICTOGRAMS.filter((p) => reactivo?.[p.key]);
}