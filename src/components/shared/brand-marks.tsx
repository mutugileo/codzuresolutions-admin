export function ShopifyMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15.34 4.28c-.07-.4-.42-.67-.77-.69-.35-.02-.72-.04-.72-.04s-.57-.55-.8-.77a.52.52 0 0 0-.31-.12l-.54 16.58 5.95-1.3S15.41 4.68 15.34 4.28Z"
        fill="#5E8E3E"
      />
      <path
        d="M12.74 2.66c-.1-.03-.21-.04-.33-.04-.31 0-.64.08-.95.24-.51.26-.95.71-1.26 1.3-.36.01-.72.03-.72.03-.42.02-.83.34-.91.85L6.5 18.69l5.7 1.55.54-17.58Z"
        fill="#95BF47"
      />
      <path
        d="M11.77 9.48c-.31-.15-.69-.24-1.08-.24-.87 0-1.45.55-1.45 1.35 0 .74.47 1.17 1.15 1.49.49.23.66.4.66.66 0 .28-.24.48-.62.48-.44 0-.89-.19-1.22-.43l-.34 1.07c.36.25.92.42 1.48.42.93 0 1.57-.49 1.57-1.4 0-.69-.4-1.13-1.15-1.48-.49-.23-.69-.38-.69-.64 0-.23.2-.43.55-.43.39 0 .72.12.96.25l.18-1.1Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function MpesaMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="4" fill="#1FAA59" fillOpacity="0.16" stroke="#1FAA59" strokeWidth="1.75" />
      <path d="M7.5 15V9l2.5 3.5L12.5 9v6" stroke="#1FAA59" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 12h2" stroke="#1FAA59" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function KraEtimsMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2.75 4.5 6v5.75c0 4.65 3.18 8.9 7.5 10.25 4.32-1.35 7.5-5.6 7.5-10.25V6L12 2.75Z" fill="#B8832B" fillOpacity="0.16" stroke="#B8832B" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="m9 12.2 2 2 4-4.2" stroke="#B8832B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
