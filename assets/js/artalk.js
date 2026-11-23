document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".artalk-comments").forEach(element => {
        Artalk.init({
            el: element,
            pageKey: element.dataset.pageKey,
            pageTitle: element.dataset.pageTitle,
            server: "https://comments.jimverse.dev",
            site: "Jimverse",
            darkMode: document.documentElement.dataset.theme === "dark",
        });
    });
});