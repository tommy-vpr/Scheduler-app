export default function getColorForId(id: number): string {
  const colors = [
    "bg-amber-400",
    "bg-rose-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-orange-400",
    "bg-teal-400",
  ];
  return colors[id % colors.length];
}
