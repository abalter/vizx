import { resolve } from "node:path";

export default {
  resolve: {
    alias: {
      "@vizx/core": resolve("./packages/core/src/index.ts"),
      "@vizx/geometry": resolve("./packages/geometry/src/index.ts"),
      "@vizx/object-model": resolve("./packages/object-model/src/index.ts"),
      "@vizx/resolver": resolve("./packages/resolver/src/index.ts"),
      "@vizx/parser": resolve("./packages/parser/src/index.ts"),
      "@vizx/interpreter": resolve("./packages/interpreter/src/index.ts"),
      "@vizx/renderer-svg": resolve("./packages/renderer-svg/src/index.ts"),
    },
  },
};