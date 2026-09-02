const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\dimam\\.gemini\\antigravity\\brain\\7747de3a-5452-42b3-a569-980ec5eec61e\\.system_generated\\steps\\650\\content.md', 'utf8');

const marker = 'var ytInitialData = ';
const idx = content.indexOf(marker);
if (idx !== -1) {
  const start = idx + marker.length;
  const end = content.indexOf(';</script>', start);
  const jsonStr = content.substring(start, end);
  const data = JSON.parse(jsonStr);

  function findVideos(obj, results = []) {
    if (!obj || typeof obj !== 'object') return results;
    if (obj.videoId && (obj.title || obj.headline)) {
      const title = obj.title?.runs?.[0]?.text || obj.title?.simpleText || obj.headline?.simpleText || JSON.stringify(obj.title);
      results.push({ id: obj.videoId, title });
    }
    for (const key of Object.keys(obj)) {
      findVideos(obj[key], results);
    }
    return results;
  }

  const vids = findVideos(data);
  console.log(`Found ${vids.length} entries:`);
  vids.forEach((v, i) => console.log(`${i + 1}. [${v.id}] ${v.title}`));
}
