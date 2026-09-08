// Ícono de TripAdvisor inline (lucide-react no incluye íconos de marca).
export default function TripAdvisorIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="13" r="8" />
      <circle cx="8" cy="13" r="2.5" />
      <circle cx="16" cy="13" r="2.5" />
      <path d="M12 5c-2 0-3.7.7-5 2M12 5c2 0 3.7.7 5 2M9 2l3 3 3-3" />
    </svg>
  );
}
