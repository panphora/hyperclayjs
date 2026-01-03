# Contributing to Hyperclay

## Build System

This project uses a build system that generates several files from source templates. **Do not edit the generated files directly** - your changes will be overwritten.

### Source Files (edit these)

| File | Description |
|------|-------------|
| `build/generate-dependency-graph.js` | Module definitions, descriptions, exports, and presets |
| `build/README.template.md` | Template for README.md |
| `build/build-loader.js` | Generates hyperclay.js |
| `build/generate-readme.js` | Generates README.md from template |

### Generated Files (do not edit)

| File | Generated from |
|------|----------------|
| `module-dependency-graph.generated.json` | `generate-dependency-graph.js` |
| `hyperclay.js` | `build-loader.js` + `module-dependency-graph.generated.json` |
| `README.md` | `README.template.md` + `module-dependency-graph.generated.json` |

### Special Case: index.html

`index.html` loads `module-dependency-graph.generated.json` at runtime (copied to `website/dist/` during website build) and dynamically renders module information. The module data (names, descriptions, exports) comes from the JSON file, but the rendering template is in `index.html` itself.

## How Dependencies Are Tracked

Dependencies between modules are **automatically detected** by [Madge](https://github.com/pahen/madge), which analyzes the `import` statements in each file. You don't need to manually declare dependencies anywhere - just import what you need and run the build.

## Making Changes

1. **Module names, descriptions, exports** → Edit `build/generate-dependency-graph.js`
2. **README content** → Edit `build/README.template.md`
3. **UI rendering logic** → Edit `index.html` directly
4. **Build process** → Edit the relevant file in `build/`

After modifying source files, run the build to regenerate files:

```bash
npm run build
```
