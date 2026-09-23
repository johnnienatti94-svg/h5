const fs = require('fs');
const path = require('path');

const TOKEN = process.env.FIGMA_ACCESS_TOKEN || '';

async function fetchFigma(endpoint) {
  const res = await fetch(`https://api.figma.com/v1${endpoint}`, {
    headers: { 'X-Figma-Token': TOKEN }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function getFileInfo(fileKey) {
  const data = await fetchFigma(`/files/${fileKey}`);
  return {
    name: data.name,
    lastModified: data.lastModified,
    document: data.document
  };
}

async function exportNodes(fileKey, nodeIds, format = 'png', scale = 2) {
  const idsStr = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
  const data = await fetchFigma(`/images/${fileKey}?ids=${idsStr}&format=${format}&scale=${scale}`);
  return data.images;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'info';
  const fileKey = args[1] || 'oFZ8gc7uqMj6vXCH1gPDLL';

  if (cmd === 'info') {
    getFileInfo(fileKey)
      .then(info => {
        console.log(`\n🎨 Figma File: "${info.name}"`);
        console.log(`🕒 Last Modified: ${info.lastModified}`);
        info.document.children.forEach((page, pIdx) => {
          console.log(`\n📄 Page [${pIdx + 1}]: ${page.name}`);
          page.children.forEach((frame, fIdx) => {
            const b = frame.absoluteBoundingBox || {};
            console.log(`   [${fIdx + 1}] "${frame.name}" (id: ${frame.id}, ${b.width}x${b.height})`);
          });
        });
      })
      .catch(console.error);
  } else if (cmd === 'export') {
    const nodeIds = args[2] || '1:33';
    const format = args[3] || 'png';
    exportNodes(fileKey, nodeIds, format)
      .then(images => {
        console.log('Exported image URLs:', images);
      })
      .catch(console.error);
  }
}

module.exports = { fetchFigma, getFileInfo, exportNodes };
