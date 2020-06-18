const withLess = require("@zeit/next-less");
const WithCss = require('@zeit/next-css');
const lessToJS = require("less-vars-to-js");
const fs = require('fs');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production'

//主题配置  全局注入
const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, "./public/style/modifyVars.less"), "utf8")
);

// fix: prevents error when .less files are required by node
if (typeof require !== "undefined") {
    require.extensions[".less"] = file => { };
}

if (typeof require !== 'undefined') {
    require.extensions['.css'] = file => { }
}

module.exports = withLess(
    WithCss({
        lessLoaderOptions: {
            javascriptEnabled: true,
            modifyVars: themeVariables,
            localIdentName: "[local]___[hash:base64:5]"
        },
        distDir: 'build',
        generateEtags: false,
        generateBuildId: async () => {
            return 'tgbk-build';   // 'build-' + Date.now(); 这样会生成多个不一样的build文件可以当版本用 ，但是我不想要，影响我脚本上传七牛了， 我就要一个，写死
        },
        assetPrefix: isProd ? 'http://cdn.zjutshideshan.cn' : '', // build后静态文件加上前缀 
        webpack: (config) => {
            // config.plugins.push(
            //   new FilterWarningsPlugin({
            //     exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
            //   })
            // );

            // md支持公式渲染
            config.module.rules.push({
                test: /\.(ttf|eot|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[ext]',
                },
            })

            return config;
        }
    })
)