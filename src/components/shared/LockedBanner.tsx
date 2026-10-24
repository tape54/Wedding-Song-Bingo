export function LockedBanner({ hasPick }: { hasPick: boolean }) {
  return (
    <div className="banner banner--locked" role="status">
      <strong>🔒 Picks are locked.</strong> The dance floor is open!{' '}
      {hasPick ? 'Watch your songs light up below.' : 'Follow along below.'}
    </div>
  )
}
