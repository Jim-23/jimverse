

function getDataBasePath() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    return depth === 0 ? "." : Array(depth).fill("..").join("/");
}

async function loadAboutProject() {
    const container = document.querySelector("#about-project");

    if (!container) {
        return;
    }

    const project = container.dataset.project || container.dataset.filter;
    const basePath = getDataBasePath();


    const response = await fetch(`${basePath}/data/projects.json`);

    if (!response.ok) {
            return;
    }

    const projects = await response.json();
    const projectData = projects.find(p => p.id === project);

    if (!projectData) {
            return;
    }

    container.innerHTML = `
        <h2>${projectData.name}</h2>
        <h3>${projectData.description}</h3>
        <p>Status: ${projectData.status}</p>
        <p>${projectData.about}</p>
        <p>Repository: <a href="${projectData.repository}">${projectData.repository}</a></p>
        `;

    return projectData;

}

async function loadProjects() {
    const container = document.querySelector("#current-projects");

    if (!container) {
        return;
    }

    const basePath = getDataBasePath();
    const response = await fetch(`${basePath}/data/projects.json`);
    const projects = await response.json();

    const filterMode = container.dataset.filter || "active";
    const visibleProjects = filterMode === "all"
        ? projects
        : projects.filter(project => project.status === "active");

    container.innerHTML = visibleProjects.map(project => {
        const href = project.url.startsWith("/")
            ? `${basePath}${project.url}`
            : `${basePath}/${project.url}`;

        return `
            <article>
                <h3>
                    <a href="${href}">
                        ${project.name}
                    </a>
                </h3>

                <p>${project.description}</p>
                <p>Status: ${project.status}</p>
                <p>Repository: <a href="${project.repository}">${project.repository}</a></p>
            </article>
        `;
    }).join("");
}

loadProjects();
loadAboutProject();