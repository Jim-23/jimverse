async function loadFieldNotes() {
    const container = document.querySelector("#field-notes");

    if (!container) {
        return;
    }

    const response = await fetch("/data/field-notes.json");

    if (!response.ok) {
        return;
    }

    const entries = await response.json();

    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderFieldNotes(container, entries);
}

function renderFieldNotes(container, entries) {
    if (!entries.length) {
        container.innerHTML = "<p>No field notes available.</p>";
        return;
    }

    container.innerHTML = entries.map(entry => `
        <article class="field-note">
            <h3>${entry.title}</h3>

            ${entry.date
                ? `<time datetime="${entry.date}">${entry.date}</time>`
                : ""
            }

            ${entry.content
                ? entry.content.map(paragraph => `<p>${paragraph}</p>`).join("")
                : ""
            }

            ${entry.tags?.length
                ? `
                    <div class="field-note-tags">
                        ${entry.tags
                            .map(tag => `<span class="tag">#${tag}</span>`)
                            .join("")
                        }
                    </div>
                `
                : ""
            }

            ${entry.image
                ? `<img src="${entry.image}" alt="${entry.title}">`
                : ""
            }
        </article>
    `).join("");
}

loadFieldNotes();