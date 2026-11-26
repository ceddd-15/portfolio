/**
 * Zero-Dependency Vector PDF Generator for Downloadable CV
 * Builds a crisp single-page PDF matching the latest CV layout from data/cv.js.
 */

import { CV_DATA } from '../data/cv.js';

function estimateWidth(text, size, bold = false) {
  let w = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === 'i' || ch === 'l' || ch === 'I' || ch === '.' || ch === ',' || ch === ':' || ch === ';' || ch === '|' || ch === ' ') {
      w += 0.28;
    } else if (ch === 'f' || ch === 'j' || ch === 'r' || ch === 't' || ch === '-' || ch === '/') {
      w += 0.34;
    } else if (ch === 'm' || ch === 'w' || ch === 'M' || ch === 'W') {
      w += 0.84;
    } else if (ch >= 'A' && ch <= 'Z') {
      w += 0.68;
    } else if (ch >= '0' && ch <= '9') {
      w += 0.56;
    } else {
      w += 0.52;
    }
  }
  return w * size * (bold ? 1.05 : 1.0);
}

function pdfEscape(str) {
  let out = '';
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i);
    if (str[i] === '\\' || str[i] === '(' || str[i] === ')') {
      out += `\\${str[i]}`;
    } else if (code === 0x2022) {
      out += '\\225';
    } else if (code === 0x2019 || code === 0x2018) {
      out += "'";
    } else if (code === 0x2013 || code === 0x2014) {
      out += '-';
    } else if (code >= 32 && code <= 126) {
      out += str[i];
    } else {
      out += ' ';
    }
  }
  return out;
}

function wrapLines(text, maxWidth, fontSize, bold = false) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (estimateWidth(test, fontSize, bold) <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function buildCvPdfBlob(cv = CV_DATA) {
  const pageW = 612;
  const pageH = 792;
  const margin = 48;
  const contentW = pageW - margin * 2;
  const cmds = [];

  const NAVY = '0.118 0.227 0.541';
  const INK = '0.07 0.07 0.09';
  const RULE = '0.28 0.28 0.32';

  function textAt(font, size, x, y, str, color = INK) {
    cmds.push(`${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(str)}) Tj ET`);
  }

  function centerText(font, size, y, str, color = INK, bold = false) {
    const w = estimateWidth(str, size, bold);
    textAt(font, size, Math.max(margin, (pageW - w) / 2), y, str, color);
  }

  function rightText(font, size, y, str, color = INK, bold = false) {
    const w = estimateWidth(str, size, bold);
    textAt(font, size, pageW - margin - w, y, str, color);
  }

  function hRule(y, width = 0.75) {
    cmds.push(`${RULE} RG ${width} w ${margin} ${y.toFixed(2)} m ${pageW - margin} ${y.toFixed(2)} l S`);
  }

  let y = pageH - 54;

  // Centered Header matching CV PDF
  centerText('F2', 15, y, cv.fullName, NAVY, true);
  y -= 18;
  centerText('F2', 10, y, cv.program, INK, true);
  y -= 15;
  const contactLine = `${cv.contact.email} | ${cv.contact.phone} | ${cv.contact.address}`;
  centerText('F1', 9.5, y, contactLine, INK, false);
  y -= 20;

  // SUMMARY
  textAt('F2', 9.5, margin, y, 'SUMMARY', NAVY);
  y -= 6;
  hRule(y);
  y -= 16;
  for (const line of wrapLines(cv.summary, contentW, 9.5, false)) {
    textAt('F1', 9.5, margin, y, line, INK);
    y -= 14;
  }
  y -= 12;

  // EDUCATION
  textAt('F2', 9.5, margin, y, 'EDUCATION', NAVY);
  y -= 6;
  hRule(y);
  y -= 16;
  for (const edu of cv.education) {
    textAt('F2', 9.5, margin, y, edu.institution, INK);
    rightText('F2', 9.5, y, edu.cvPeriod || edu.period, INK, true);
    y -= 13;
    textAt('F1', 9.5, margin, y, edu.program, INK);
    y -= 15;
    textAt('F1', 9.5, margin, y, edu.metric, INK);
    y -= 20;
  }
  y -= 6;

  // EXPERIENCE
  textAt('F2', 9.5, margin, y, 'EXPERIENCE', NAVY);
  y -= 6;
  hRule(y);
  y -= 16;
  for (const exp of cv.experience) {
    textAt('F2', 9.5, margin, y, `${exp.role} | ${exp.organization}`, NAVY);
    rightText('F2', 9.5, y, exp.period, INK, true);
    y -= 14;
    for (const bullet of exp.bullets) {
      const wrapped = wrapLines(bullet, contentW - 22, 9.5, false);
      wrapped.forEach((bLine, idx) => {
        const prefix = idx === 0 ? '\u2022 ' : '  ';
        textAt('F1', 9.5, margin + 12, y, `${prefix}${bLine}`, INK);
        y -= 13.5;
      });
    }
    y -= 10;
  }
  y -= 6;

  // TECHNICAL SKILLS
  textAt('F2', 9.5, margin, y, 'TECHNICAL SKILLS', NAVY);
  y -= 6;
  hRule(y);
  y -= 16;
  for (const tier of cv.skills) {
    const label = `${tier.category}: `;
    const labelW = estimateWidth(label, 9.5, true);
    const levelStr = tier.level;
    const maxItemsW = contentW - labelW - estimateWidth(levelStr, 9.5, true) - 16;
    const itemLines = wrapLines(tier.items.join(', '), maxItemsW, 9.5, false);

    textAt('F2', 9.5, margin, y, label, INK);
    rightText('F2', 9.5, y, levelStr, INK, true);
    itemLines.forEach((itemLine, idx) => {
      textAt('F3', 9.5, margin + labelW, y, itemLine, INK);
      if (idx < itemLines.length - 1) y -= 13;
    });
    y -= 20;
  }
  hRule(y + 4, 0.75);

  const streamContent = cmds.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>\nendobj\n`,
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n',
    `7 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return new Blob([bytes], { type: 'application/pdf' });
}

export function downloadCvPdf() {
  const blob = buildCvPdfBlob(CV_DATA);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Josh_Cedrick_Corpuz_CV.pdf';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
