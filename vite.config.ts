import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { GitRevisionPlugin } from 'git-revision-webpack-plugin'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'

const release = new GitRevisionPlugin().commithash() || 'LOCAL'

export default defineConfig({
  define: {
    RELEASE_VERSION: JSON.stringify(release),
    BUILD_TIMESTAMP: new Date().valueOf(),
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // keep these dependencies as external so they don't get bundled with our code
          // this keeps our overall bundle size down
          if (id.includes('node_modules')) {
            // with id being a string like
            // "C:/Users/ricar/projects/tt/pnpm-mono/node_modules/.pnpm/core-js@2.6.12/node_modules/core-js/library/modules/es6.object.create.js?commonjs-exports"
            // return "core-js@2.6.12"
            const regex = /\/\.pnpm\/([^/]+)@([^/]+)\//
            const match = id.match(regex)

            if (match && match.length >= 3) {
              const packageName = match[1]
              const packageVersion = match[2]
              return `${packageName}@${packageVersion}`
            } else {
              throw Error(
                'Could not parse package name and version from id: ' + id
              )
            }
          }
        },
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    basicSsl(),
    react({
      // needed due to our usage of an older version of react
      jsxRuntime: 'classic',
      babel: {
        plugins: [
          // needed to support css prop in JSX
          [
            'babel-plugin-styled-components',
            {
              ssr: false,
              cssProp: true,
              fileName: false,
              pure: true,
              transpileTemplateLiterals: false,
            },
          ],
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-proposal-private-methods', { loose: true }],
          [
            '@babel/plugin-proposal-private-property-in-object',
            { loose: true },
          ],
        ],
      },
    }),
    sentryVitePlugin({
      org: 'traction-tools-6k',
      project: 'bloom-web',
      authToken:
        '992009eca86146f1a06203943a483a7ca17548c063ba45baa9b34bf0f49f73a8',
      release: {
        name: release,
      },
      sourcemaps: {
        filesToDeleteAfterUpload: ['**/assets/**/*.map'],
      },
    }),
  ],
  server: {
    host: 'local.bloomgrowth.com',
    port: 443,
  },
})
