'use strict';

// Shared configuration for the whole build.
exports.common = {
  // Output directory.
  output: 'public',
  // File cache directory.
  cache: '.cache',

  theme: 'theme',

  // Assets that require no processing.
  assets: {
    'generator/src/data/_redirects': './',
    'content/img/**': './img/',
  },

};

// @todo Add zip downloads for offline use?
exports.sources = {};

exports.sources.guides = {
  type: 'guide',
  options: {
    base: 'content',
    src: './content/!(classes|whats-new)/**/*.md',
    dest: './',
    metadata: 'generator/src/data/content-metadata.json'
  }
};

exports.sources.releases = {
  type: 'changelog',
  options: {
    owner: 'BabylonJS',
    repo: 'Babylon.js',
    dest: './whats-new',
    tags: [
      ['v3.1.0', { name: '3.1' }],
      ['v3.0.7', { name: '3.0' }]
    ],
    frontmatter: {
      title: 'What\'s new?',
      category: 'What\'s new?',
      abstract: 'Changelogs for current and past releases'
    }
  }
};

exports.sources.apiStable = {
  type: 'api',
  options: {
    source: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/v3.1.0/dist/babylon.d.ts',
    dest: 'api/stable/',
    tags: 'generator/src/data/api.tags.31.json'
  }
};

exports.sources.apiPreview = {
  type: 'api',
  options: {
    source: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/dist/preview%20release/babylon.d.ts',
    dest: 'api/preview/',
    tags: 'generator/src/data/api.tags.31.json'
  }
};

exports.menus = {};

exports.menus.main = [
  { label: 'Babylon.JS',    path: 'http://www.babylonjs.com/', icon: 'play' },
  { label: 'Documentation', path: '/',           icon: 'home' },
  { label: 'What\'s new',   path: '/whats-new',  icon: 'file-text-o' },
  { label: 'Babylon 101',   path: '/babylon101', icon: 'book' },
  { label: 'How To ...',    path: '/How_To',     icon: 'cogs' },
  { label: 'Features',      path: '/features',   icon: 'book' },
  { label: 'Resources',     path: '/resources',  icon: 'rocket' },
  { label: 'Extensions',    path: '/extensions', icon: 'wrench' },
  { label: 'Samples',       path: '/samples',    icon: 'book' },
  { label: 'Classes',       path: '/classes',    icon: 'files-o' },
  { label: 'Playground',    path: '/playground', icon: 'play' }
];

exports.menus.footer = [
  { label: 'Forum',               path: 'http://www.html5gamedevs.com/forum/16-babylonjs', icon: 'html5' },
  { label: 'Github',              path: 'https://github.com/BabylonJS/Babylon.js', icon: 'github' },
  { label: 'Contribute',          path: 'https://github.com/BabylonJS/Documentation', icon: 'code-fork' },
  { label: 'Deployed by netlify', path: 'https://www.netlify.com/', icon: 'heart' }
];

exports.menus.mobile = [].concat(
  exports.menus.main.slice(1),
  exports.menus.main.slice(0, 1),
  exports.menus.footer.slice(0, 3)
);
