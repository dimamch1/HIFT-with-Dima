module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      function importMetaTransformPlugin({ types: t }) {
        return {
          visitor: {
            MetaProperty(path) {
              if (
                path.node.meta &&
                path.node.meta.name === 'import' &&
                path.node.property &&
                path.node.property.name === 'meta'
              ) {
                path.replaceWith(
                  t.objectExpression([
                    t.objectProperty(
                      t.identifier('env'),
                      t.memberExpression(t.identifier('process'), t.identifier('env'))
                    ),
                    t.objectProperty(t.identifier('url'), t.stringLiteral(''))
                  ])
                );
              }
            }
          }
        };
      }
    ]
  };
};
