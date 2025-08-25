import { defineConfig } from '@tarojs/cli'
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')

import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig = {
    projectName: 'game-accounting',
    date: '2025-6-21',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      // 开启 webpack5 的持久化缓存
      webpackChain(chain) {
        chain.merge({
          module: {
            rules: [
              {
                test: /\.m?js$/,
                resolve: {
                  fullySpecified: false
                }
              }
            ]
          }
        })
        // 添加 weapp-tailwindcss 插件
        chain.merge({
          plugin: {
            install: {
              plugin: UnifiedWebpackPluginV5,
              args: [{
                appType: 'taro',
                // 下面个配置，会开启 rem -> rpx 的转化
                rem2rpx: true
              }]
            }
          }
        })
      },
      // 开启 webpack5 的持久化缓存
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        url: {
          enable: true,
          config: {
            limit: 1024 // 设定转换尺寸上限
          }
        },
        cssModules: {
          enable: false, // 如果需要 cssModules 功能，请设置为 true
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      // 开启 webpack5 的持久化缓存
      webpackChain(chain) {
        chain.merge({
          module: {
            rules: [
              {
                test: /\.m?js$/,
                resolve: {
                  fullySpecified: false
                }
              }
            ]
          }
        })
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {

          }
        },
        cssModules: {
          enable: false, // 如果需要 cssModules 功能，请设置为 true
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  } else {
    return merge({}, baseConfig, prodConfig, {
      mini: {
        webpackChain(chain) {
          chain.merge({
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  resolve: {
                    fullySpecified: false
                  }
                }
              ]
            }
          })
        }
      },
      h5: {
        webpackChain(chain) {
          chain.merge({
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  resolve: {
                    fullySpecified: false
                  }
                }
              ]
            }
          })
        }
      }
    })
  }
})
