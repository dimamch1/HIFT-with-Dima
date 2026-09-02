const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Custom resolver to ensure Zustand resolves to CommonJS files
// and prevents 'import.meta' SyntaxError on web bundle
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/zustand/index.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName.startsWith('zustand/')) {
    const subpath = moduleName.replace(/^zustand\//, '');
    const candidate = path.resolve(__dirname, 'node_modules/zustand', `${subpath}.js`);
    if (fs.existsSync(candidate)) {
      return {
        filePath: candidate,
        type: 'sourceFile',
      };
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
