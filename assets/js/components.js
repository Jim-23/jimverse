async function loadComponent(selector, path) {
    const element = document.querySelector(selector);

    if (!element) {
        return;
    }

    const response = await fetch(path);
    element.innerHTML = await response.text();
}

loadComponent("#site-header", "/assets/components/header.html");
loadComponent("#site-footer", "/assets/components/footer.html");