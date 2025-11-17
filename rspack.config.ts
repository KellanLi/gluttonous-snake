import { defineConfig } from '@rspack/cli';
import {
  type RspackPluginFunction,
  rspack,
  type SwcLoaderOptions,
} from '@rspack/core';
import { VueLoaderPlugin } from 'vue-loader';
import path from 'path';

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['last 2 versions', '> 0.2%', 'not dead', 'Firefox ESR'];

export default defineConfig({
  entry: {
    main: './src/main.ts',
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, './docs'),
  },
  devServer: {
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['...', '.ts', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          experimentalInlineMatchResource: true,
        },
      },
      {
        test: /\.(js|ts)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                },
              },
              env: { targets },
            } satisfies SwcLoaderOptions,
          },
        ],
      },
      {
        test: /\.svg/,
        type: 'asset/resource',
      },

      {
        test: /\.less$/,
        use: [
          {
            loader: 'less-loader', // 处理 LESS
          },
        ],
        type: 'css',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    new rspack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new VueLoaderPlugin() as RspackPluginFunction,
  ],
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  experiments: {
    css: true,
  },
});
