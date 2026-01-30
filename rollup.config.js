import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
    input: "src/arknights-card.ts",
    output: {
        file: "dist/arknights-card.js",
        format: "es",
        sourcemap: false,
    },
    plugins: [
        resolve(),
        typescript(),
        terser({
            format: {
                comments: false,
            },
        }),
    ],
};
