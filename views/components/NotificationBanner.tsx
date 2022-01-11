export default function NotificationBanner() {

  const displayError = false;
  if (!displayError)
    return null;
  return (
    <div className="notification is-danger is-radiusless mb-0">The save file format is changing on Friday - all existing saved/exported lists will need to be recreated!</div>
  );
}