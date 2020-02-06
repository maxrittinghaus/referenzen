const path = require('path');

module.exports = (env, {
  mode = 'production',
  watch = false,
  uglify = mode === 'production',
}) => {
  const config = {
    mode,
    watch,
    entry: path.join(__dirname, './src/index.js'),
    output: {
      path: path.join(__dirname, './dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs',
    },
    devtool: mode === 'production' ? 'nosources-source-map' : 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: { babelrc: true },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js'],
    },
  };

  if (uglify === true) {
    // todo add uglify
  }

  return config;
};
