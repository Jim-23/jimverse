async function loadDevlog() {
    const container = document.querySelector("#devlog");

    if (!container) {
        return;
    }

    const project = container.dataset.project;

    let entries = [];

    if (project === "latest") {
        // load the latest devlog entry from all projects
        entries = await loadLatestDevlog();
    } else if (project && project !== "all") {
        entries = await loadProjectDevlog(project);
    } else {
        entries = await loadAllDevlogs();
    }

    entries.sort(compareDevlogEntries);

    renderDevlog(container, entries);
}

async function loadLatestDevlog() {
    const entries = await loadAllDevlogs();

    if (!entries.length) {
        return [];
    }

    const sortedEntries = [...entries].sort(compareDevlogEntries);
    const latestEntry = sortedEntries[0];
    
    // return latest entry in an array to keep the same structure as other functions
    return [latestEntry];
}

async function loadLatestDevlogSection() {
    const container = document.querySelector("#latest-devlog");

    if (!container) {
        return;
    }

    const entries = await loadLatestDevlog();
    renderDevlog(container, entries);
}

async function loadProjectDevlog(project) {
    try {
        const response = await fetch(`/data/devlogs/${project}.json`);

        if (!response.ok) {
            return [];
        }

        const entries = await response.json();

        return entries.map(entry => ({
            ...entry,
            project
        }));
    } catch (error) {
        return [];
    }
}

async function loadAllDevlogs() {
    const response = await fetch('/data/projects.json');
    const projects = await response.json();

    const devlogs = await Promise.all(
        projects.map(project => loadProjectDevlog(project.id))
    );

    return devlogs.flat();
}

function getEntryTimestamp(entry) {
    if (entry.createdAt) {
        const createdAtTimestamp = Date.parse(entry.createdAt);
        if (!Number.isNaN(createdAtTimestamp)) {
            return createdAtTimestamp;
        }
    }

    if (entry.date) {
        const dateTimestamp = Date.parse(entry.date);
        if (!Number.isNaN(dateTimestamp)) {
            return dateTimestamp;
        }
    }

    return Number.NEGATIVE_INFINITY;
}

function getEntryOrder(entry) {
    return Number.isFinite(entry.order) ? entry.order : 0;
}

function compareDevlogEntries(a, b) {
    const timestampDiff = getEntryTimestamp(b) - getEntryTimestamp(a);
    if (timestampDiff !== 0) {
        return timestampDiff;
    }

    const orderDiff = getEntryOrder(b) - getEntryOrder(a);
    if (orderDiff !== 0) {
        return orderDiff;
    }

    return String(b.version || "").localeCompare(String(a.version || ""), undefined, {
        numeric: true,
        sensitivity: "base"
    });
}

function resolveDevlogImageSrc(entry, imageSrc) {
    if (!imageSrc) {
        return "";
    }

    // Keep absolute/data URLs untouched.
    if (/^(https?:)?\/\//.test(imageSrc) || imageSrc.startsWith("/") || imageSrc.startsWith("data:")) {
        return imageSrc;
    }

    // Relative paths in JSON (for example "photos/x.jpg") are project-scoped.
    if (entry?.project) {
        return `/projects/${entry.project}/${imageSrc}`;
    }

    return imageSrc;
}

function renderDevlog(container, entries) {
    if (!entries.length) {
        container.innerHTML = "<p>No entries yet.</p>";
        return;
    }

    container.innerHTML = entries.map(entry => `
        <article>
            ${entry.date
                ? `<time datetime="${entry.date}">${entry.date}</time>`
                : ""
            }
            <h3>${entry.project ? `<a href="/projects/${entry.project}/">${entry.project}</a>` : "General"}</h3>
            <h4>${entry.title}</h4>

            ${entry.items
                ? `
                    <ul>
                        ${entry.items.map(item => `<li>${item}</li>`).join("")}
                    </ul>
                `
                : ""
            }

            ${entry.images
                ? `
                    <div class="image-grid">
                        ${entry.images.map(image => `
                            <img src="${resolveDevlogImageSrc(entry, image.src)}" alt="${image.alt}" loading="lazy">
                        `).join("")}
                    </div>
                `
                : ""
            }
        </article>
    `).join("");
}

loadDevlog();
loadLatestDevlogSection();