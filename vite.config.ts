import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      watch: {
        ignored: [
          '**/Gallery/**',
          '**/Gallery',
          'f:/SID VINYL/SIDDVAULT-main/SIDDVAULT-main/Gallery/**'
        ]
      }
    },
    plugins: [
      react(),
      {
        name: 'save-local-plugin',
        configureServer(server) {
          // Mount middleware globally to intercept all API requests
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/save-local' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk.toString());
              req.on('end', () => {
                try {
                  const parsedBody = JSON.parse(body);
                  const { folderName, metadata } = parsedBody;
                  const galleryPath = 'C:/Users/ADMIN/Downloads/SIDDVAULT-main/SIDDVAULT-main/SIDDVAULT-main/Gallery';
                  const targetDir = path.join(galleryPath, folderName);

                  if (!fs.existsSync(galleryPath)) fs.mkdirSync(galleryPath);
                  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

                  // Write Metadata
                  fs.writeFileSync(path.join(targetDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

                  // Write Images
                  if (parsedBody.images) {
                    const images = parsedBody.images;
                    const folderPrefix = folderName.split('_')[0]; // Extract '029' from '029_Title'

                    for (const [name, base64String] of Object.entries(images)) {
                      if (base64String && typeof base64String === 'string') {
                        // Check if it's a PDF
                        const isPdf = base64String.startsWith('data:application/pdf') || name === 'Full Documentation';
                        const ext = isPdf ? 'pdf' : 'png';

                        // Create filename: PREFIX_Type.ext (e.g., 029_Front Cover.png or 029_Full Documentation.pdf)
                        const fileName = `${folderPrefix}_${name}.${ext}`;

                        // Extract base64 info
                        const base64Data = base64String.split(',')[1];
                        fs.writeFileSync(path.join(targetDir, fileName), Buffer.from(base64Data, 'base64'));

                        // Also save 'cover.png' for system use if this is the Front Cover
                        if (name === 'Front Cover') {
                          fs.writeFileSync(path.join(targetDir, 'cover.png'), Buffer.from(base64Data, 'base64'));
                        }
                      }
                    }
                  } else {
                    // Fallback for legacy calls or single image saves
                    const { coverImage, snapshotImage } = parsedBody;
                    if (coverImage) {
                      const base64Data = coverImage.split(',')[1];
                      fs.writeFileSync(path.join(targetDir, 'cover.png'), Buffer.from(base64Data, 'base64'));
                    }
                    if (snapshotImage) {
                      const base64Data = snapshotImage.split(',')[1];
                      fs.writeFileSync(path.join(targetDir, 'snapshot.png'), Buffer.from(base64Data, 'base64'));
                    }
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, path: targetDir }));
                } catch (e) {
                  console.error('Save failed:', e);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            } else if (req.url === '/api/load-gallery' && req.method === 'GET') {
              const logFile = path.resolve(process.cwd(), 'gallery_debug_log.txt');
              const log = (msg: string) => {
                try {
                  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
                } catch (e) {
                  console.error('Failed to write to log file:', e);
                }
              };

              try {
                // Use process.cwd() because __dirname is not available in ES modules by default
                const galleryPath = 'C:/Users/ADMIN/Downloads/SIDDVAULT-main/SIDDVAULT-main/SIDDVAULT-main/Gallery';
                try {
                  log(`Reading from: ${galleryPath}`);
                } catch (e) { }

                console.log(`[LoadGallery] Reading from: ${galleryPath}`);

                if (!fs.existsSync(galleryPath)) {
                  log(`Creating gallery directory`);
                  fs.mkdirSync(galleryPath);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ records: [], nextId: 1 }));
                  return;
                }

                const records: any[] = [];
                const entries = fs.readdirSync(galleryPath, { withFileTypes: true });
                log(`Found ${entries.length} entries`);

                for (const entry of entries) {
                  if (entry.isDirectory()) {
                    const dirPath = path.join(galleryPath, entry.name);
                    const metadataPath = path.join(dirPath, 'metadata.json');

                    if (fs.existsSync(metadataPath)) {
                      try {
                        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
                        log(`Loaded metadata for ${entry.name}`);

                        const coverPath = path.join(dirPath, 'cover.png');
                        if (fs.existsSync(coverPath)) {
                          const coverBuf = fs.readFileSync(coverPath);
                          if (!metadata.siddvault_metadata) metadata.siddvault_metadata = {};
                          metadata.siddvault_metadata.cover_image = `data:image/png;base64,${coverBuf.toString('base64')}`;
                        } else {
                          log(`No cover for ${entry.name}`);
                        }

                        records.push(metadata);
                      } catch (err) {
                        log(`Error reading record ${entry.name}: ${err.message}`);
                      }
                    } else {
                      log(`No metadata.json for ${entry.name}`);
                    }
                  }
                }

                // Sort records
                records.sort((a, b) => {
                  const titleA = a.core_identity?.album_title || '';
                  const titleB = b.core_identity?.album_title || '';
                  return titleA.localeCompare(titleB);
                });

                // Calculate next ID
                let maxId = 0;
                const folders = entries.filter(e => e.isDirectory()).map(e => e.name);
                for (const folder of folders) {
                  const match = folder.match(/^(\d{3})_/);
                  if (match) {
                    const id = parseInt(match[1], 10);
                    if (!isNaN(id) && id > maxId) maxId = id;
                  }
                }
                const nextId = maxId + 1;

                log(`Sending ${records.length} records, NextID: ${nextId}`);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ records, nextId }));

              } catch (e) {
                const logFile = path.resolve(process.cwd(), 'gallery_debug_log.txt');
                fs.appendFileSync(logFile, `[${new Date().toISOString()}] Load failed: ${e.message}\n`);
                console.error('Load failed:', e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      }
    }
  };
});
