export function redirectToMainDomain() {
  const currentHostname = window.location.hostname;

  const domainParts = currentHostname.split(".");
  if (domainParts.length > 2) {
    const mainDomain = `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`;
    window.location.href = `${window.location.protocol}//${mainDomain}`;
  } else {
    console.warn(
      "You are probably running in localhost, there is no main domain to redirect you to. Or you are already on main domain",
    );
  }
}
