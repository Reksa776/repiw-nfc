export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-label={message}>
      <div className="loading-emblem" aria-hidden="true"><span>R</span><i /><b /></div>
      <strong>repiw<span>.</span></strong>
      <p>{message}</p>
      <div className="loading-track" aria-hidden="true"><i /></div>
    </div>
  );
}
