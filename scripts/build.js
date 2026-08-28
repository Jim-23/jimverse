import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");

const header = await fs.readFile(path.join(rootDir, "assets/components/header.html"), "utf-8");
const footer = await fs.readFile(path.join(rootDir, "assets/components/footer.html"), "utf-8");

const projects = JSON.parse(await fs.readFile(path.join(rootDir, "data/projects.json"), "utf-8"));
const fieldNotes = JSON.parse(await fs.readFile(path.join(rootDir, "data/field-notes.json"), "utf-8"));

fieldNotes.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
);

function generateAboutProject(projectId) {
    const projectData = projects.find(
        project => project.id === projectId
    );

    if (!projectData) {
        return "";
    }

    return `
        <h2>${projectData.name}</h2>

        <h3>${projectData.description}</h3>

        <p>Status: ${projectData.status}</p>

        <p>${projectData.about}</p>

        <p>
            Repository:
            <a href="${projectData.repository}">
                ${projectData.repository}
            </a>
        </p>
    `;
}

function generateFieldNotes(entries) {
    if (!entries.length) {
        return "<p>No field notes available.</p>";
    }

    return entries.map(entry => `
        <article class="field-note">

            <h3>${entry.title}</h3>

            ${
                entry.date
                    ? `<time datetime="${entry.date}">${entry.date}</time>`
                    : ""
            }

            ${
                entry.content
                    ? entry.content
                        .map(paragraph => `<p>${paragraph}</p>`)
                        .join("")
                    : ""
            }

            ${
                entry.tags?.length
                    ? `
                        <div class="field-note-tags">
                            ${
                                entry.tags
                                    .map(tag => `<span class="tag">#${tag}</span>`)
                                    .join("")
                            }
                        </div>
                    `
                    : ""
            }

            ${
                entry.image
                    ? `<img src="${entry.image}" alt="${entry.title}">`
                    : ""
            }

        </article>
    `).join("");
}


// DEVLOG RELATED HELPERS
async function loadAllDevlogs() {
    const devlogs = await Promise.all(
        projects.map(async project => {
            const filePath = path.join(
                rootDir,
                "data/devlogs",
                `${project.id}.json`
            );

            try {
                const content = await fs.readFile(
                    filePath,
                    "utf8"
                );

                const entries = JSON.parse(content);

                return entries.map(entry => ({
                    ...entry,
                    project: project.id
                }));
            } catch {
                return [];
            }
        })
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
    return Number.isFinite(entry.order)
        ? entry.order
        : 0;
}

function compareDevlogEntries(a, b) {
    const timestampDiff =
        getEntryTimestamp(b) - getEntryTimestamp(a);

    if (timestampDiff !== 0) {
        return timestampDiff;
    }

    const orderDiff =
        getEntryOrder(b) - getEntryOrder(a);

    if (orderDiff !== 0) {
        return orderDiff;
    }

    return String(b.version || "").localeCompare(
        String(a.version || ""),
        undefined,
        {
            numeric: true,
            sensitivity: "base"
        }
    );
}

const devlogEntries = await loadAllDevlogs();
devlogEntries.sort(compareDevlogEntries);

// MORE DEVLOGS HELPERS

function resolveDevlogImageSrc(entry, imageSrc) {
    if (!imageSrc) {
        return "";
    }

    if (
        /^(https?:)?\/\//.test(imageSrc) ||
        imageSrc.startsWith("/") ||
        imageSrc.startsWith("data:")
    ) {
        return imageSrc;
    }

    if (entry?.project) {
        return `/projects/${entry.project}/${imageSrc}`;
    }

    return imageSrc;
}

function generateDevlogEntries(entries) {
    if (!entries.length) {
        return "<p>No entries yet.</p>";
    }

    return entries.map(entry => `
        <article>
            ${
                entry.date
                    ? `<time datetime="${entry.date}">${entry.date}</time>`
                    : ""
            }

            <h3>
                ${
                    entry.project
                        ? `<a href="/projects/${entry.project}/">${entry.project}</a>`
                        : "General"
                }
            </h3>

            <h4>${entry.title}</h4>

            ${
                entry.items
                    ? `
                        <ul>
                            ${entry.items
                                .map(item => `<li>${item}</li>`)
                                .join("")}
                        </ul>
                    `
                    : ""
            }

            ${
                entry.images
                    ? `
                        <div class="image-grid">
                            ${entry.images
                                .map(image => `
                                    <img
                                        src="${resolveDevlogImageSrc(entry, image.src)}"
                                        alt="${image.alt}"
                                        loading="lazy"
                                    >
                                `)
                                .join("")}
                        </div>
                    `
                    : ""
            }
        </article>
    `).join("");
}


function getDevlogEntries(project) {
    if (project === "latest") {
        return devlogEntries.slice(0, 1);
    }

    if (project && project !== "all") {
        return devlogEntries.filter(
            entry => entry.project === project
        );
    }

    return devlogEntries;
}

// PROJECT CARDS RELATED

function generateProjectCards(filterMode = "active") {
    const visibleProjects = filterMode === "all" ? projects : projects.filter(project => project.status === "active");

    return visibleProjects.map(project => `
        <article>
            <h3>
                <a href="${project.url}">
                    ${project.name}
                </a>
            </h3>

            <p>${project.description}</p>

            <p>Status: ${project.status}</p>

            <p>
                Repository:
                <a href="${project.repository}">
                    ${project.repository}
                </a>
            </p>
        </article>
    `).join("");
}

// FILE AND DIRECTORY PROCESSING RELATED

async function copyDirectory(source, destination) {
    await fs.mkdir(destination, { recursive: true });

    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destinationPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(sourcePath, destinationPath);
        } else {
            await fs.copyFile(sourcePath, destinationPath);
        }
    }
}

async function processDirectory(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(currentDir, entry.name);
        
        const relativePath = path.relative(srcDir, sourcePath);

        const outputPath = path.join(distDir, relativePath);

        if (entry.isDirectory()) {
            await fs.mkdir(outputPath, { recursive: true });
            await processDirectory(sourcePath);
        };

        if (entry.isFile()) {
            await fs.mkdir(
                path.dirname(outputPath),
                {
                    recursive: true
                }
            );

            if (entry.name.endsWith(".html")) {
                let html = await fs.readFile(
                    sourcePath,
                    "utf8"
                );

                html = html
                    .replace("<!-- HEADER -->", header)
                    .replace("<!-- FOOTER -->", footer)
                    .replace(/<div id="current-projects"([^>]*)><\/div>/,
                        (match, attributes) => {
                            const filterMatch =
                                attributes.match(/data-filter="([^"]+)"/);

                            const filterMode =
                                filterMatch?.[1] || "active";

                            return `<div id="current-projects"${attributes}>
                                ${generateProjectCards(filterMode)}
                            </div>`;
                        }
                    )
                    .replace(
                        /<div id="devlog"([^>]*)><\/div>/,
                        (match, attributes) => {
                            const projectMatch =
                                attributes.match(/data-project="([^"]+)"/);

                            const project =
                                projectMatch?.[1] || "all";

                            return `<div id="devlog"${attributes}>
                                ${generateDevlogEntries(
                                    getDevlogEntries(project)
                                )}
                            </div>`;
                        }
                    )
                    .replace(
                        /<div id="latest-devlog"><\/div>/,
                        `<div id="latest-devlog">
                            ${generateDevlogEntries(
                                getDevlogEntries("latest")
                            )}
                        </div>`
                    )
                    .replace(
                        /<div id="field-notes"([^>]*)><\/div>/,
                        (match, attributes) => `
                            <div id="field-notes"${attributes}>
                                ${generateFieldNotes(fieldNotes)}
                            </div>
                        `
                    )
                    .replace(
                        /<div id="about-project"([^>]*)><\/div>/,
                        (match, attributes) => {
                            const projectMatch =
                                attributes.match(/data-project="([^"]+)"/);

                            const projectId = projectMatch?.[1];

                            return `<div id="about-project"${attributes}>
                                ${generateAboutProject(projectId)}
                            </div>`;
                        }
                    );

                await fs.writeFile(
                    outputPath,
                    html
                );

            } else {
                await fs.copyFile(
                    sourcePath,
                    outputPath
                );

            }
        }
    };
}


await fs.rm(distDir, {recursive: true,force: true});
await fs.mkdir(distDir, {recursive: true});

await processDirectory(srcDir);

await copyDirectory(path.join(rootDir, "assets"), path.join(distDir, "assets"));
await copyDirectory(path.join(rootDir, "data"), path.join(distDir, "data"));
console.log("Build complete");
