function detectAllGoogleSiteLinks() {
  const threads = GmailApp.search("in:inbox newer_than:30d"); // configure the dates you need to scrap
  const label = GmailApp.createLabel("Microsite"); // Label Folder change if desired

  threads.forEach((thread) => {
    const messages = thread.getMessages();
    messages.forEach((message) => {
      const htmlBody = message.getBody();

      // Check direct plain-text match
      if (htmlBody.includes("sites.google.com")) {
        applyMicrositeLabelAndArchive(thread, label);
        Logger.log(
          "Found plain sites.google.com link in: " + message.getSubject()
        );
        return;
      }

      // Check masked <a href> links
      const hrefRegex =
        /<a\s[^>]*?href=["'](https:\/\/sites\.google\.com\/[^"']+)["'][^>]*?>.*?<\/a>/gi;
      let match;
      while ((match = hrefRegex.exec(htmlBody)) !== null) {
        const foundUrl = match[1];
        applyMicrositeLabelAndArchive(thread, label);
        Logger.log(
          "Found masked link: " + foundUrl + " in: " + message.getSubject()
        );
        return;
      }

      // Fallback: check raw URLs in the body
      const rawLinkRegex = /(https:\/\/sites\.google\.com\/[^\s"'<>]+)/gi;
      const rawMatches = htmlBody.match(rawLinkRegex);
      if (rawMatches && rawMatches.length > 0) {
        applyMicrositeLabelAndArchive(thread, label);
        Logger.log(
          "Found raw link(s): " +
            rawMatches.join(", ") +
            " in: " +
            message.getSubject()
        );
        return;
      }
    });
  });
}

// Label thread and remove from Inbox
function applyMicrositeLabelAndArchive(thread, label) {
  const existingLabels = thread.getLabels().map((l) => l.getName());
  if (!existingLabels.includes(label.getName())) {
    thread.addLabel(label);
  }
  thread.moveToArchive(); // removes it from Inbox
}
