import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from 'esbuild';

const root = process.cwd();
const databasePath = path.resolve(root, 'database.json');
const menuPath = path.resolve(root, 'src/data/menuData.ts');
const source = fs.readFileSync(menuPath, 'utf8');
const compiled = transformSync(source, { loader: 'ts', format: 'esm' }).code;
const menuModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));

// Replace only the catalog, keeping orders, offers, reviews and customer data.
database.products = menuModule.OFFICIAL_PRODUCTS;
database.settings = {
  ...database.settings,
  healthySyrupNote: menuModule.HEALTHY_SYRUP_NOTE,
};

fs.writeFileSync(databasePath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
console.log(`Seeded ${database.products.length} menu items.`);
