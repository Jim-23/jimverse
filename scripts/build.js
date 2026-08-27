import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");

const header = await fs.readFile(path.join(rootDir, "assets/components/header.html"), "utf-8");
const footer = await fs.readFile(path.join(rootDir, "assets/components/footer.html"), "utf-8");

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
                    .replace("<!-- FOOTER -->", footer);

                await fs.writeFile(
                    outputPath,
                    html
                );

                console.log("Built:", relativePath);
            } else {
                await fs.copyFile(
                    sourcePath,
                    outputPath
                );

                console.log("Copied:", relativePath);
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
