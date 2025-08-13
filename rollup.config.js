import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

export default {
    input: "hm.js",
    output: {
        file: "dist/hm.js",
        format: "es",
        sourcemap: true
    },
    treeshake: {
        moduleSideEffects: false
    },
    external: [
        "/scripts/greensock/esm/all.js"
    ],
    plugins: [
        nodeResolve(),
        commonjs(),
        terser({
            compress: {
                drop_console: false,
                drop_debugger: true
            },
            mangle: {
                keep_fnames: true
            }
        }),
        copy({
            targets: [
                { src: "styles", dest: "dist" },
                { src: "templates", dest: "dist" },
                { src: "lang/**/*", dest: "dist/lang" },
                { src: "packs/*", dest: "dist/packs" },
                { src: "system.json", dest: "dist" },
                { src: "template.json", dest: "dist" },
                { src: "LICENSE", dest: "dist" }
            ]
        })
    ]
};
