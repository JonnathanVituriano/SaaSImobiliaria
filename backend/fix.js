import fs from 'fs';
import path from 'path';

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace relative imports missing .js
      content = content.replace(/from\s+['"](\.\/|\.\.\/)(.*?)['"]/g, (match, prefix, filePath) => {
        if (!filePath.endsWith('.js') && !filePath.endsWith('.json')) {
          return `from '${prefix}${filePath}.js'`;
        }
        return match;
      });

      // Fix JwtStrategy secretOrKey
      if (fullPath.includes('jwt.strategy.ts')) {
        content = content.replace(
          /secretOrKey: configService\.get<string>\('JWT_SECRET'\)/,
          "secretOrKey: configService.get<string>('JWT_SECRET') as string"
        );
      }

      // Fix JwtAuthGuard types
      if (fullPath.includes('jwt-auth.guard.ts')) {
        content = content.replace(
          /handleRequest\(err, user, info\)/,
          "handleRequest(err: any, user: any, info: any)"
        );
      }

      fs.writeFileSync(fullPath, content);
    }
  }
}

fixImports(path.join(process.cwd(), 'src'));
console.log('Fixed imports and types!');

