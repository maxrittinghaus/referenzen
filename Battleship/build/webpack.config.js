const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractCSS = new ExtractTextPlugin('assets/css/app.css');

const path = require('path');

module.exports = (env, {mode}) => {
    mode = mode || 'production';
    
    return {
      mode,
      entry: [
        './src/client/assets/js/main.js'
      ],
      output: {
        path: __dirname + '/../dist/public',
        filename: 'assets/js/app.js',
      },
      devtool: mode === 'development' ? '#eval-source-map' : undefined,
      module: {
        rules: [
          {
              test: /\.vue$/,
              loader: 'vue-loader',
              options: {
                loaders: {
                  'scss': 'vue-style-loader!css-loader!sass-loader',
                  'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
                },
              },
          },
           {
              test: /\.(png|jpg|gif|svg)$/,
              loader: 'url-loader?name=assets/img/[hash].[ext]'
            },
            {
              test: /\.(eot|ttf|woff2?)$/,
              loader: 'url-loader?name=assets/fonts/[hash].[ext]'
            },
           {
              test: /\.(sa|sc|c)ss$/,
                use: extractCSS.extract([
                  'css-loader',
                  'sass-loader',
                ]),
           },
           
          
        ]
      },
      plugins: [
        new VueLoaderPlugin(),
         new HtmlWebpackPlugin({  // Also generate a test.html
            filename: 'index.html',
            template: path.join(__dirname, '../src/client/index.template.html'),
          }),

         extractCSS,
      ],
        resolve: {
          alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@enum': path.join(__dirname, '../src/enums'),
            '@client': path.join(__dirname, '../src/client/assets/js'),
          },
          extensions: ['.vue', '.js', '.json'],
        }
    }
}