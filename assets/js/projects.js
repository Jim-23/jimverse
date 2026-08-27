

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

loadAboutProject();