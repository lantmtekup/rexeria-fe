/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Usage: npm run generate-module <module-name>');
  process.exit(1);
}

// Validate module name (kebab-case)
if (!/^[a-z][a-z0-9-]*$/.test(moduleName)) {
  console.error(
    'Module name must be in kebab-case (e.g., user-profile, product-catalog)'
  );
  process.exit(1);
}

const moduleDir = path.join(
  process.cwd(),
  'src',
  'components',
  'modules',
  moduleName
);

const appPageDir = path.join(
  process.cwd(),
  'src',
  'app',
  '(web-client)',
  moduleName
);

// Create module directory
if (fs.existsSync(moduleDir)) {
  console.error(`Module '${moduleName}' already exists at ${moduleDir}`);
  process.exit(1);
}

// Check if app page already exists
if (fs.existsSync(appPageDir)) {
  console.error(`App page '${moduleName}' already exists at ${appPageDir}`);
  process.exit(1);
}

try {
  // Create module directory
  fs.mkdirSync(moduleDir, { recursive: true });
  console.log(`✅ Created module directory: ${moduleDir}`);

  // Create app page directory
  fs.mkdirSync(appPageDir, { recursive: true });
  console.log(`✅ Created app page directory: ${appPageDir}`);

  const pascalCaseName =
    moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  // Create basic component files
  const componentFiles = [
    {
      name: 'index.ts',
      content: `// Module: ${moduleName}
        // Export all components from this module

        // Example component export:
        // export { default as ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section } from './${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section';

        // Add your component exports here:
      `,
    },
    {
      name: `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section.tsx`,
      content: `'use client';

import { cn } from '@/lib/cn';
      
// import helpers, utils, logic, constants, hooks, services, etc.
      
// import components, common components, atoms, molecules, organisms, etc.
      
// import types, interfaces, enums, etc.
      
// import medias, images, videos, etc.
      
// import styles, css, etc.
      
interface ${pascalCaseName}SectionProps {
  className?: string;
}
      
function ${pascalCaseName}Section({ className }: ${pascalCaseName}SectionProps) {
  return (
    <section className={cn('py-16', className)}>
      <div className='container mx-auto px-4'>
          <h2 className="text-3xl font-bold text-center mb-8">
            ${pascalCaseName} Section
          </h2>
          <div className='text-center text-gray-600'>
            <p>This is the ${moduleName} section component.</p>
            <p>Customize this component according to your needs.</p>
          </div>
      </div>
    </section>
  );
}

export default ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section;
    `,
    },
  ];

  // Write component files
  componentFiles.forEach(file => {
    const filePath = path.join(moduleDir, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`✅ Created file: ${file.name}`);
  });

  // Update index.ts with the component export
  const indexPath = path.join(moduleDir, 'index.ts');
  const indexContent = `// Module: ${moduleName}
// Export all components from this module

export { default as ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section } from './${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section';

// Add more component exports here as you create them:
`;
  fs.writeFileSync(indexPath, indexContent);

  // Create app page component
  const pageContent = `import { Metadata } from 'next';

import { ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section } from '@/components/modules/${moduleName}';

export const metadata: Metadata = {
  title: '${pascalCaseName} | ${SEO_CONSTANTS.SITE_NAME}',
  description: '${pascalCaseName} description',
};

export default function ${pascalCaseName}Page() {
  return (
    <main className='min-h-scree'>
      <${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section />
    </main>
  );
}
`;

  const pagePath = path.join(appPageDir, 'page.tsx');
  fs.writeFileSync(pagePath, pageContent);
  console.log(`✅ Created app page: ${moduleName}/page.tsx`);

  console.log('\n🎉 Module and page generated successfully!');
  console.log(`📁 Module location: ${moduleDir}`);
  console.log(`📁 App page location: ${appPageDir}`);
  console.log('\n📝 Next steps:');
  console.log(
    `1. Customize the ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Section component`
  );
  console.log('2. Add more components as needed');
  console.log('3. Update the index.ts file with new exports');
  console.log(`4. Access your page at: /${moduleName}`);
  console.log('5. Update metadata in the page component');
} catch (error) {
  console.error('❌ Error creating module and page:', error.message);
  process.exit(1);
}
