document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".artalk-comments").forEach(element => {
        Artalk.init({
            el: element,
            pageKey: element.dataset.pageKey,
            pageTitle: element.dataset.pageTitle,
            server: "https://comments.jimverse.dev",
            site: "Jimverse",
            darkMode: document.documentElement.dataset.theme === "dark",
            beforeSubmit(editor, next) {
                if (editor.getState() !== "edit") {
                    const link = editor.getHeaderInputEls().link;
                    link.value = "";
                    link.dispatchEvent(new Event("input", { bubbles: true }));
                }
                next();
            },
        });
    });
});