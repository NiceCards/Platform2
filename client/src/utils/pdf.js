import { jsPDF } from 'jspdf';

const BRAND = [160, 109, 17];
const DARK = [30, 27, 22];
const GREY = [110, 110, 110];
const LIGHT = [245, 242, 236];

const PAGE = { width: 210, height: 297, margin: 14 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

const STORE_NAME = 'Nice Cards';
const STORE_TAGLINE = 'Printed Cards Marketplace';

/**
 * Formats a number for PDF output. The built-in PDF fonts do not support the
 * rupee glyph, so we use the "Rs." prefix instead.
 */
const money = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const sanitizeFileName = (value) =>
  String(value || 'document')
    .trim()
    .replace(/[^a-z0-9-_ ]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'document';

const formatDate = (value, withTime = true) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return withTime
    ? date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Loads a remote image and converts it to a data URL so it can be embedded in
 * the generated PDF. Returns null when the image cannot be loaded.
 */
const loadImageAsDataUrl = (url) =>
  new Promise((resolve) => {
    if (!url || typeof document === 'undefined') return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

/** Fits an image within a box while preserving its aspect ratio. */
const fitWithin = (img, maxWidth, maxHeight) => {
  const ratio = img.width / img.height || 1;
  let width = maxWidth;
  let height = width / ratio;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }
  return { width, height };
};

const drawStoreHeader = (doc, { title, subtitle, meta = [] }) => {
  const { margin } = PAGE;
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, PAGE.width, 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(STORE_NAME, margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(STORE_TAGLINE, margin, 21.5);

  if (title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, PAGE.width - margin, 14, { align: 'right' });
  }
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(subtitle, PAGE.width - margin, 20, { align: 'right' });
  }

  let y = 26;
  meta.forEach((line) => {
    doc.setFontSize(8.5);
    doc.text(line, PAGE.width - margin, y, { align: 'right' });
    y += 3.6;
  });
};

const drawFooter = (doc) => {
  const { margin } = PAGE;
  const y = PAGE.height - 12;
  doc.setDrawColor(225, 222, 215);
  doc.line(margin, y - 4, PAGE.width - margin, y - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text('Thank you for shopping with Nice Cards.', margin, y);
  doc.text('This is a computer-generated document.', PAGE.width - margin, y, { align: 'right' });
};

const sectionTitle = (doc, text, y) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND);
  doc.text(text, PAGE.margin, y);
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.4);
  doc.line(PAGE.margin, y + 1.6, PAGE.margin + 22, y + 1.6);
  doc.setLineWidth(0.2);
  return y + 7;
};

const detailRow = (doc, label, value, y, { labelWidth = 42 } = {}) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text(`${label}`, PAGE.margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(String(value ?? '-'), CONTENT_WIDTH - labelWidth);
  doc.text(lines, PAGE.margin + labelWidth, y);
  return y + lines.length * 4.8 + 1.2;
};

/**
 * Generates and downloads a PDF containing every detail of a single card.
 * @param {object} product Product/card object from the API.
 * @param {object} [options]
 * @param {string} [options.imageSrc] Absolute image URL to embed.
 */
export const downloadProductPdf = async (product, { imageSrc } = {}) => {
  if (!product) throw new Error('No product supplied');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { margin } = PAGE;

  drawStoreHeader(doc, {
    title: 'PRODUCT DETAILS',
    subtitle: `Generated ${formatDate(new Date())}`,
  });

  const outOfStock = Number(product.stock) <= 0;
  const hasDiscount = Number(product.originalPrice) > Number(product.price);
  const discount = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  let y = 44;

  // Image + headline block
  const imageBox = { x: margin, y, width: 74, height: 60 };
  doc.setFillColor(...LIGHT);
  doc.roundedRect(imageBox.x, imageBox.y, imageBox.width, imageBox.height, 3, 3, 'F');
  doc.setDrawColor(226, 222, 214);
  doc.roundedRect(imageBox.x, imageBox.y, imageBox.width, imageBox.height, 3, 3, 'S');

  const image = await loadImageAsDataUrl(imageSrc);
  if (image) {
    const fitted = fitWithin(image, imageBox.width - 8, imageBox.height - 8);
    doc.addImage(
      image.dataUrl,
      'PNG',
      imageBox.x + (imageBox.width - fitted.width) / 2,
      imageBox.y + (imageBox.height - fitted.height) / 2,
      fitted.width,
      fitted.height
    );
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text('Image unavailable', imageBox.x + imageBox.width / 2, imageBox.y + imageBox.height / 2, {
      align: 'center',
    });
  }

  const infoX = imageBox.x + imageBox.width + 8;
  const infoWidth = PAGE.width - margin - infoX;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  const nameLines = doc.splitTextToSize(product.name || 'Untitled card', infoWidth);
  doc.text(nameLines, infoX, y + 8);
  let infoY = y + 8 + nameLines.length * 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GREY);
  doc.text(product.category?.name || 'Uncategorised', infoX, infoY);
  infoY += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...BRAND);
  doc.text(money(product.price), infoX, infoY);
  infoY += 5.5;

  if (hasDiscount) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...GREY);
    doc.text(`M.R.P. ${money(product.originalPrice)}  (${discount}% off)`, infoX, infoY);
    infoY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(outOfStock ? 190 : 22, outOfStock ? 40 : 130, outOfStock ? 40 : 60);
  doc.text(outOfStock ? 'Out of stock' : `In stock - ${product.stock} available`, infoX, infoY);
  infoY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(
    `Rating: ${product.rating || 0}/5 (${product.numReviews || 0} reviews)`,
    infoX,
    infoY
  );

  y = Math.max(imageBox.y + imageBox.height, infoY) + 10;

  // Product information table
  y = sectionTitle(doc, 'Product information', y);
  y = detailRow(doc, 'Product name', product.name, y);
  y = detailRow(doc, 'Category', product.category?.name || '-', y);
  y = detailRow(doc, 'Brand', product.brand || '-', y);
  y = detailRow(doc, 'SKU', product.sku || '-', y);
  y = detailRow(doc, 'Status', outOfStock ? 'Out of Stock' : 'In Stock', y);
  y = detailRow(doc, 'Stock available', `${product.stock ?? 0}`, y);
  y = detailRow(doc, 'Price', money(product.price), y);
  if (hasDiscount) y = detailRow(doc, 'Original price', money(product.originalPrice), y);
  y = detailRow(doc, 'Rating', `${product.rating || 0} / 5`, y);
  y = detailRow(doc, 'Reviews', `${product.numReviews || 0}`, y);
  y = detailRow(doc, 'Listed on', formatDate(product.createdAt, false), y);
  y = detailRow(doc, 'Last updated', formatDate(product.updatedAt, false), y);

  // Description
  if (product.description) {
    y += 4;
    y = sectionTitle(doc, 'Description', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(product.description, CONTENT_WIDTH);
    doc.text(lines, margin, y);
    y += lines.length * 4.8;
  }

  drawFooter(doc);
  doc.save(`${sanitizeFileName(product.name)}-details.pdf`);
};

/**
 * Generates and downloads a bill/invoice PDF for a particular order.
 * @param {object} order Order object from the API.
 * @param {object} [options]
 * @param {string} [options.billNumber] Override for the bill number.
 */
export const downloadOrderBillPdf = async (order, { billNumber } = {}) => {
  if (!order) throw new Error('No order supplied');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { margin } = PAGE;

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const total = Number(order.total ?? subtotal);

  drawStoreHeader(doc, {
    title: 'TAX INVOICE',
    subtitle: `Bill No: ${billNumber || order.orderId || '-'}`,
    meta: [`Generated ${formatDate(new Date(), false)}`],
  });

  let y = 44;

  // Bill meta + customer
  const leftX = margin;
  const rightX = margin + CONTENT_WIDTH / 2 + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text('BILL TO', leftX, y);
  doc.text('ORDER DETAILS', rightX, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);

  const customerLines = [
    order.customer?.name || '-',
    order.customer?.email || '-',
    order.customer?.phone || '-',
    order.customer?.address || '-',
  ];
  const addressLines = doc.splitTextToSize(customerLines[3], CONTENT_WIDTH / 2 - 6);
  const leftText = [...customerLines.slice(0, 3), ...addressLines];
  doc.text(leftText, leftX, y + 3);

  doc.text(`Order ID: ${order.orderId || '-'}`, rightX, y + 3);
  doc.text(`Order Date: ${formatDate(order.createdAt || order.orderDate)}`, rightX, y + 8.5);
  doc.text(`Status: ${String(order.status || 'pending').replace(/^\w/, (c) => c.toUpperCase())}`, rightX, y + 14);
  doc.text(`Payment: ${order.paymentMethod && order.paymentMethod !== 'none' ? order.paymentMethod : 'Not required'}`, rightX, y + 19.5);
  if (order.deliveredAt) {
    doc.text(`Delivered: ${formatDate(order.deliveredAt)}`, rightX, y + 25);
  }

  y += 3 + leftText.length * 4.8 + 10;

  // Items table
  const columns = [
    { key: 'index', label: '#', x: margin, width: 8, align: 'left' },
    { key: 'name', label: 'Description', x: margin + 8, width: 100, align: 'left' },
    { key: 'price', label: 'Unit Price', x: margin + 108, width: 28, align: 'right' },
    { key: 'qty', label: 'Qty', x: margin + 136, width: 14, align: 'right' },
    { key: 'amount', label: 'Amount', x: margin + 150, width: 32, align: 'right' },
  ];

  doc.setFillColor(...BRAND);
  doc.rect(margin, y, CONTENT_WIDTH, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  columns.forEach((col) => {
    const tx = col.align === 'right' ? col.x + col.width : col.x + 1.5;
    doc.text(col.label, tx, y + 5.4, { align: col.align });
  });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  items.forEach((item, index) => {
    const nameLines = doc.splitTextToSize(item.name || 'Item', columns[1].width - 2);
    const rowHeight = Math.max(8, nameLines.length * 4.6 + 3.5);

    if (index % 2 === 1) {
      doc.setFillColor(...LIGHT);
      doc.rect(margin, y, CONTENT_WIDTH, rowHeight, 'F');
    }

    doc.setTextColor(...DARK);
    doc.text(String(index + 1), margin + 1.5, y + 5.5);
    doc.text(nameLines, columns[1].x + 1.5, y + 5.5);
    doc.text(money(item.price), columns[2].x + columns[2].width, y + 5.5, { align: 'right' });
    doc.text(String(item.quantity ?? 0), columns[3].x + columns[3].width, y + 5.5, { align: 'right' });
    doc.text(money(Number(item.price || 0) * Number(item.quantity || 0)), columns[4].x + columns[4].width, y + 5.5, {
      align: 'right',
    });

    doc.setDrawColor(232, 229, 223);
    doc.line(margin, y + rowHeight, margin + CONTENT_WIDTH, y + rowHeight);
    y += rowHeight;
  });

  // Totals
  y += 4;
  const totalsX = margin + CONTENT_WIDTH - 70;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Subtotal', totalsX, y);
  doc.text(money(subtotal), margin + CONTENT_WIDTH, y, { align: 'right' });
  y += 6;

  doc.setFillColor(...BRAND);
  doc.rect(totalsX - 4, y - 4.5, 74, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('Total', totalsX, y + 1.6);
  doc.text(money(total), margin + CONTENT_WIDTH - 1, y + 1.6, { align: 'right' });
  y += 16;

  // Note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  const note = doc.splitTextToSize(
    'Note: This bill covers a digital product delivered via email. No physical shipment is involved. Please retain this document for your records.',
    CONTENT_WIDTH
  );
  doc.text(note, margin, y);

  drawFooter(doc);
  doc.save(`bill-${sanitizeFileName(order.orderId || 'order')}.pdf`);
};
