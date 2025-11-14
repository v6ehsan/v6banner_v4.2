const https = require('https');

const webhookURL = process.env.DISCORD_WEBHOOK; // Secret
if (!webhookURL) {
    console.error("DISCORD_WEBHOOK not found!");
    process.exit(1);
}

const github = JSON.parse(process.argv[2]);

let payload = {};

if (github.event_name === 'push') {
    const head = github.event.head_commit;
    const files = [
        ...(head.added || []),
        ...(head.modified || []),
        ...(head.removed || [])
    ].join("\n") || "No files";

    payload = {
        embeds: [
            {
                title: "🚀 New Push on Repo: " + github.repository.name,
                description: `By **${github.pusher.name}**\nCommit: [${head.id.substring(0,7)}](${head.url})`,
                color: 5814783,
                fields: [
                    { name: "📂 Files Changed", value: files, inline: false }
                ],
                footer: { text: "v6 DeVzOnE - GitHub Notification 2025" },
                timestamp: head.timestamp
            }
        ]
    };

} else if (github.event_name === 'release') {
    const release = github.event.release;
    payload = {
        embeds: [
            {
                title: "🏷️ New Release: " + release.tag_name,
                description: `By **${github.sender.login}**\nRelease: [${release.name}](${release.html_url})`,
                color: 16753920,
                footer: { text: "v6 DeVzOnE - GitHub Release 2025" },
                timestamp: release.published_at
            }
        ]
    };

} else {
    console.log("Event not handled:", github.event_name);
    process.exit(0);
}

const data = JSON.stringify(payload);
const url = new URL(webhookURL);

const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};

const req = https.request(options, res => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log("Message sent successfully!");
    } else {
        console.error(`Failed to send message. Status: ${res.statusCode}`);
    }
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
