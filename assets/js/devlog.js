function getDataBasePath() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    return depth === 0 ? "." : Array(depth).fill("..").join("/");
}

async function loadDevlog() {
    const container = document.querySelector("#devlog");

    if (!container) {
        return;
    }

    const project = container.dataset.project;
    const basePath = getDataBasePath();

    let entries = [];

    if (project === "all") {
        entries = await loadAllDevlogs(basePath);
    } else {
        entries = await loadProjectDevlog(project, basePath);
    }

    entries.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;

        return new Date(b.date) - new Date(a.date);
    });

    renderDevlog(container, entries);
}

async function loadProjectDevlog(project, basePath = getDataBasePath()) {
    try {
        const response = await fetch(`${basePath}/data/devlogs/${project}.json`);

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

async function loadAllDevlogs(basePath = getDataBasePath()) {
    const response = await fetch(`${basePath}/data/projects.json`);
    const projects = await response.json();

    const devlogs = await Promise.all(
        projects.map(project => loadProjectDevlog(project.id, basePath))
    );

    return devlogs.flat();
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

            <h3>${entry.title}</h3>

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
                            <img src="${image.src}" alt="${image.alt}" loading="lazy">
                        `).join("")}
                    </div>
                `
                : ""
            }
        </article>
    `).join("");
}

loadDevlog();