export default function insertStyleTag(href) {
  // First check if there's already a link with this exact href
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }
  
  // Extract a more reliable identifier from the URL
  let identifier;
  try {
    const url = new URL(href, window.location.href);
    // Get the filename from the path
    identifier = url.pathname.split('/').pop();
  } catch (e) {
    // Fallback to using the href itself if URL parsing fails
    identifier = href;
  }
  
  // Look for any link that contains this identifier
  if (identifier && document.querySelector(`link[href*="${identifier}"]`)) {
    return;
  }
  
  // If no duplicate found, add the stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}