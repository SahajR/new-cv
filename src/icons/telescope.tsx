import type * as React from 'react';

export function Telescope(props: React.JSX.IntrinsicElements["svg"]) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 12a1 1 0 0 1 .894.553l4 8 .041.093a1 1 0 0 1-1.779.89l-.05-.089L12 15.237l-3.106 6.21a1 1 0 0 1-1.789-.894l4-8 .072-.121A1 1 0 0 1 12 12Z" opacity=".28" />
      <path fill="currentColor" fillRule="evenodd" d="M19.713 2.308a1 1 0 0 1 1.124.73l2.448 9.136a1 1 0 0 1-.707 1.225l-1.931.517a3 3 0 0 1-3.104-1.008l-2.573.513-.004.036A3 3 0 0 1 12 16a3 3 0 0 1-2.578-1.472l-5.387 1.075a2 2 0 0 1-2.323-1.445l-.55-2.053a2 2 0 0 1 1.29-2.413l.853-.289-.172-.644a1 1 0 1 1 1.932-.518l.138.518 10.294-3.49a3 3 0 0 1 2.184-2.421l1.931-.518zm-16.62 9.279.55 2.054 5.388-1.075a3.001 3.001 0 0 1 5.456-1.244q.043.069.084.139l2.195-.437-1.001-3.734z" clipRule="evenodd" />
    </svg>
  )
}
