function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const button = document.querySelector("#theme-toggle");
    const icon = document.querySelector("#theme-toggle-icon");

    const isDark = theme === "dark";

    if (icon) {
        icon.src = isDark
            ? "/assets/icons/sun_icon.png"
            : "/assets/icons/moon_icon.png";
    }

    if (button) {
        const nextLabel = isDark
            ? "Switch to light mode"
            : "Switch to dark mode";

        button.setAttribute("aria-label", nextLabel);
        button.setAttribute("title", nextLabel);
        button.setAttribute("aria-pressed", String(isDark));
    }
}

function getPreferredTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function initThemeToggle() {
    const button = document.querySelector("#theme-toggle");

    if (!button) {
        return;
    }

    applyTheme(getPreferredTheme());

    button.addEventListener("click", () => {
        const current =
            document.documentElement.getAttribute("data-theme") || "light";

        const next = current === "dark" ? "light" : "dark";

        localStorage.setItem("theme", next);
        applyTheme(next);
    });
}

initThemeToggle();