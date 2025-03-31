function detectAllGoogleSiteLinks() {
    const threads = GmailApp.search('in:inbox newer_than:30d'); // configure the dates you need to scrap
    const label = GmailApp.createLabel("Microsite"); // Label Folder change it desired name

    threads.forEach(thread => {
        const messages = thread.getMessages();
        messages.forEach(message => {
            const htmlBody = message.getBody();

            // Simple match: visible or raw URLs
            if (htmlBody.includes("sites.google.com")) {
                applyMicrositeLabelAndArchive(thread, label);
                Logger.log("Found direct site.google.com link in: " + message.getSubject());
                return;
            }

            // Masked <a href> links
            const hrefRegex = /<a\s[^>]*?href=["'](https:\/\/sites\.google\.com\/[^"']+)["'][^>]*?>.*?<\/a>/gi;
            let match;
            while ((match = hrefRegex.exec(htmlBody)) !== null) {
                const foundUrl = match[1];
                if (foundUrl.includes("sites.google.com")) {
                    applyMicrositeLabelAndArchive(thread, label);
                    Logger.log("Found masked link to: " + foundUrl + " in: " + message.getSubject());
                    break;
                }
            }
        });
    });
}

// Label thread and remove from Inbox
function applyMicrositeLabelAndArchive(thread, label) {
    const existingLabels = thread.getLabels().map(l => l.getName());
    if (!existingLabels.includes(label.getName())) {
        thread.addLabel(label);
    }
    thread.moveToArchive(); // removes it from Inbox
}
