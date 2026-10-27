// Simple skyline silhouettes for each destination, drawn in currentColor so
// they sit on any background. Hand-drawn SVG: no image hosting or licensing.

function Singapore() {
  return (
    <>
      {/* Singapore Flyer */}
      <circle cx="70" cy="92" r="40" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M70 52v80M30 92h80M42 64l56 56M98 64l-56 56" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <path d="M60 160l10-68 10 68z" />
      {/* Marina Bay Sands */}
      <rect x="150" y="62" width="22" height="98" />
      <rect x="186" y="62" width="22" height="98" />
      <rect x="222" y="62" width="22" height="98" />
      <path d="M136 52q60-9 124-2v7l-124 3z" />
      {/* Supertrees */}
      <path d="M292 160l3-48-16-16h38l-16 16 3 48z" />
      <path d="M330 160l3-64-18-18h42l-18 18 3 64z" />
      <path d="M368 160l3-38-14-14h34l-14 14 3 38z" />
    </>
  );
}

function Jaipur() {
  return (
    <>
      {/* Chhatri (domed pavilion) */}
      <path d="M22 160v-36h44v36z" />
      <path d="M18 124q26-34 52 0z" />
      <rect x="42" y="82" width="4" height="10" />
      {/* Hawa Mahal: stepped facade with domes */}
      <rect x="110" y="112" width="180" height="48" />
      <rect x="126" y="88" width="148" height="26" />
      <rect x="142" y="66" width="116" height="24" />
      <rect x="158" y="48" width="84" height="20" />
      <rect x="176" y="34" width="48" height="16" />
      {[118, 134, 150, 166, 184, 216, 234, 250, 266, 282].map((x) => (
        <circle key={x} cx={x} cy={x < 200 ? 140 - (200 - x) / 2.6 : 140 - (x - 200) / 2.6} r="6" />
      ))}
      <g fill="#000" fillOpacity="0.22">
        {[124, 148, 172, 196, 220, 244, 268].map((x) => (
          <path key={x} d={`M${x} 160v-24q6-8 12 0v24z`} />
        ))}
        {[146, 170, 194, 218, 242].map((x) => (
          <rect key={x} x={x} y="94" width="10" height="14" rx="5" />
        ))}
      </g>
      {/* Fort wall */}
      <path d="M318 160v-30h12v-8h10v8h12v-8h10v8h12v-8h10v38z" />
    </>
  );
}

function London() {
  return (
    <>
      {/* Big Ben */}
      <rect x="56" y="44" width="28" height="116" />
      <path d="M54 44l16-36 16 36z" />
      <circle cx="70" cy="62" r="9" fill="#000" fillOpacity="0.22" />
      {/* London Eye */}
      <circle cx="140" cy="104" r="36" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M140 68v72M104 104h72M115 79l50 50M165 79l-50 50" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <path d="M130 160l10-56 10 56z" />
      {/* Tower Bridge */}
      <rect x="220" y="58" width="24" height="102" />
      <rect x="306" y="58" width="24" height="102" />
      <path d="M218 58l14-24 14 24zM304 58l14-24 14 24z" />
      <rect x="244" y="64" width="62" height="6" />
      <rect x="244" y="74" width="62" height="4" />
      <rect x="186" y="128" width="178" height="6" />
      <path d="M190 128q20-46 30-60M330 68q14 30 30 60" fill="none" stroke="currentColor" strokeWidth="3" />
    </>
  );
}

const ART: Record<string, () => React.JSX.Element> = { SIN: Singapore, JAI: Jaipur, LHR: London };

export function DestinationArt({ code, className }: { code: string; className?: string }) {
  const Art = ART[code];
  if (!Art) return null;
  return (
    <svg viewBox="0 0 400 160" fill="currentColor" aria-hidden="true" className={className} preserveAspectRatio="xMidYMax meet">
      <Art />
      <rect x="0" y="156" width="400" height="4" opacity="0.5" />
    </svg>
  );
}
